
import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NotificationProps {
    id: string;
    type: 'Update' | 'Alert' | 'Promo';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const mockNotifications: NotificationProps[] = [
    { id: '1', type: 'Update', title: 'App Update v2.5', message: 'New features added: Dark mode refinements and performance improvements.', time: '2h ago', read: false },
    { id: '2', type: 'Promo', title: 'Lunch Special! 🍔', message: 'Get 20% off all burger combos today between 12 PM and 2 PM.', time: '5h ago', read: false },
    { id: '3', type: 'Alert', title: 'Cafeteria Closing Early', message: 'The main cafeteria will be closing at 4 PM today for maintenance.', time: '1d ago', read: true },
];

const Notifications: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
            <div className="px-8 pt-10 pb-2 flex justify-between items-center w-full">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">9:41</span>
                <div className="flex items-center space-x-1.5 text-slate-900 dark:text-white">
                    <span className="material-icons-round text-sm">signal_cellular_alt</span>
                    <span className="material-icons-round text-sm">wifi</span>
                    <span className="material-icons-round text-sm">battery_full</span>
                </div>
            </div>

            <header className="px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                    <span className="material-icons-round text-primary">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Inbox</h1>
                <button className="ml-auto text-primary text-xs font-bold uppercase tracking-widest">Mark all read</button>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {mockNotifications.map((notif) => (
                    <div key={notif.id} className={`p-4 rounded-[24px] border transition-all ${notif.read ? 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800' : 'bg-primary/5 border-primary/10'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${notif.type === 'Update' ? 'bg-blue-100 text-blue-600' :
                                    notif.type === 'Alert' ? 'bg-red-100 text-red-600' :
                                        'bg-amber-100 text-amber-600'
                                }`}>
                                {notif.type}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{notif.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default Notifications;
