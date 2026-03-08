
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderStatus } from '../types';

interface AdminOrdersProps {
    orders: Order[];
    onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onUpdateStatus }) => {
    const navigate = useNavigate();

    const handleStatusChange = (orderId: string, currentStatus: OrderStatus) => {
        let nextStatus: OrderStatus;
        switch (currentStatus) {
            case OrderStatus.PLACED:
                nextStatus = OrderStatus.PREPARING;
                break;
            case OrderStatus.PREPARING:
                nextStatus = OrderStatus.READY;
                break;
            case OrderStatus.READY:
                nextStatus = OrderStatus.COMPLETED;
                break;
            default:
                return;
        }
        onUpdateStatus(orderId, nextStatus);
    };

    const handleCancelOrder = (orderId: string) => {
        onUpdateStatus(orderId, OrderStatus.REJECTED);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 dark:bg-zinc-950">
            {/* iOS Status Bar */}
            <div className="px-8 pt-10 pb-2 flex justify-between items-center w-full">
                <span className="text-sm font-semibold">9:41</span>
                <div className="flex items-center space-x-1.5">
                    <span className="material-icons-round text-sm">signal_cellular_alt</span>
                    <span className="material-icons-round text-sm">wifi</span>
                    <span className="material-icons-round text-sm">battery_full</span>
                </div>
            </div>

            <header className="px-6 py-4 flex justify-between items-center bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Live Orders</h1>
                    <p className="text-xs text-slate-500">Manage incoming cafeteria requests</p>
                </div>
                <button
                    onClick={() => navigate('/account')}
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center"
                >
                    <span className="material-icons-round text-slate-600">person</span>
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
                {orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.REJECTED).length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <span className="material-icons-round text-6xl mb-2 opacity-20">inventory</span>
                        <p>No active orders</p>
                    </div>
                ) : (
                    orders
                        .filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.REJECTED)
                        .map(order => (
                            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-[24px] p-5 shadow-sm border border-slate-100 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-primary tracking-widest">#{order.id}</span>
                                        <h3 className="font-bold text-slate-900 dark:text-white">{order.userName}</h3>
                                        <p className="text-xs text-slate-400">{order.userType} • {order.timestamp}</p>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${order.status === OrderStatus.PLACED ? 'bg-blue-100 text-blue-600' :
                                            order.status === OrderStatus.PREPARING ? 'bg-amber-100 text-amber-600' :
                                                'bg-green-100 text-green-600'
                                        }`}>
                                        {order.status}
                                    </div>
                                </div>

                                <div className="space-y-2 py-3 border-y border-slate-50 dark:border-zinc-800 mb-4">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-sm">
                                            <span className="text-slate-600 dark:text-slate-300">
                                                <span className="font-bold text-slate-900 dark:text-white mr-2">{item.quantity}x</span>
                                                {item.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    {order.status === OrderStatus.PLACED && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm active:scale-95 transition-all border border-red-100"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleStatusChange(order.id, order.status)}
                                        className={`flex-[2] py-3 font-bold rounded-xl text-sm active:scale-95 transition-all text-white ${order.status === OrderStatus.PLACED ? 'bg-primary' :
                                                order.status === OrderStatus.PREPARING ? 'bg-amber-500' :
                                                    'bg-green-500'
                                            }`}
                                    >
                                        {order.status === OrderStatus.PLACED ? 'Accept & Prepare' :
                                            order.status === OrderStatus.PREPARING ? 'Mark Ready' :
                                                'Complete Order'}
                                    </button>
                                </div>
                            </div>
                        ))
                )}
            </main>

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
