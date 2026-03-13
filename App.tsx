
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { UserRole, Order, MenuItem, OrderStatus, PaymentMethod } from './types';
import './index.css';
import { MENU_ITEMS } from './constants';
import { db, auth } from './firebase';
import {
  collection, addDoc, onSnapshot, updateDoc, doc, getDocs, getDoc, serverTimestamp, query, orderBy, where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Toast from './components/ui/Toast';
import { useNotifications } from './hooks/useNotifications';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Pages
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import CustomerMenu from './pages/CustomerMenu';
import OrderStatusPage from './pages/OrderStatus';
import Account from './pages/Account';
import Cart from './pages/Cart';
import ProfileSettings from './pages/ProfileSettings';
import NotificationSettings from './pages/NotificationSettings';
import PrivacySettings from './pages/PrivacySettings';
import ForgotPin from './pages/ForgotPin';
import AdminOrders from './pages/AdminOrders';
import PaymentMethods from './pages/PaymentMethods';
import OrderHistory from './pages/OrderHistory';
import HelpSupport from './pages/HelpSupport';
import Notifications from './pages/Notifications';
import RateOrderPage from './pages/RateOrder';
import SupportChat from './pages/SupportChat';

// Dedicated wrapper guarantees delayed reading of local storage when route renders
const RateOrderWrapper = ({ currentUser }: { currentUser: any }) => {
  const raw = localStorage.getItem('unieats_rating_order');
  if (!raw) return <Navigate to="/" />;
  const ord = JSON.parse(raw) as Order;
  return (
    <RateOrderPage
      orderId={ord.id}
      items={ord.items}
      userId={currentUser?.id || ord.userId}
      userName={currentUser?.name || ord.userName}
    />
  );
};

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; id: string; name: string; photoURL?: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ msg: string; icon: string; color: string; path?: string } | null>(null);
  const prevOrderStatusRef = useRef<string | null>(null);
  const { unreadCount, hasUnreadChat, latestNotification } = useNotifications(currentUser?.id);

  const pushNotification = async (
    userId: string,
    title: string,
    message: string,
    type: string,
    icon: string,
    color: string,
    orderId?: string
  ) => {
    setToast({ msg: title, icon, color, path: orderId ? '/order-status' : '/notifications' });
    setTimeout(() => setToast(null), 4000);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId, title, message, type, orderId: orderId || '', read: false,
        createdAt: serverTimestamp(),
      });
    } catch (_) { }
  };

  useEffect(() => {
    console.log("%c Uni-Eats Design System v2.0 Active ", "background: #78350f; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;");
    if (latestNotification) {
      setToast({ 
        msg: latestNotification.title, 
        icon: latestNotification.icon || 'notifications', 
        color: latestNotification.color || '#6366F1',
        path: latestNotification.type === 'order' ? '/order-status' : '/notifications'
      });
      setTimeout(() => setToast(null), 4000);
    }
  }, [latestNotification]);
  

  const navigate = useNavigate();
  const location = useLocation();

  // --- Firebase Auth listener: auto-restores session after refresh/re-login ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        // Security check: If they are an admin, they shouldn't be here
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        const OWNER_EMAIL = 'vidurangakellapotha@gmail.com';
        if (adminDoc.exists() && firebaseUser.email !== OWNER_EMAIL) {
          console.warn("Admin detected on student app. Signing out.");
          await signOut(auth);
          setCurrentUser(null);
          setAuthLoading(false);
          return;
        }

        // Real authenticated user — restore session automatically
        const name = firebaseUser.displayName || firebaseUser.email || 'Student';
        setCurrentUser({ 
          role: UserRole.STUDENT, 
          id: firebaseUser.uid, 
          name, 
          photoURL: firebaseUser.photoURL || undefined 
        });
        localStorage.setItem('unieats_user_id', firebaseUser.uid); // Keep in sync for notifications
      } else if (!firebaseUser) {
        setCurrentUser(null);
        localStorage.removeItem('unieats_user_id');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- After auth restores, navigate to order-status if there's a saved order ---
  const [navChecked, setNavChecked] = useState(false);
  useEffect(() => {
    if (!authLoading && !navChecked) {
      setNavChecked(true);
      if (currentUser) {
        const savedOrderId = localStorage.getItem('unieats_active_order_id');
        if (savedOrderId) {
          navigate('/order-status');
        }
      }
    }
  }, [authLoading, currentUser, navChecked]);

  // --- Real-time orders listener from Firestore ---
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetched: Order[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(fetched);

      const savedOrderId = localStorage.getItem('unieats_active_order_id');
      if (savedOrderId) {
        const savedOrder = fetched.find(o => o.id === savedOrderId);
        if (savedOrder) {
          const prevStatus = prevOrderStatusRef.current;
          const newStatus = savedOrder.status;
          const shortId = savedOrder.id.slice(-6).toUpperCase();

          // Detect status change and send notification locally
          if (prevStatus !== null && prevStatus !== newStatus) {
            const shortId = savedOrder.id.slice(-6).toUpperCase();
            let nTitle = '';
            let nIcon = 'notifications';
            let nColor = '#6366F1';

            if (newStatus === OrderStatus.PREPARING) {
              await pushNotification(
                currentUser.id,
                '👨‍🍳 Being Prepared!',
                `Your order #${shortId} is now being prepared by the kitchen and will be ready soon.`,
                'order', 'restaurant', '#F59E0B', savedOrder.id
              );
            } else if (newStatus === OrderStatus.READY) {
              await pushNotification(
                currentUser.id,
                '🛍 Ready for Pickup!',
                `Order #${shortId} is hot and ready. Head to the counter to collect your meal!`,
                'ready', 'shopping_bag', '#10B981', savedOrder.id
              );
            } else if (newStatus === OrderStatus.COMPLETED) {
              await pushNotification(
                currentUser.id,
                '✅ Order Completed!',
                `Enjoy your meal! Order #${shortId} has been successfully completed.`,
                'completed', 'check_circle', '#6366F1', savedOrder.id
              );
            } else if (newStatus === OrderStatus.REJECTED) {
              await pushNotification(
                currentUser.id,
                '❌ Order Rejected',
                `We're sorry! Order #${shortId} has been rejected. Please check with the counter or try again.`,
                'alert', 'cancel', '#EF4444', savedOrder.id
              );
            }
          }
          prevOrderStatusRef.current = newStatus;

          if (newStatus === OrderStatus.COMPLETED) {
            // Keep the active order state live for 2 seconds so the completion UI has time to render 
            setActiveOrder(savedOrder);
            setTimeout(() => {
              localStorage.setItem('unieats_rating_order', JSON.stringify(savedOrder));
              localStorage.removeItem('unieats_active_order_id');
              setActiveOrder(null);
              navigate('/rate-order');
            }, 2500);
          } else if (newStatus === OrderStatus.REJECTED) {
            localStorage.removeItem('unieats_active_order_id');
            setActiveOrder(null);
          } else {
            setActiveOrder(savedOrder);
          }
        }
      } else {
        setActiveOrder(prev => {
          if (!prev) return prev;
          const updated = fetched.find(o => o.id === prev.id);
          if (updated && (updated.status === OrderStatus.REJECTED || updated.status === OrderStatus.COMPLETED)) {
            return null;
          }
          return updated ?? prev;
        });
      }
    }, (err) => {
      console.warn('Firestore orders listener error:', err);
    });
    return () => unsubscribe();
  }, []);


  // --- Try to fetch menu from Firestore, fallback to constants ---
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'menu'));
        if (!snapshot.empty) {
          const items: MenuItem[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MenuItem));
          setMenuItems(items);
        }
      } catch (err) {
        console.warn('Could not load menu from Firestore, using local data.', err);
      }
    };
    fetchMenu();
  }, []);

  const handleLogin = (role: UserRole, id: string, name: string) => {
    setCurrentUser({ role: UserRole.STUDENT, id, name });
    localStorage.setItem('unieats_user_id', id); // Store for Notifications page
    const savedOrderId = localStorage.getItem('unieats_active_order_id');
    setTimeout(() => {
      navigate(savedOrderId ? '/order-status' : '/menu');
    }, 0);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth); // Properly sign out from Firebase
    } catch (err) {
      console.warn('Sign out error:', err);
    }
    setCurrentUser(null);
    setActiveOrder(null);
    setCart({});
    navigate('/');
  };

  const updateCart = (itemId: string, delta: number) => {
    setCart(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const newCart = { ...prev };
      if (newQty === 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = newQty;
      }
      return newCart;
    });
  };

  const handlePlaceOrder = async (paymentMethod: PaymentMethod, cardId?: string) => {
    const itemsToOrder = (Object.entries(cart) as [string, number][]).map(([id, qty]) => {
      const item = menuItems.find(m => m.id === id)!;
      return { menuItemId: item.id, name: item.name, quantity: qty, price: item.price };
    });

    if (itemsToOrder.length === 0) return;

    const total = itemsToOrder.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const newOrderData: any = {
      userId: currentUser?.id || 'GUEST',
      userName: currentUser?.name || 'Guest User',
      userType: 'Student',
      items: itemsToOrder,
      total,
      status: OrderStatus.PLACED,
      paymentMethod,
      // Store max prepTime across all ordered items
      prepTime: Math.max(...itemsToOrder.map(i => {
        const menuItem = menuItems.find(m => m.id === i.menuItemId);
        return menuItem?.prepTime ?? 10;
      })),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp(),
    };

    // Only include cardId if it's provided (Firestore doesn't allow undefined)
    if (cardId) {
      newOrderData.cardId = cardId;
    }

    try {
      // Final safety sweep: Remove any undefined fields to prevent Firestore crashes
      const cleanedOrderData = Object.fromEntries(
        Object.entries(newOrderData).filter(([_, v]) => v !== undefined)
      );

      const docRef = await addDoc(collection(db, 'orders'), cleanedOrderData);
      localStorage.setItem('unieats_active_order_id', docRef.id);
      prevOrderStatusRef.current = OrderStatus.PLACED; 
      const tempOrder: Order = { id: docRef.id, ...cleanedOrderData } as Order;
      setActiveOrder(tempOrder);
      setCart({});
      // Notify: order placed
      if (currentUser) {
        pushNotification(
          currentUser.id,
          '🧾 Order Placed!',
          `Your order #${docRef.id.slice(-6).toUpperCase()} has been received. We'll notify you when it's being prepared.`,
          'order', 'receipt_long', '#78350F', docRef.id
        );
      }
      navigate('/order-status');
    } catch (err: any) {
      console.error('Failed to place order:', err);
      alert(`[V1.3] Failed to place order: ${err.message || 'Unknown error'}. Please check your internet connection or try again.`);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const toggleAvailability = async (itemId: string) => {
    setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, available: !item.available } : item));
    try {
      const item = menuItems.find(m => m.id === itemId);
      if (item) {
        await updateDoc(doc(db, 'menu', itemId), { available: !item.available });
      }
    } catch (err) {
      // Silently fail if menu items aren't in Firestore yet
    }
  };

  // Show loading spinner while Firebase restores auth session
  if (authLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-900">
        <span className="material-icons-round text-5xl text-primary animate-spin mb-3 opacity-60">sync</span>
        <p className="text-slate-400 text-sm">Loading Uni Eats...</p>
      </div>
    );
  }

  const cartCount = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);
  return (
    <div className="app-root-layout app-gradient-bg flex min-h-screen">
      <style>{`
        .app-root-layout { display: flex !important; flex-direction: row !important; min-height: 100vh !important; }
        .desktop-sidebar { display: flex !important; width: 288px !important; min-width: 288px !important; height: 100vh !important; position: sticky !important; top: 0 !important; }
        .main-view-container { flex: 1 !important; min-width: 0 !important; display: flex !important; flex-direction: column !important; }
        @media (max-width: 640px) {
          .desktop-sidebar { display: none !important; }
          .app-root-layout { flex-direction: column !important; padding-bottom: 80px !important; }
          .mobile-only-header { display: flex !important; }
          .mobile-only-navbar { display: flex !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100vw !important; z-index: 9999 !important; }
        }
        @media (min-width: 641px) {
          .mobile-only-header, .mobile-only-navbar { display: none !important; }
        }
      `}</style>
      <div className="desktop-sidebar">
        <Sidebar 
          unreadCount={unreadCount} 
          cartCount={cartCount}
          hasUnreadSupport={hasUnreadChat}
          userName={currentUser?.name}
          photoURL={currentUser?.photoURL}
          onLogout={handleLogout}
        />
      </div>

      <div className="main-view-container flex-1 flex flex-col min-h-screen relative max-w-full overflow-hidden">
        {/* Responsive Header (Visible on tablet/mobile, hidden when Sidebar is active on desktop) */}
        {currentUser && currentUser.role === UserRole.STUDENT && (
          <div className="mobile-only-header">
            <Header 
              unreadCount={unreadCount} 
              cartCount={cartCount} 
              userName={currentUser.name}
              hasUnreadSupport={hasUnreadChat}
            />
          </div>
        )}

        {/* Toast Notification Overlay */}
        {toast && (
          <Toast 
            message={toast.msg} 
            icon={toast.icon} 
            color={toast.color} 
            onClose={() => setToast(null)} 
            onClick={() => {
              if (toast.path) {
                navigate(toast.path);
                setToast(null);
              }
            }}
          />
        )}

        <div className="flex-1">
          <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/forgot-pin" element={<ForgotPin />} />

      <Route
        path="/account"
        element={currentUser ? <Account user={currentUser} onLogout={handleLogout} /> : <Navigate to="/" />}
      />
      <Route path="/account/profile" element={<ProfileSettings />} />
      <Route path="/account/notifications" element={<NotificationSettings />} />
      <Route path="/account/privacy" element={<PrivacySettings />} />
      <Route path="/account/payment" element={<PaymentMethods />} />
      <Route path="/account/history" element={<OrderHistory />} />
      <Route path="/account/support" element={<HelpSupport />} />
      <Route path="/account/support/chat" element={<SupportChat />} />
      <Route path="/notifications" element={<Notifications userId={currentUser?.id} />} />

      {/* Public Route */}
      <Route
        path="/public-menu"
        element={<CustomerMenu menuItems={menuItems} cart={{}} onUpdateCart={() => { }} readOnly={true} />}
      />

      {/* Student Routes */}
      <Route
        path="/menu"
        element={currentUser?.role === UserRole.STUDENT
          ? <CustomerMenu menuItems={menuItems} cart={cart} onUpdateCart={updateCart} unreadCount={unreadCount} onClearUnread={() => {}} hasUnreadSupport={hasUnreadChat} />
          : <Navigate to="/" />}
      />
      <Route
        path="/cart"
        element={currentUser?.role === UserRole.STUDENT
          ? <Cart menuItems={menuItems} cart={cart} onUpdateCart={updateCart} onCheckout={handlePlaceOrder} />
          : <Navigate to="/" />}
      />
      <Route
        path="/order-status"
        element={currentUser?.role === UserRole.STUDENT
          ? <OrderStatusPage order={activeOrder} onCancel={(id) => updateOrderStatus(id, OrderStatus.REJECTED)} />
          : <Navigate to="/" />}
      />

      {/* Rating Route — cleanly reads from localStorage ONLY when actively navigating to it */}
      <Route
        path="/rate-order"
        element={<RateOrderWrapper currentUser={currentUser} />}
      />

      {/* Admin Route */}
      <Route path="/admin" element={<AdminOrders />} />

      </Routes>
        </div>
      </div>

      {/* Persistent Bottom Navbar (Mobile only) - Moved to Root for Full Width */}
      {currentUser && currentUser.role === UserRole.STUDENT && 
       location.pathname !== '/' && location.pathname !== '/login' && (
        <div className="mobile-only-navbar">
          <Navbar 
            hasUnreadSupport={hasUnreadChat} 
            photoURL={currentUser?.photoURL}
          />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen relative overflow-x-hidden">
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
