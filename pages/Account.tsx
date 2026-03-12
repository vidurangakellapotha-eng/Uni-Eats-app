import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import StatusBar from '../components/layout/StatusBar';
import Navbar from '../components/layout/Navbar';

interface AccountProps {
  user: { role: UserRole; id: string; name: string; photoURL?: string };
  onLogout: () => void;
}

const Account: React.FC<AccountProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [hasUnreadChat, setHasUnreadChat] = useState(false);

  useEffect(() => {
    if (!user.id) return;
    
    // Check for unread support replies from admin
    const q = query(
      collection(db, 'supportMessages'),
      where('chatId', '==', user.id),
      where('isAdmin', '==', true),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setHasUnreadChat(!snap.empty);
    });

    return () => unsubscribe();
  }, [user.id]);

  const settingsOptions = [
    { icon: 'person_outline', label: 'Personal Information', desc: 'Manage your profile details', path: '/account/profile' },
    { icon: 'account_balance_wallet', label: 'Payment Methods', desc: 'Saved cards and campus credits', path: '/account/payment' },
    { icon: 'history', label: 'Order History', desc: 'Review your past delicious meals', path: '/account/history' },
    { icon: 'notifications_none', label: 'Notification Settings', desc: 'Manage alerts and push messages', path: '/account/notifications' },
    { icon: 'security', label: 'Privacy & Security', desc: 'Password and biometric settings', path: '/account/privacy' },
    { icon: 'help_outline', label: 'Help & Support', desc: 'FAQs and cafeteria contact info', path: '/account/support', hasBadge: hasUnreadChat },
  ];

  const handleBack = () => {
    navigate('/menu');
  };

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <StatusBar />

      <header className="sm:hidden px-6 py-4 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
        >
          <span className="material-icons-round text-primary">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 sm:px-12 py-4 sm:py-12 pb-24 hide-scrollbar max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Profile Card Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-zinc-800 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 dark:bg-primary/20 -z-0"></div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 rounded-[32px] bg-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/30 border-4 border-white dark:border-zinc-900 overflow-hidden group-hover:scale-105 transition-transform">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                <h2 className="mt-6 text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
                <div className="mt-2 inline-flex items-center px-4 py-1.5 rounded-full bg-slate-50 dark:bg-zinc-800 text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">
                  {user.role} • {user.id}
                </div>
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-zinc-800 w-full flex justify-between gap-4">
                  <div className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Status</p>
                    <p className="text-sm font-bold text-emerald-500">Active</p>
                  </div>
                  <div className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50">
                    <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Member Since</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-white truncate">Mar '24</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="lg:hidden w-full bg-red-50 dark:bg-red-950/20 text-red-600 font-black py-5 rounded-[32px] flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/30 active:scale-95 transition-all text-xs uppercase tracking-widest"
            >
              <span className="material-icons-round">logout</span>
              Sign Out
            </button>
          </div>

          {/* Settings Grid */}
          <div className="lg:col-span-8 space-y-6">
            <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">General Settings</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {settingsOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => opt.path ? navigate(opt.path) : null}
                  className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border border-slate-100 dark:border-zinc-800 text-left hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all group flex flex-col"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm mb-4">
                    <span className="material-icons-round text-2xl">{opt.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-black text-base text-slate-900 dark:text-white tracking-tight">{opt.label}</h4>
                      {opt.hasBadge && (
                         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className="mt-6 flex items-center text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                    Configure <span className="material-icons-round text-sm ml-1">arrow_forward</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onLogout}
              className="hidden lg:flex w-full bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 font-black py-6 rounded-[32px] border border-slate-100 dark:border-zinc-800 hover:bg-red-50 dark:hover:bg-red-900/10 active:scale-95 transition-all text-xs uppercase tracking-[0.2em] items-center justify-center gap-3 shadow-sm"
            >
              <span className="material-icons-round">logout</span>
              Sign Out of Account
            </button>
          </div>
        </div>
      </main>

      {user.role === UserRole.STUDENT && <Navbar hasUnreadSupport={hasUnreadChat} />}
    </div>
  );
};

export default Account;