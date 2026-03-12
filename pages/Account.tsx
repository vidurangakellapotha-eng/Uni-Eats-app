import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

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
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-zinc-950">
      {/* iOS Status Bar */}
      <div className="sm:hidden px-8 pt-10 pb-2 flex justify-between items-center w-full">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">9:41</span>
        <div className="flex items-center space-x-1.5 text-slate-900 dark:text-white">
          <span className="material-icons-round text-sm">signal_cellular_alt</span>
          <span className="material-icons-round text-sm">wifi</span>
          <span className="material-icons-round text-sm">battery_full</span>
        </div>
      </div>

      <header className="px-6 py-4 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
        >
          <span className="material-icons-round text-primary">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 pb-24 hide-scrollbar space-y-6 text-slate-900 dark:text-white">
        {/* Profile Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-zinc-800 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-primary/5 dark:bg-primary/20 -z-0"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 rounded-[32px] bg-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20 border-4 border-white dark:border-zinc-900 overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user.name.split(' ').map(n => n[0]).join('')
              )}
            </div>
            <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm font-bold text-primary dark:text-amber-500 uppercase tracking-widest">{user.role} • {user.id}</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-3">
          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">General Settings</p>
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-zinc-800 overflow-hidden divide-y divide-slate-50 dark:divide-zinc-800">
            {settingsOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => opt.path ? navigate(opt.path) : null}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors group relative"
              >
                <div className="flex items-center gap-4 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                    <span className="material-icons-round text-xl">{opt.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{opt.label}</h4>
                    <p className="text-xs text-slate-400">{opt.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {opt.hasBadge && (
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse ring-4 ring-red-500/20"></div>
                  )}
                  <span className="material-icons-round text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3">
          <p className="px-2 text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">Account Actions</p>
          <button
            onClick={onLogout}
            className="w-full bg-red-50 dark:bg-red-950/20 text-red-600 font-black py-5 rounded-[32px] flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/30 active:scale-95 transition-all"
          >
            <span className="material-icons-round">logout</span>
            Sign Out
          </button>
        </div>
      </main>

      {/* Persistent Bottom Nav (Simplified for Student) */}
      {user.role === UserRole.STUDENT && (
        <nav className="ios-blur bg-white/80 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-zinc-800 px-10 pt-4 pb-8 flex justify-between items-center sticky bottom-0">
          <button onClick={() => navigate('/menu')} className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-icons-round text-slate-400">restaurant_menu</span>
            <span className="text-[10px] font-medium">Menu</span>
          </button>
          <button onClick={() => navigate('/order-status')} className="flex flex-col items-center gap-1 text-slate-400">
            <span className="material-icons-round text-slate-400">receipt_long</span>
            <span className="text-[10px] font-medium">Orders</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-primary relative">
            <span className="material-icons-round text-primary">person</span>
            <span className="text-[10px] font-bold">Account</span>
            {hasUnreadChat && (
              <span className="absolute top-0 right-1/4 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse"></span>
            )}
          </button>
        </nav>
      )}
    </div>
  );
};

export default Account;