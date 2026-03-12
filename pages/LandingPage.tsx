
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Typewriter from '../components/Typewriter';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex-1 min-h-screen bg-transparent flex flex-col items-center justify-center p-6 sm:p-12 lg:p-20 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl -ml-64 -mb-64" />

            <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Left Side: Content */}
                <div className="space-y-10 order-2 lg:order-1">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary text-sm font-black uppercase tracking-widest border border-primary/20 animate-fade-in">
                            <span className="material-icons-round text-lg">star_border</span>
                            <span>Official NIBM Student Platform</span>
                        </div>
                        
                        <div className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tighter">
                            <Typewriter
                                segments={[
                                    { text: "Smart Dining " },
                                    { text: "for ", className: "italic font-serif font-light text-slate-400" },
                                    { text: "Smart ", className: "text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary" },
                                    { text: "Students." }
                                ]}
                            />
                        </div>

                        <p className="text-xl text-slate-500 dark:text-zinc-400 leading-relaxed max-w-lg font-medium">
                            Experience the future of campus cafeteria. Pre-order your favorite meals, skip the long queues, and manage your campus credits effortlessly.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative px-10 py-5 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-black font-black text-xl shadow-2xl shadow-slate-900/20 active:scale-95 transition-all overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                Start Ordering
                                <span className="material-icons-round transition-transform group-hover:translate-x-1">arrow_forward_ios</span>
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-10 dark:opacity-0 transition-opacity" />
                        </button>
                        
                        <button
                            onClick={() => navigate('/public-menu')}
                            className="px-10 py-5 rounded-[2rem] bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-zinc-700 font-black text-xl hover:bg-slate-50 dark:hover:bg-zinc-700/50 active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <span className="material-icons-round">restaurant_menu</span>
                            Explore Menu
                        </button>
                    </div>

                    {/* Trust Indicators / Stats */}
                    <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-100 dark:border-zinc-800">
                        <div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">4.9/5</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Student Love</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">5min</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Avg. Pickup</div>
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">12+</div>
                            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Cuisines</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: High-End Hero Image Wrap */}
                <div className="relative order-1 lg:order-2 group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-1000" />
                    <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] aspect-[4/5] sm:aspect-square lg:aspect-[4/5] border-8 border-white dark:border-zinc-800">
                            <img
                                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2000&auto=format&fit=crop"
                                alt="Fresh Healthy Food Bowl"
                                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                            />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                        
                        {/* Featured Badge */}
                        <div className="absolute bottom-6 left-6 right-6 p-6 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between">
                            <div className="text-white">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Today's Special</p>
                                <p className="text-lg font-black tracking-tight">Authentic Ceylon Curry</p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                                <span className="material-icons-round text-xl">trending_up</span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Info Cards (Hidden on mobile) */}
                    <div className="hidden sm:block absolute -top-8 -right-8 p-6 rounded-3xl bg-white dark:bg-zinc-800 shadow-2xl animate-bounce-slow border border-slate-50 dark:border-zinc-700">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <span className="material-icons-round">bolt</span>
                            </div>
                            <div>
                                <p className="text-xs font-black dark:text-white">Instant Prep</p>
                                <p className="text-[10px] text-slate-400 font-bold">Ready in 5-10m</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
