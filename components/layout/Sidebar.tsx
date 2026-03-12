
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
    <aside className="flex flex-col w-full h-full bg-white dark:bg-zinc-900 border-r border-slate-100 dark:border-zinc-800 overflow-y-auto hide-scrollbar">
      {/* Brand */}
      <div className="p-8">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <span className="material-icons-round">restaurant</span>
          </div>
          <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">Uni Eats</span>
        </Link>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-4 space-y-8">
        {menuSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <p className="px-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => item.path !== '#' && navigate(item.path)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary font-black shadow-sm'
                      : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-icons-round transition-transform duration-500 ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm tracking-tight">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`flex items-center justify-center rounded-full bg-red-500 text-white min-w-[1.25rem] h-5 px-1 text-[10px] font-black ring-4 ring-red-500/10 ${item.count ? '' : 'w-2 h-2 opacity-100'}`}>
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
          <div className="bg-slate-50 dark:bg-zinc-800/50 rounded-[28px] p-4 group hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase shadow-inner">
                {userName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 font-bold truncate">NIBM Student</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl bg-white dark:bg-zinc-900 text-red-500 text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-sm">logout</span>
              Sign Out
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/login')}
            className="w-full py-4 rounded-[28px] bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
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
