
import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

interface HeaderProps {
  unreadCount?: number;
  cartCount?: number;
  userName?: string;
  hasUnreadSupport?: boolean;
}

const Header: React.FC<HeaderProps> = ({ unreadCount = 0, cartCount = 0, userName, hasUnreadSupport = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Menu', icon: 'restaurant_menu', path: '/menu' },
    { label: 'Orders', icon: 'receipt_long', path: '/order-status' },
    { label: 'Account', icon: 'person', path: '/account', badge: hasUnreadSupport },
  ];

  return (
    <header className="hidden sm:flex h-20 items-center justify-between px-12 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-zinc-800 sticky top-0 z-[60]">
      <div className="flex items-center gap-12">
        <Link to="/menu" className="flex items-center gap-4 group">
          <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform overflow-hidden border border-white/20">
            <img src="/logo.png" alt="Uni Eats Logo" className="w-full h-full object-cover scale-110" />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic drop-shadow-sm">Uni Eats</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all relative ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-black' 
                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-800 font-bold'
                }`}
              >
                <span className="material-icons-round text-xl">{item.icon}</span>
                <span className="text-sm uppercase tracking-wider">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/notifications')}
          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-primary transition-colors relative"
        >
          <span className="material-icons-round">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-800">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button 
          onClick={() => navigate('/cart')}
          className="h-12 px-6 rounded-2xl bg-primary text-white flex items-center gap-3 font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span className="material-icons-round">shopping_basket</span>
          <span className="text-sm uppercase tracking-widest font-black">Basket</span>
          {cartCount > 0 && (
            <span className="bg-white text-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-none">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
