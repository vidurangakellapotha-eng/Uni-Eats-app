
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { UserRole, Order, MenuItem, OrderStatus, PaymentMethod } from './types';
import { MENU_ITEMS, INITIAL_ORDERS } from './constants';

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
import PaymentMethods from './pages/PaymentMethods';
import OrderHistory from './pages/OrderHistory';
import HelpSupport from './pages/HelpSupport';
import Notifications from './pages/Notifications';

// Components
const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; id: string; name: string } | null>(null);

  // Initialize from localStorage or use defaults
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('uni-eats-orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('uni-eats-menu');
    return saved ? JSON.parse(saved) : MENU_ITEMS;
  });

  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('uni-eats-orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('uni-eats-menu', JSON.stringify(menuItems));
  }, [menuItems]);

  const navigate = useNavigate();

  const handleLogin = (role: UserRole, id: string) => {
    // Always Student now
    const name = 'John Doe';
    setCurrentUser({ role: UserRole.STUDENT, id, name });
    navigate('/menu');
  };

  const handleLogout = () => {
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

  const handlePlaceOrder = (paymentMethod: PaymentMethod) => {
    const itemsToOrder = (Object.entries(cart) as [string, number][]).map(([id, qty]) => {
      const item = menuItems.find(m => m.id === id)!;
      return {
        menuItemId: item.id,
        name: item.name,
        quantity: qty,
        price: item.price
      };
    });

    if (itemsToOrder.length === 0) return;

    const newOrder: Order = {
      id: `RAW-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser?.id || 'GUEST',
      userName: currentUser?.name || 'Guest User',
      userType: currentUser?.role === UserRole.STUDENT ? 'Student' : 'Staff',
      items: itemsToOrder,
      total: itemsToOrder.reduce((acc, item) => acc + item.price * item.quantity, 0),
      status: OrderStatus.PLACED,
      paymentMethod: paymentMethod,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setOrders([newOrder, ...orders]);
    setActiveOrder(newOrder);
    setCart({}); // Clear cart after ordering
    navigate('/order-status');
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (activeOrder?.id === orderId) {
      setActiveOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => item.id === itemId ? { ...item, available: !item.available } : item));
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/forgot-pin" element={<ForgotPin />} />

      <Route
        path="/account"
        element={
          currentUser
            ? <Account user={currentUser} onLogout={handleLogout} />
            : <Navigate to="/" />
        }
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
        element={
          currentUser?.role === UserRole.STUDENT
            ? <CustomerMenu menuItems={menuItems} cart={cart} onUpdateCart={updateCart} />
            : <Navigate to="/" />
        }
      />
      <Route
        path="/cart"
        element={
          currentUser?.role === UserRole.STUDENT
            ? <Cart menuItems={menuItems} cart={cart} onUpdateCart={updateCart} onCheckout={handlePlaceOrder} />
            : <Navigate to="/" />
        }
      />
      <Route
        path="/order-status"
        element={
          currentUser?.role === UserRole.STUDENT
            ? <OrderStatusPage order={activeOrder} onCancel={(id) => updateOrderStatus(id, OrderStatus.REJECTED)} />
            : <Navigate to="/" />
        }
      />





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
