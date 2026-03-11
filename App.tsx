
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, Order, MenuItem, OrderStatus, PaymentMethod } from './types';
import { MENU_ITEMS } from './constants';
import { db, auth } from './firebase';
import {
  collection, addDoc, onSnapshot, updateDoc, doc, getDocs, serverTimestamp, query, orderBy
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

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; id: string; name: string } | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // Wait for Firebase to restore auth
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});

  const navigate = useNavigate();

  // --- Firebase Auth listener: auto-restores session after refresh/re-login ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser && !firebaseUser.isAnonymous) {
        // Real authenticated user — restore session automatically
        const name = firebaseUser.displayName || firebaseUser.email || 'Student';
        setCurrentUser({ role: UserRole.STUDENT, id: firebaseUser.uid, name });
      } else if (!firebaseUser) {
        setCurrentUser(null);
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

      // Keep activeOrder in sync when admin updates status
      const savedOrderId = localStorage.getItem('unieats_active_order_id');
      if (savedOrderId) {
        const savedOrder = fetched.find(o => o.id === savedOrderId);
        if (savedOrder) {
          if (savedOrder.status === OrderStatus.COMPLETED || savedOrder.status === OrderStatus.REJECTED) {
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
    // currentUser is set by onAuthStateChanged automatically from Firebase auth
    // Just navigate — Firebase listener will have already set currentUser or will shortly
    setCurrentUser({ role: UserRole.STUDENT, id, name });
    const savedOrderId = localStorage.getItem('unieats_active_order_id');
    // Use setTimeout(0) to let React commit state before navigate runs route guards
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

  const handlePlaceOrder = async (paymentMethod: PaymentMethod) => {
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), newOrderData);
      // Save orderId to localStorage so it persists across logout/refresh
      localStorage.setItem('unieats_active_order_id', docRef.id);
      const tempOrder: Order = { id: docRef.id, ...newOrderData } as Order;
      setActiveOrder(tempOrder);
      setCart({});
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
      <Route path="/notifications" element={<Notifications />} />

      {/* Public Route */}
      <Route
        path="/public-menu"
        element={<CustomerMenu menuItems={menuItems} cart={{}} onUpdateCart={() => { }} readOnly={true} />}
      />

      {/* Student Routes */}
      <Route
        path="/menu"
        element={currentUser?.role === UserRole.STUDENT
          ? <CustomerMenu menuItems={menuItems} cart={cart} onUpdateCart={updateCart} />
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

      {/* Admin Route */}
      <Route path="/admin" element={<AdminOrders />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
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
