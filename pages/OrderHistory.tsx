
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import StatusBar from '../components/layout/StatusBar';

const OrderHistory: React.FC = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) { setLoading(false); return; }

        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: Order[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
            setOrders(fetched);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-transparent">
            <div className="sm:hidden">
                <StatusBar />
            </div>
            <header className="sm:hidden px-6 py-6 flex items-center justify-between">
                <button 
                    onClick={() => navigate(-1)} 
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                    <span className="material-icons-round text-primary text-xl">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">History</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 sm:py-16 pb-32 hide-scrollbar">
                <div className="max-w-2xl mx-auto w-full space-y-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <span className="material-icons-round text-5xl mb-3 animate-spin opacity-40">sync</span>
                        <p className="text-sm">Loading your orders...</p>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <span className="material-icons-round text-6xl mb-4 opacity-20">receipt_long</span>
                        <p>No orders yet</p>
                        <button onClick={() => navigate('/menu')} className="mt-4 text-primary text-sm font-bold">Browse Menu →</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-zinc-900 p-5 rounded-[24px] border border-slate-100 dark:border-zinc-800 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">LKR {order.total.toFixed(2)}</h3>
                                        <p className="text-xs text-slate-400 font-medium">{order.timestamp} • {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : order.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-300">
                                                <span className="font-bold text-slate-900 dark:text-white mr-2">{item.quantity}x</span>
                                                {item.name}
                                            </span>
                                            <span className="text-slate-400">LKR {item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t border-slate-50 dark:border-zinc-800 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1 text-slate-400">
                                        <span className="material-icons-round text-sm">credit_card</span>
                                        <span>{order.paymentMethod}</span>
                                    </div>
                                    <button onClick={() => navigate('/menu')} className="font-bold text-primary">Reorder</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </div>
            </main>
        </div>
    );
};

export default OrderHistory;
