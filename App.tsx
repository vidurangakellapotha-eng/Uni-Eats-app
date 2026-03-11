
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, Order, MenuItem, OrderStatus, PaymentMethod } from './types';
import { MENU_ITEMS } from './constants';
import { db, auth } from './firebase';
import {
  collection, addDoc, onSnapshot, updateDoc, doc, getDocs, serverTimestamp, query, orderBy, where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

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

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; id: string; name: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [toast, setToast] = useState<{ msg: string; icon: string; color: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevOrderStatusRef = useRef<string | null>(null);

  // Helper: write a notification to Firestore + show toast
  const pushNotification = async (
    userId: string,
    title: string,
    message: string,
    type: string,
    icon: string,
    color: string,
    orderId?: string
  ) => {
    // Show toast
    setToast({ msg: title, icon, color });
    setTimeout(() => setToast(null), 4000);
    // Write to Firestore (unreadCount updates automatically via subscription below)
    try {
      await addDoc(collection(db, 'notifications'), {
        userId, title, message, type, orderId: orderId || '', read: false,
        createdAt: serverTimestamp(),
      });
    } catch (_) { /* silently fail */ }
  };

  // Subscribe to unread notification count from Firestore for the bell badge
  useEffect(() => {
    if (!currentUser) { setUnreadCount(0); return; }
    const q = query(collection(db, 'notifications'), where('userId', '==', currentUser.id));
    const unsubscribe = onSnapshot(q, (snap) => {
      const count = snap.docs.filter(d => d.data().read === false).length;
      setUnreadCount(count);
    }, () => {});
    return () => unsubscribe();
  }, [currentUser?.id]);

  const navigate = useNavigate();

  // --- Firebase Auth listener: auto-restores session after refresh/re-login ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        // Real authenticated user — restore session automatically
        const name = firebaseUser.displayName || firebaseUser.email || 'Student';
        setCurrentUser({ role: UserRole.STUDENT, id: firebaseUser.uid, name });
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
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: Order[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(fetched);

      const savedOrderId = localStorage.getItem('unieats_active_order_id');
      if (savedOrderId) {
        const savedOrder = fetched.find(o => o.id === savedOrderId);
        if (savedOrder) {
          const prevStatus = prevOrderStatusRef.current;
          const newStatus = savedOrder.status;
          const shortId = savedOrder.id.slice(-6).toUpperCase();

          // Detect status change and send notification
          if (prevStatus !== null && prevStatus !== newStatus) {
            const userId = savedOrder.userId;
            if (newStatus === OrderStatus.PREPARING) {
              pushNotification(userId, '👨‍🍳 Being Prepared!', `Order #${shortId} is now being prepared by the kitchen.`, 'order', 'restaurant', '#F59E0B', savedOrder.id);
            } else if (newStatus === OrderStatus.READY) {
              pushNotification(userId, '🛍 Ready for Pickup!', `Order #${shortId} is ready! Head to the counter now.`, 'ready', 'shopping_bag', '#10B981', savedOrder.id);
            } else if (newStatus === OrderStatus.COMPLETED) {
              pushNotification(userId, '✅ Order Completed!', `Order #${shortId} has been collected. Rate your meal!`, 'completed', 'check_circle', '#6366F1', savedOrder.id);
            } else if (newStatus === OrderStatus.REJECTED) {
              pushNotification(userId, '❌ Order Rejected', `Sorry, order #${shortId} was rejected by the kitchen.`, 'alert', 'cancel', '#EF4444', savedOrder.id);
            }
          }
          prevOrderStatusRef.current = newStatus;

          if (newStatus === OrderStatus.COMPLETED) {
            localStorage.setItem('unieats_rating_order', JSON.stringify(savedOrder));
            localStorage.removeItem('unieats_active_order_id');
            setActiveOrder(null);
            navigate('/rate-order');
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

    const newOrderData = {
      userId: currentUser?.id || 'GUEST',
      userName: currentUser?.name || 'Guest User',
      userType: 'Student',
      items: itemsToOrder,
      total,
      status: OrderStatus.PLACED,
      paymentMethod,
      cardId,
      // Store max prepTime across all ordered items
      prepTime: Math.max(...itemsToOrder.map(i => {
        const menuItem = menuItems.find(m => m.id === i.menuItemId);
        return menuItem?.prepTime ?? 10;
      })),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), newOrderData);
      localStorage.setItem('unieats_active_order_id', docRef.id);
      prevOrderStatusRef.current = OrderStatus.PLACED; // Set initial status for tracking
      const tempOrder: Order = { id: docRef.id, ...newOrderData } as Order;
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
    } catch (err) {
      console.error('Failed to place order:', err);
      alert('Failed to place order. Please try again.');
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

  return (
    <>
      {/* Toast Notification Overlay */}
      {toast && (
        <div
          style={{
            position: 'fixed', top: '60px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 9999, maxWidth: '380px', width: '90%',
            background: 'white', borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            padding: '14px 18px',
            display: 'flex', alignItems: 'center', gap: '12px',
            borderLeft: `4px solid ${toast.color}`,
            animation: 'slideDown 0.3s ease'
          }}
        >
          <span className="material-icons-round" style={{ color: toast.color, fontSize: '22px' }}>{toast.icon}</span>
          <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', flex: 1 }}>{toast.msg}</span>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <span className="material-icons-round" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      )}
      <style>{`@keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`}</style>
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
          ? <CustomerMenu menuItems={menuItems} cart={cart} onUpdateCart={updateCart} unreadCount={unreadCount} onClearUnread={() => setUnreadCount(0)} />
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

      {/* Rating Route — reads order from localStorage, no auth guard needed */}
      <Route
        path="/rate-order"
        element={(() => {
          const raw = localStorage.getItem('unieats_rating_order');
          if (!raw) return <Navigate to="/" />;
          const ord = JSON.parse(raw) as Order;
          return <RateOrderPage
            orderId={ord.id}
            items={ord.items}
            userId={currentUser?.id || ord.userId}
            userName={currentUser?.name || ord.userName}
          />;
        })()}
      />

      {/* Admin Route */}
      <Route path="/admin" element={<AdminOrders />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="max-w-[430px] mx-auto bg-white dark:bg-zinc-900 min-h-screen shadow-2xl relative overflow-x-hidden">
        <AppContent />
      </div>
    </Router>
  );
};

export default App;
