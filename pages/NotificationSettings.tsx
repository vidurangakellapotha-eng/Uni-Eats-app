
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationSettings: React.FC = () => {
    const navigate = useNavigate();
    const [orderUpdates, setOrderUpdates] = useState(true);
    const [promotions, setPromotions] = useState(false);
    const [cafeteriaNews, setCafeteriaNews] = useState(true);
    const [emailDigest, setEmailDigest] = useState(false);

    const Toggle: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{label}</h4>
                <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
            >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    );

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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Push Notifications</p>
                <div className="space-y-3">
                    <Toggle
                        label="Order Updates"
                        desc="Get notified when your food is ready"
                        checked={orderUpdates}
                        onChange={setOrderUpdates}
                    />
                    <Toggle
                        label="Promotions & Deals"
                        desc="Daily offers and special discounts"
                        checked={promotions}
                        onChange={setPromotions}
                    />
                    <Toggle
                        label="Cafeteria News"
                        desc="Opening hours and menu changes"
                        checked={cafeteriaNews}
                        onChange={setCafeteriaNews}
                    />
                </div>

                <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6">Email Notifications</p>
                <div className="space-y-3">
                    <Toggle
                        label="Weekly Digest"
                        desc="Summary of your spending"
                        checked={emailDigest}
                        onChange={setEmailDigest}
                    />
                </div>
            </main>
        </div>
    );
};

export default NotificationSettings;
