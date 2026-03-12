
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  hasUnreadSupport?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ hasUnreadSupport = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Menu', icon: 'restaurant_menu', path: '/menu' },
    { label: 'Orders', icon: 'receipt_long', path: '/order-status' },
    { label: 'Account', icon: 'person', path: '/account', badge: hasUnreadSupport },
  ];

  return (
    <nav className="ios-blur bg-white/95 dark:bg-zinc-900/95 border-t border-slate-100 dark:border-zinc-800 px-10 pt-4 pb-8 flex justify-between items-center w-full">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1.5 transition-all outline-none ${isActive ? 'text-primary' : 'text-slate-400'}`}
          >
            <div className="relative">
              <span className="material-icons-round text-2xl">{item.icon}</span>
              {item.badge && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900"></span>
              )}
            </div>
            <span className={`text-[9px] uppercase tracking-[0.15em] ${isActive ? 'font-black' : 'font-bold'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navbar;
