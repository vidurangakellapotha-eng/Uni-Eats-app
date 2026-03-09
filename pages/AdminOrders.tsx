
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../types';
import { db } from '../firebase';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';

const statusColors: Record<string, string> = {
    [OrderStatus.PLACED]: 'bg-blue-100 text-blue-600',
    [OrderStatus.PREPARING]: 'bg-amber-100 text-amber-600',
    [OrderStatus.READY]: 'bg-green-100 text-green-600',
    [OrderStatus.COMPLETED]: 'bg-slate-100 text-slate-500',
    [OrderStatus.REJECTED]: 'bg-red-100 text-red-500',
};

const AdminOrders: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'active' | 'history'>('active');

    // Real-time Firestore listener
    useEffect(() => {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: Order[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
            setOrders(fetched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const advanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
        const next: Partial<Record<OrderStatus, OrderStatus>> = {
            [OrderStatus.PLACED]: OrderStatus.PREPARING,
            [OrderStatus.PREPARING]: OrderStatus.READY,
            [OrderStatus.READY]: OrderStatus.COMPLETED,
        };
        const nextStatus = next[currentStatus];
        if (!nextStatus) return;
        await updateDoc(doc(db, 'orders', orderId), { status: nextStatus });
    };

    const rejectOrder = async (orderId: string) => {
        await updateDoc(doc(db, 'orders', orderId), { status: OrderStatus.REJECTED });
    };

    const activeOrders = orders.filter(
        o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.REJECTED
    );
    const historyOrders = orders.filter(
        o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.REJECTED
    );

    const displayOrders = tab === 'active' ? activeOrders : historyOrders;

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-zinc-950">
            {/* Status Bar */}
            <div className="px-8 pt-10 pb-2 flex justify-between items-center w-full">
                <span className="text-sm font-semibold">9:41</span>
                <div className="flex items-center space-x-1.5">
                    <span className="material-icons-round text-sm">signal_cellular_alt</span>
                    <span className="material-icons-round text-sm">wifi</span>
                    <span className="material-icons-round text-sm">battery_full</span>
                </div>
            </div>

            {/* Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
                    <p className="text-xs text-slate-500">
                        {loading ? 'Loading...' : `${activeOrders.length} active order${activeOrders.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">LIVE</span>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 px-6 gap-6">
                <button
                    onClick={() => setTab('active')}
                    className={`py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'active'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-400'}`}
                >
                    Active
                    {activeOrders.length > 0 && (
                        <span className="ml-2 bg-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                            {activeOrders.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setTab('history')}
                    className={`py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-slate-400'}`}
                >
                    History
                </button>
            </div>

            {/* Orders list */}
            <main className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <span className="material-icons-round text-5xl mb-3 animate-spin opacity-40">sync</span>
                        <p className="text-sm">Loading orders...</p>
                    </div>
                ) : displayOrders.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <span className="material-icons-round text-6xl mb-2 opacity-20">
                            {tab === 'active' ? 'inventory' : 'history'}
                        </span>
                        <p>{tab === 'active' ? 'No active orders' : 'No order history yet'}</p>
                    </div>
                ) : (
                    displayOrders.map(order => (
                        <div
                            key={order.id}
                            className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 shadow-sm border border-slate-100 dark:border-zinc-800"
                        >
                            {/* Order header */}
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                                        #{order.id.slice(-6).toUpperCase()}
                                    </span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{order.userName}</h3>
                                    <p className="text-xs text-slate-400">{order.userType} • {order.timestamp}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[order.status] || 'bg-slate-100 text-slate-500'}`}>
                                    {order.status}
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-1.5 py-3 border-y border-slate-50 dark:border-zinc-800 mb-4">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">
                                            <span className="font-bold text-slate-900 dark:text-white mr-2">{item.quantity}x</span>
                                            {item.name}
                                        </span>
                                        <span className="text-slate-500 font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-zinc-700 mt-2">
                                    <span className="font-bold text-slate-900 dark:text-white">Total</span>
                                    <span className="font-black text-primary">Rs. {order.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Payment badge */}
                            <div className="mb-4">
                                <span className="text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-500 px-3 py-1 rounded-full">
                                    💳 {order.paymentMethod}
                                </span>
                            </div>

                            {/* Action buttons (only for active orders) */}
                            {tab === 'active' && (
                                <div className="flex gap-3">
                                    {order.status === OrderStatus.PLACED && (
                                        <button
                                            onClick={() => rejectOrder(order.id)}
                                            className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm active:scale-95 transition-all border border-red-100"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <button
                                        onClick={() => advanceStatus(order.id, order.status)}
                                        className={`flex-[2] py-3 font-bold rounded-xl text-sm active:scale-95 transition-all text-white
                      ${order.status === OrderStatus.PLACED ? 'bg-primary' :
                                                order.status === OrderStatus.PREPARING ? 'bg-amber-500' :
                                                    'bg-green-500'}`}
                                    >
                                        {order.status === OrderStatus.PLACED ? '✅ Accept & Prepare' :
                                            order.status === OrderStatus.PREPARING ? '🔔 Mark Ready' :
                                                '✔️ Complete Order'}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </main>

            {/* Bottom nav */}
            <nav className="ios-blur bg-white/80 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-zinc-800 px-10 pt-4 pb-8 flex justify-between items-center sticky bottom-0">
                <button className="flex flex-col items-center gap-1 text-primary">
                    <span className="material-icons-round">receipt_long</span>
                    <span className="text-[10px] font-bold">Orders</span>
                </button>
                <button onClick={() => navigate('/account')} className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="material-icons-round">person</span>
                    <span className="text-[10px] font-medium">Account</span>
                </button>
            </nav>
        </div>
    );
};

export default AdminOrders;
