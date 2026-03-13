import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import StatusBar from '../components/layout/StatusBar';

const HelpSupport: React.FC = () => {
    const navigate = useNavigate();
    const [hasUnreadChat, setHasUnreadChat] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;
        
        const q = query(
            collection(db, 'supportMessages'),
            where('chatId', '==', user.uid),
            where('isAdmin', '==', true),
            where('read', '==', false)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setHasUnreadChat(!snap.empty);
        });

        return () => unsubscribe();
    }, [user]);

    const faqs = [
        { q: "How do I top up my credits?", a: "Visit the main administration office or use the online portal to add funds to your student ID." },
        { q: "Can I cancel an order?", a: "Orders can only be cancelled within 1 minute of placing them, before preparation begins." },
        { q: "Where do I pick up my food?", a: "Look for the 'Online Pickup' counter at the main cafeteria entrance." },
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-transparent">
            <div className="sm:hidden">
                <StatusBar />
            </div>

            <header className="sm:hidden px-6 py-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                    <span className="material-icons-round text-primary text-xl">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Support</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 sm:py-16 pb-32 hide-scrollbar">
                <div className="max-w-2xl mx-auto w-full space-y-12">

                {/* Contact Options */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => navigate('/account/support/chat')}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-3 active:scale-95 hover:border-primary/30 transition-all group relative"
                    >
                        {hasUnreadChat && (
                            <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse ring-4 ring-red-500/20 shadow-lg shadow-red-500/30"></div>
                        )}
                        <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-icons-round">chat</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Live Chat</span>
                    </button>
                    <button 
                        onClick={() => window.location.href = 'tel:0112345678'}
                        className="bg-white dark:bg-zinc-900 p-6 rounded-[24px] border border-slate-100 dark:border-zinc-800 shadow-sm flex flex-col items-center gap-3 active:scale-95 hover:border-primary/30 transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-icons-round">call</span>
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Call Us</span>
                    </button>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Frequently Asked</h3>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div 
                                key={i} 
                                onClick={() => navigate('/account/support/chat', { state: { initialMessage: faq.q } })}
                                className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 cursor-pointer hover:border-primary/40 active:scale-[0.98] transition-all group"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{faq.q}</h4>
                                    <span className="material-icons-round text-slate-300 text-sm">chevron_right</span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                <div className="p-6 bg-primary/5 rounded-[24px] border border-primary/10 text-center space-y-4">
                    <p className="font-bold text-slate-900 dark:text-white">Rate your experience</p>
                    <div className="flex justify-center gap-2 text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-icons-round text-3xl cursor-pointer hover:scale-110 transition-transform">star</span>)}
                    </div>
                    <button className="text-primary text-xs font-bold uppercase tracking-widest">Submit Feedback</button>
                </div>

                </div>
            </main>
        </div>
    );
};

export default HelpSupport;
