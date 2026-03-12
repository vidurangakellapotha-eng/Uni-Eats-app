
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

interface SidebarProps {
  unreadCount?: number;
  cartCount?: number;
  hasUnreadSupport?: boolean;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ unreadCount = 0, cartCount = 0, hasUnreadSupport = false, userName, userEmail, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = [
    {
      title: 'Menu',
      items: [
        { label: 'Explore Food', icon: 'restaurant_menu', path: userName ? '/menu' : '/public-menu' },
        { label: 'Announcements', icon: 'notifications_none', path: '/notifications', badge: unreadCount > 0, count: unreadCount },
        { label: 'My Basket', icon: 'shopping_basket', path: '/cart', badge: cartCount > 0, count: cartCount },
      ]
    },
    {
      title: 'Orders',
      items: [
        { label: 'Live Tracking', icon: 'receipt_long', path: '/order-status' },
        { label: 'Order History', icon: 'history', path: '/account/history' },
      ]
    },
    {
      title: 'Account',
      items: [
        { label: 'Profile Details', icon: 'person_outline', path: '/account/profile' },
        { label: 'Payment Methods', icon: 'account_balance_wallet', path: '/account/payment' },
        { label: 'Support & Help', icon: 'help_outline', path: '/account/support', badge: hasUnreadSupport },
      ]
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="flex flex-col w-full h-full glass-panel border-r border-slate-100/50 dark:border-zinc-800/50 overflow-y-auto hide-scrollbar">
      {/* Brand */}
      <div className="p-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 rotate-3 group-hover:rotate-0 transition-all duration-700">
            <span className="material-icons-round text-2xl">restaurant</span>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic drop-shadow-sm">Uni Eats</span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 space-y-10">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <p className="px-5 text-[11px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.25em] opacity-80">
              {section.title}
            </p>
            <div className="space-y-2">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => item.path !== '#' && navigate(item.path)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-500 group interactive-scale ${
                    isActive(item.path)
                      ? 'bg-primary text-white font-black shadow-lg shadow-primary/30'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-white/40 dark:hover:bg-zinc-800/50 font-bold hover:text-primary dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className={`material-icons-round transition-all duration-500 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-6'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`flex items-center justify-center rounded-full ${isActive(item.path) ? 'bg-white text-primary' : 'bg-primary text-white'} min-w-[1.25rem] h-5 px-1.5 text-[10px] font-black ring-4 ${isActive(item.path) ? 'ring-white/20' : 'ring-primary/10'}`}>
                      {item.count && item.count > 0 ? (item.count > 9 ? '9+' : item.count) : ''}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="p-4 mt-auto">
        {userName ? (
          <div className="bg-white/40 dark:bg-zinc-800/20 backdrop-blur-md rounded-[32px] p-5 group hover:bg-white/60 dark:hover:bg-zinc-800/40 transition-all duration-700 border border-white/20">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase shadow-inner text-lg">
                {userName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-black text-slate-900 dark:text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-60">NIBM Student</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full py-3.5 rounded-2xl bg-white dark:bg-zinc-900 text-red-500 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2 interactive-scale"
            >
              <span className="material-icons-round text-sm">logout</span>
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-5 rounded-[32px] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <span className="material-icons-round">login</span>
            Student Login
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
