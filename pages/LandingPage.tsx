
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Typewriter from '../components/Typewriter';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 min-h-screen bg-transparent flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative overflow-hidden">
            <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Left Side: Content */}
                <div className="space-y-12 order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-1000">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-sm">
                            <span className="material-icons-round text-base">verified</span>
                            <span>Smart Dining for NIBM</span>
                        </div>
                        
                        <div className="text-6xl sm:text-8xl font-black text-slate-900 dark:text-white leading-[1] tracking-tighter">
                            <Typewriter
                                segments={[
                                    { text: "Smart " },
                                    { text: "Food ", className: "italic font-serif font-light text-slate-400" },
                                    { text: "Better ", className: "text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500" },
                                    { text: "Life." }
                                ]}
                            />
                        </div>

                        <p className="text-xl text-slate-600 dark:text-zinc-400 leading-relaxed max-w-lg font-medium">
                            Experience the future of campus dining. Pre-order meals, skip the long queues, and manage your student wallet with effortless charm.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-5 pt-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative px-12 py-6 rounded-[2.5rem] bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.4)] active:scale-95 transition-all overflow-hidden interactive-scale"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                Start Ordering
                                <span className="material-icons-round transition-transform group-hover:translate-x-2">arrow_forward</span>
                            </span>
                        </button>
                        
                        <button
                            onClick={() => navigate('/public-menu')}
                            className="px-12 py-6 rounded-[2.5rem] glass-panel border border-white/40 text-slate-900 dark:text-white font-black text-xl shadow-xl hover:shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 interactive-scale"
                        >
                            <span className="material-icons-round text-2xl">menu_book</span>
                            View Menu
                        </button>
                    </div>

                    {/* Trust Indicators / Stats */}
                    <div className="grid grid-cols-3 gap-12 pt-10 border-t border-white/20">
                        <div className="group">
                            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors">4.9</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Rating</div>
                        </div>
                        <div className="group">
                            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors">5m</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Pickup</div>
                        </div>
                        <div className="group">
                            <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors">15+</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Cafeterias</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: High-End Hero Image Wrap */}
                <div className="relative order-1 lg:order-2 group animate-in fade-in zoom-in-95 duration-1000">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-orange-400/40 rounded-[4rem] blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />
                    <div className="relative rounded-[4rem] overflow-hidden shadow-[0_45px_100px_-20px_rgba(0,0,0,0.3)] aspect-[4/5] border-[12px] border-white dark:border-zinc-900 glass-panel">
                            <img
                                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000&auto=format&fit=crop"
                                alt="Fresh Healthy Food Bowl"
                                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000"
                            />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                        
                        {/* Featured Badge */}
                        <div className="absolute bottom-8 left-8 right-8 p-8 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-between shadow-2xl">
                            <div className="text-white">
                                <p className="text-[11px] font-bold uppercase tracking-[0.25em] opacity-70 mb-1">Weekly Special</p>
                                <p className="text-2xl font-black tracking-tight">Ceylon Spice Bowl</p>
                            </div>
                            <div className="w-14 h-14 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl rotate-12 transition-transform group-hover:rotate-0">
                                <span className="material-icons-round text-2xl">local_fire_department</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Info Cards */}
                    <div className="hidden sm:block absolute -top-10 -right-10 p-8 rounded-[2.5rem] glass-panel shadow-2xl animate-bounce-slow border border-white/40 interactive-scale">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <span className="material-icons-round text-2x">flash_on</span>
                            </div>
                            <div>
                                <p className="text-sm font-black dark:text-white uppercase tracking-tighter">Fast Prep</p>
                                <p className="text-[11px] text-slate-400 font-bold italic">Ready in 5m</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
