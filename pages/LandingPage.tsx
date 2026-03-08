
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MENU_ITEMS } from '../constants';
import Typewriter from '../components/Typewriter';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    // Use a high-quality image for the hero background (e.g., Rice & Curry or generic tasty food)
    const heroImage = MENU_ITEMS.find(item => item.id === 'l4')?.image || MENU_ITEMS[0].image;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col relative overflow-hidden">
            {/* Hero Background Image */}
            <div className="absolute top-0 left-0 w-full h-[60%] z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-slate-50 dark:to-zinc-950 z-10" />
                <img
                    src={heroImage}
                    alt="Delicious Food"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* iOS Status Bar (Overlay on image) */}
            <div className="relative z-20 px-8 pt-10 pb-2 flex justify-between items-center w-full text-white">
                <span className="text-sm font-semibold tracking-wide">9:41</span>
                <div className="flex items-center space-x-1.5 opacity-90">
                    <span className="material-icons-round text-sm">signal_cellular_alt</span>
                    <span className="material-icons-round text-sm">wifi</span>
                    <span className="material-icons-round text-sm">battery_full</span>
                </div>
            </div>

            {/* Main Content Area - Bottom Sheet Style */}
            <div className="flex-1 flex flex-col justify-end relative z-20">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-t border-white/20 dark:border-zinc-800 rounded-t-[3rem] px-8 pt-8 pb-10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.1)]">

                    {/* Handle Indicator */}
                    <div className="w-12 h-1.5 bg-slate-300 dark:bg-zinc-700 rounded-full mx-auto mb-8" />

                    <div className="space-y-6">
                        {/* Header Section */}
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 border border-orange-200 dark:border-orange-500/20">
                                <span className="material-icons-round text-sm">star</span>
                                <span>Official NIBM App</span>
                            </div>
                            <Typewriter
                                segments={[
                                    { text: "Skip the " },
                                    { text: "Queue", className: "text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500" },
                                    { text: "." },
                                    { text: "", newLine: true },
                                    { text: "Eat " },
                                    { text: "Better", className: "italic font-serif font-medium text-slate-700 dark:text-slate-300" },
                                    { text: "." }
                                ]}
                            />
                        </div>

                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                            Order from the cafeteria, pay with credits, and pickup in minutes.
                        </p>

                        {/* Quick Stats / Features Row */}
                        <div className="flex justify-between items-center py-4 border-y border-slate-100 dark:border-zinc-800">
                            <div className="text-center flex-1">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">4.8</div>
                                <div className="text-xs text-slate-400 font-medium uppercase">Rating</div>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-zinc-800" />
                            <div className="text-center flex-1">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">1k+</div>
                                <div className="text-xs text-slate-400 font-medium uppercase">Students</div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-2 space-y-3">
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-lg py-4 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                Get Started
                                <span className="material-icons-round">arrow_forward</span>
                            </button>
                            <button
                                onClick={() => navigate('/public-menu')}
                                className="w-full bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-bold text-lg py-4 rounded-2xl border border-slate-200 dark:border-zinc-700 active:scale-[0.98] transition-all"
                            >
                                View Menu
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default LandingPage;
