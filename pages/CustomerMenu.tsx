
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem } from '../types';
import StatusBar from '../components/layout/StatusBar';
import Navbar from '../components/layout/Navbar';

interface CustomerMenuProps {
  menuItems: MenuItem[];
  cart: Record<string, number>;
  onUpdateCart: (itemId: string, delta: number) => void;
  readOnly?: boolean;
  unreadCount?: number;
  onClearUnread?: () => void;
  hasUnreadSupport?: boolean;
}

const CustomerMenu: React.FC<CustomerMenuProps> = ({ menuItems, cart, onUpdateCart, readOnly = false, unreadCount = 0, onClearUnread, hasUnreadSupport = false }) => {
  const [activeCategory, setActiveCategory] = useState('Breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = ['Breakfast', 'Lunch', 'Savoury', 'Sweet', 'Drinks'];

  const filteredItems = menuItems.filter(item =>
    item.category === activeCategory &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cartCount = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-transparent">
      {/* Mobile-only components fixed at top */}
      <div className="flex-none sm:contents">
        <div className="mobile-only-status">
          <StatusBar />
        </div>

        <header className="mobile-only-header px-6 py-6 flex justify-between items-center glass-panel shadow-lg shadow-black/5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 rotate-3 overflow-hidden border border-white/20">
              <img src="/logo.png" alt="Uni Eats Logo" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Uni Eats</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">NIBM Central</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onClearUnread?.(); navigate('/notifications'); }}
              className="w-11 h-11 rounded-2xl flex items-center justify-center glass-panel border border-white/40 active:scale-95 transition-all relative shadow-sm hover:text-primary dark:hover:text-white interactive-scale"
            >
              <span className="material-icons-round text-slate-500 text-xl font-bold">notifications_none</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-zinc-950 shadow-md">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => !readOnly && navigate('/cart')}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center relative transition-all interactive-scale ${readOnly ? 'bg-transparent cursor-default' : 'bg-primary shadow-xl shadow-primary/30 active:scale-95'}`}
            >
              {!readOnly && <span className="material-icons-round text-white font-bold">shopping_basket</span>}
              {!readOnly && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-primary">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="px-6 sm:px-12 py-2 sm:py-6 max-w-4xl mx-auto w-full">
          <div className="relative group">
            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-primary">search</span>
            <input
              type="text"
              placeholder="Search for delicious food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-none rounded-2xl sm:rounded-3xl py-4 sm:py-6 pl-12 pr-4 text-sm sm:text-lg focus:ring-4 focus:ring-primary/10 placeholder:text-slate-400 dark:text-white outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="mt-4 sm:mt-0 flex overflow-x-auto hide-scrollbar px-6 sm:px-12 space-x-3 sm:space-x-4 sm:justify-center pb-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${activeCategory === cat
                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
                : 'bg-white/50 dark:bg-zinc-900/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-zinc-800 backdrop-blur-sm'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Independently Scrollable Menu Section */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-6 pb-32">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 sm:gap-8">
          {filteredItems.map(item => (
            <div key={item.id} className={`glass-panel rounded-[32px] overflow-hidden shadow-xl shadow-black/5 hover:shadow-black/10 transition-all flex flex-col interactive-scale ${!item.available ? 'opacity-70' : ''}`}>
              <div className="relative h-36 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-white bg-red-500 px-3 py-1.5 rounded-full shadow-lg">Sold Out</span>
                  </div>
                )}
                {cart[item.id] > 0 && (
                  <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-1">
                    <span className="material-icons-round text-[12px]">shopping_cart</span>
                    {cart[item.id]}
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <div className="mb-3">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white leading-tight line-clamp-1 uppercase tracking-tight">{item.name}</h3>
                  <span className="text-primary font-black text-[13px] tracking-tight">LKR {item.price.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 h-7 font-medium leading-relaxed italic">{item.description}</p>
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-4 border-t border-white/20 pt-3">
                    <div className="flex items-center text-secondary">
                      <span className="material-icons-round text-[12px]">grade</span>
                      <span className="text-[11px] font-black ml-1">{item.rating}</span>
                    </div>
                    {item.prepTime && (
                      <div className="flex items-center gap-1 bg-primary/5 dark:bg-white/5 text-primary dark:text-amber-400 px-2.5 py-1 rounded-full border border-primary/10 transition-colors hover:bg-primary/10">
                        <span className="material-icons-round text-[11px]">alarm</span>
                        <span className="text-[10px] font-black">{item.prepTime}m</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-2 text-primary font-black uppercase tracking-widest text-[10px]">
                    {!readOnly ? (
                      <>
                        {cart[item.id] > 0 && (
                          <button
                            onClick={() => onUpdateCart(item.id, -1)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center glass-panel border-white/40 active:scale-90 transition-all hover:bg-red-500 hover:text-white"
                          >
                            <span className="material-icons-round text-base">remove</span>
                          </button>
                        )}
                        <button
                          disabled={!item.available}
                          onClick={() => onUpdateCart(item.id, 1)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all interactive-scale ${item.available
                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                          <span className="material-icons-round text-lg">
                            {item.available ? 'add' : 'lock_outline'}
                          </span>
                        </button>
                      </>
                    ) : (
                      <button className="w-9 h-9 rounded-xl glass-panel text-slate-400 cursor-default flex items-center justify-center">
                        <span className="material-icons-round text-lg">read_more</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default CustomerMenu;