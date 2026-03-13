
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import StatusBar from '../components/layout/StatusBar';
import Navbar from '../components/layout/Navbar';

interface OrderStatusPageProps {
  order: Order | null;
  onCancel: (orderId: string) => void;
}

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({ order: propOrder, onCancel }) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(propOrder);
  const [loading, setLoading] = useState(false);

  // Fetch directly from Firestore using localStorage orderId or propOrder.id
  // Utilizing a real-time listener ensures the UI always syncs instantly without refreshing
  useEffect(() => {
    const targetOrderId = propOrder?.id || localStorage.getItem('unieats_active_order_id');

    if (!targetOrderId) {
        if (propOrder) {
             setOrder(propOrder);
        }
        return;
    }

    setLoading(!propOrder); // Only load if we don't have initial data

    const unsubscribe = onSnapshot(doc(db, 'orders', targetOrderId), (docSnap) => {
      if (docSnap.exists()) {
        const fetchedOrder = { id: docSnap.id, ...docSnap.data() } as Order;
        setOrder(fetchedOrder);
        // App.tsx handles COMPLETED → /rate-order. Just handle REJECTED here.
        if (fetchedOrder.status === OrderStatus.REJECTED) {
          localStorage.removeItem('unieats_active_order_id');
          setOrder(null);
          navigate('/menu');
        }
      } else {
        localStorage.removeItem('unieats_active_order_id');
        setOrder(null);
        navigate('/menu');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [propOrder?.id, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
        <span className="material-icons-round text-5xl text-primary mb-4 animate-spin opacity-60">sync</span>
        <p className="text-slate-500 text-sm">Loading your order...</p>
      </div>
    );
  }

  if (!order || order.status === OrderStatus.REJECTED) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-10 text-center">
        <span className="material-icons-round text-6xl text-slate-200 mb-4">shopping_cart_checkout</span>
        <h2 className="text-xl font-bold">No Active Order</h2>
        <p className="text-slate-500 text-sm mt-2">You haven't placed an order recently.</p>
        <button onClick={() => navigate('/menu')} className="mt-6 text-primary font-bold underline">Back to Menu</button>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', desc: "We've received your order and payment", icon: 'check', status: OrderStatus.PLACED },
    { label: 'Preparing', desc: 'The chef is preparing your meal with care', icon: 'restaurant', status: OrderStatus.PREPARING },
    { label: 'Ready for Pickup', desc: 'Head to Counter A to collect your tray', icon: 'shopping_bag', status: OrderStatus.READY },
  ];

  const currentStatusIndex = steps.findIndex(s => s.status === order.status);
  const activeIndex = currentStatusIndex === -1 ? 0 : currentStatusIndex;

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark overflow-y-auto hide-scrollbar">
      <StatusBar />

      <header className="px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/menu')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-zinc-800">
          <span className="material-icons-outlined text-primary">arrow_back_ios_new</span>
        </button>
        <h1 className="text-lg font-bold text-primary dark:text-white">Order Status</h1>
        <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-zinc-800">
          <span className="material-icons-outlined text-primary">help_outline</span>
        </button>
      </header>

      <main className="flex-1 px-6 pb-24">

        {/* READY: Prominent pickup banner at the top */}
        {order.status === OrderStatus.READY && (
          <div className="mt-4 p-5 bg-green-50 dark:bg-green-900/20 rounded-3xl border-2 border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <span className="material-icons-round text-white text-xl">shopping_bag</span>
              </div>
              <div>
                <p className="font-black text-green-700 dark:text-green-400 text-base">Your order is ready! 🎉</p>
                <p className="text-xs text-green-600 dark:text-green-500">Show this screen at the pickup counter</p>
              </div>
            </div>
            {/* Receipt-style items list */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                Order #{order.id.slice(-6).toUpperCase()}
              </p>
              {(order.items || []).length === 0 ? (
                <p className="text-sm text-slate-400">No items found</p>
              ) : (
                (order.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-black flex items-center justify-center">
                        {item.quantity}×
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-white">{item.name || 'Item'}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      LKR {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
              <div className="pt-3 mt-1 border-t border-slate-100 dark:border-zinc-700 flex justify-between items-center">
                <span className="font-black text-slate-900 dark:text-white text-sm">Total</span>
                <span className="font-black text-primary text-lg">LKR {(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Order header card */}
        <div className="mt-4 p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Current Order</p>
              <h2 className="text-3xl font-black text-primary dark:text-white mt-1">#{(order.id || '').slice(-6).toUpperCase()}</h2>
            </div>
            <div className={`px-4 py-1.5 rounded-full ${order.status === OrderStatus.PREPARING ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' :
              order.status === OrderStatus.READY ? 'bg-green-50 dark:bg-green-900/20 text-green-600' :
                'bg-slate-100 dark:bg-zinc-800 text-slate-500'
              }`}>
              <span className="text-xs font-black uppercase tracking-wider">{order.status}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Placed today at {order.timestamp} • Paid via <span className="text-primary font-bold">{order.paymentMethod}</span></p>
        </div>

        <div className="mt-10 space-y-10 relative">
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100 dark:bg-zinc-800"></div>

          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            return (
              <div key={step.label} className={`relative flex items-start ${!isActive && !isCompleted ? 'opacity-40' : ''}`}>
                <div className={`z-10 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-8 ring-background-light dark:ring-background-dark ${isActive || isCompleted ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'
                  } ${isActive ? 'animate-pulse' : ''}`}>
                  <span className="material-icons-round text-xl">{isCompleted ? 'check' : step.icon}</span>
                </div>
                <div className="ml-5">
                  <h3 className={`font-bold ${isActive ? 'text-primary dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}`}>{step.label}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
                  {isActive && step.status === OrderStatus.PREPARING && (
                    <div className="mt-4">
                      <div className="w-48 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full animate-[progress_3s_infinite]" style={{ width: '66%' }}></div>
                      </div>
                      <p className="text-xs font-bold text-primary dark:text-amber-400 mt-2.5">
                        {order.prepTime
                          ? `⏱ Est. ${order.prepTime} min${order.prepTime !== 1 ? 's' : ''} to prepare`
                          : '⏱ Est. 5–10 mins to prepare'}
                      </p>
                    </div>
                  )}
                  {isActive && step.status === OrderStatus.PLACED && order.prepTime && (
                    <p className="text-xs text-slate-400 mt-1.5">
                      ⏱ Estimated prep time: <span className="font-bold text-primary">{order.prepTime} min{order.prepTime !== 1 ? 's' : ''}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Items (always show, hidden at READY since it's already in the pickup card above) */}
        {order.status !== OrderStatus.READY && (
          <div className="mt-12 bg-slate-50 dark:bg-zinc-900/50 rounded-3xl p-6 border border-slate-100 dark:border-zinc-800">
            <h4 className="text-xs font-black text-primary dark:text-slate-400 mb-5 uppercase tracking-widest border-b border-slate-200 dark:border-zinc-800 pb-3">Order Items</h4>
            <div className="space-y-4">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.quantity}x {item.name || 'Item'}</span>
                  <span className="font-bold text-primary dark:text-white">LKR {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-4 flex justify-between items-center border-t border-slate-200 dark:border-zinc-800">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Total Paid</span>
                <span className="font-black text-lg text-primary dark:text-white">LKR {(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-start p-5 bg-primary/5 dark:bg-white/5 rounded-2xl border border-primary/10">
          <span className="material-icons-round text-primary dark:text-amber-500 mr-3">info</span>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
            Please show your digital receipt <span className="font-bold text-primary dark:text-white">#{(order.id || '').slice(-6).toUpperCase()}</span> at the pickup counter once the status is "Ready for Pickup".
          </p>
        </div>
      </main>


      <div className="p-6 ios-blur bg-white/80 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-zinc-800 sticky bottom-0 z-20 space-y-3">
        {order.status === OrderStatus.PLACED && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel this order?')) {
                onCancel(order.id);
                localStorage.removeItem('unieats_active_order_id');
              }
            }}
            className="w-full bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl border border-red-100 dark:border-red-900/20 active:scale-95 transition-all outline-none"
          >
            Cancel Order
          </button>
        )}
        <button
          onClick={() => navigate('/menu')}
          className="w-full bg-primary hover:bg-opacity-90 transition-all text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-3 active:scale-95"
        >
          <span className="material-icons-round">home</span>
          <span>Back to Menu</span>
        </button>
      </div>
    </div>
  );
};

export default OrderStatusPage;
