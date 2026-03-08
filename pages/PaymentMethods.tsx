
import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentMethods: React.FC = () => {
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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payment Methods</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">

                {/* Campus Credits Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-600 rounded-[32px] p-8 text-white shadow-xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <span className="material-icons-round text-3xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">school</span>
                            <span className="font-black tracking-widest uppercase text-xs opacity-70">Primary Method</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium opacity-80">Current Balance</p>
                            <h3 className="text-4xl font-black">LKR 4,250.00</h3>
                        </div>
                        <div className="mt-8 flex justify-between items-end">
                            <div className="text-xs font-medium opacity-70 tracking-widest gap-2 flex">
                                <span>●●●●</span> <span>●●●●</span> <span>●●●●</span> <span>4821</span>
                            </div>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-8 opacity-0" alt="" /> {/* Just spacing */}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Saved Cards</h3>
                    <button className="text-xs font-bold text-primary">Manage</button>
                </div>

                <div className="space-y-4">
                    {/* Visa Card Mock */}
                    <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm group cursor-pointer hover:border-primary/50 transition-all">
                        <div className="w-14 h-10 bg-slate-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                            <span className="material-icons-round text-slate-400">credit_card</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Visa ending in 4242</h4>
                            <p className="text-xs text-slate-400">Expires 12/26</p>
                        </div>
                        <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-zinc-700"></div>
                    </div>

                    {/* Add New Method */}
                    <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all">
                        <span className="material-icons-round">add</span>
                        Add Payment Method
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PaymentMethods;
