
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
    <div className="flex flex-col min-h-screen bg-transparent">
      <StatusBar />

      {/* Modern Mobile Header with Back Button */}
      <header className="px-6 py-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-800 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
        >
          <span className="material-icons-round text-primary text-xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Account</h1>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </header>

      <main className="flex-1 px-6 pb-32">
        {/* Profile Section - Mobile App Style */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-primary/20 border-4 border-white dark:border-zinc-900 relative">
             {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover rounded-3xl" />
              ) : (
                user.name.split(' ').map(n => n[0]).join('')
              )}
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-zinc-900 flex items-center justify-center">
                 <span className="material-icons-round text-white text-[14px]">check</span>
              </div>
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mt-1">{user.role} • {user.id}</p>
        </div>

        {/* Options List - Mobile Native Style */}
        <div className="space-y-4">
          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Settings</p>
          <div className="bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-800">
            {settingsOptions.map((opt, i) => (
              <button
                key={i}
                onClick={() => opt.path ? navigate(opt.path) : null}
                className={`w-full px-6 py-5 flex items-center gap-4 transition-all active:bg-slate-50 dark:active:bg-zinc-800 ${i !== settingsOptions.length - 1 ? 'border-b border-slate-50 dark:border-zinc-800' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-primary">
                  <span className="material-icons-round text-xl">{opt.icon}</span>
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{opt.label}</span>
                    {opt.hasBadge && (
                       <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">{opt.desc}</p>
                </div>
                <span className="material-icons-round text-slate-300">chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        {/* Improved Red Logout Button - Mobile Friendly */}
        <button
          onClick={onLogout}
          className="mt-8 w-full bg-red-50 dark:bg-red-950/20 text-red-600 font-black py-5 rounded-[24px] flex items-center justify-center gap-3 border border-red-100 dark:border-red-900/10 active:scale-95 transition-all text-xs uppercase tracking-[0.2em]"
        >
          <span className="material-icons-round">logout</span>
          Sign Out Portal
        </button>
      </main>
    </div>
  );
};

export default Account;