
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import StatusBar from '../components/layout/StatusBar';

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
    { icon: 'help_outline', label: 'Help & Support', desc: 'FAQs and contact info', path: '/account/support', hasBadge: hasUnreadChat },
  ];

  const handleBack = () => {
    navigate('/menu');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-transparent">
      <div className="sm:hidden">
        <StatusBar />
      </div>

      {/* Modern Mobile Header - Hidden on Desktop */}
      <header className="sm:hidden px-6 py-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
        >
          <span className="material-icons-round text-primary text-xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Account</h1>
        <div className="w-10"></div>
      </header>

      {/* Main Content Area - Scrollable & Centered on Desktop */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:py-16 pb-32 hide-scrollbar">
        <div className="max-w-2xl mx-auto w-full">
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[40px] bg-primary flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl shadow-primary/20 border-4 border-white dark:border-zinc-900 relative">
               {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover rounded-[36px]" />
                ) : (
                  user.name.split(' ').map(n => n[0]).join('')
                )}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center">
                   <span className="material-icons-round text-white text-[16px]">check</span>
                </div>
            </div>
            <h2 className="mt-6 text-3xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-[0.25em] mt-2 bg-slate-100 dark:bg-zinc-800/50 px-4 py-1.5 rounded-full">{user.role} • {user.id}</p>
          </div>

          {/* Options List */}
          <div className="space-y-6">
            <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">General Settings</p>
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-[40px] overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-800">
              {settingsOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => opt.path ? navigate(opt.path) : null}
                  className={`w-full px-8 py-6 flex items-center gap-6 transition-all hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.99] group ${i !== settingsOptions.length - 1 ? 'border-b border-slate-50 dark:border-zinc-800' : ''}`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <span className="material-icons-round text-2xl">{opt.icon}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-slate-900 dark:text-white">{opt.label}</span>
                      {opt.hasBadge && (
                         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">{opt.desc}</p>
                  </div>
                  <span className="material-icons-round text-slate-300 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sign Out - Hidden on Desktop Sidebar already has it */}
          <div className="sm:hidden">
            <button
              onClick={onLogout}
              className="mt-12 w-full bg-red-50 dark:bg-red-950/20 text-red-600 font-black py-6 rounded-[32px] flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/10 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
            >
              <span className="material-icons-round">logout</span>
              Sign Out Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Account;