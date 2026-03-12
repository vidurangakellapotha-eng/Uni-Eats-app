
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

        <header className="mobile-only-header px-6 py-4 flex justify-between items-center bg-transparent backdrop-blur-md">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Uni Eats</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NIBM Central Cafeteria</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onClearUnread?.(); navigate('/notifications'); }}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all relative shadow-sm"
            >
              <span className="material-icons-round text-slate-400 text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white dark:border-zinc-900">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => !readOnly && navigate('/cart')}
              className={`w-12 h-12 rounded-full flex items-center justify-center relative transition-all ${readOnly ? 'bg-transparent cursor-default' : 'bg-primary shadow-lg shadow-primary/20 active:scale-95'}`}
            >
              {!readOnly && <span className="material-icons-round text-white">shopping_bag</span>}
              {!readOnly && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black shadow-sm border-2 border-primary">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className={`bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-zinc-800 transition-all flex flex-col ${!item.available ? 'opacity-70' : ''}`}>
              <div className="relative h-28 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                {!item.available && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-white bg-red-500 px-2 py-1 rounded-md">Out of Stock</span>
                  </div>
                )}
                {cart[item.id] > 0 && (
                  <div className="absolute top-2 left-2 bg-primary text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-md">
                    {cart[item.id]} In Cart
                  </div>
                )}
              </div>
              <div className="p-3 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="font-bold text-xs dark:text-white leading-tight line-clamp-1">{item.name}</h3>
                  <span className="text-primary font-black text-[11px]">LKR {item.price}</span>
                </div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 mb-2 line-clamp-2 h-6">{item.description}</p>
                <div className="mt-auto">
                  {/* Rating + Prep Time row */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-secondary">
                      <span className="material-icons-round text-[10px]">star</span>
                      <span className="text-[9px] font-black ml-0.5">{item.rating}</span>
                    </div>
                    {item.prepTime && (
                      <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                        <span className="material-icons-round text-[9px]">schedule</span>
                        <span className="text-[9px] font-black">{item.prepTime} min</span>
                      </div>
                    )}
                  </div>
                  {/* Add to cart */}
                  <div className="flex items-center justify-end gap-1.5">
                    {!readOnly ? (
                      <>
                        {cart[item.id] > 0 && (
                          <button
                            onClick={() => onUpdateCart(item.id, -1)}
                            className="p-1.5 rounded-lg border border-slate-100 dark:border-zinc-700 text-primary active:scale-90 transition-all bg-slate-50 dark:bg-zinc-800"
                          >
                            <span className="material-icons-round text-[12px]">remove</span>
                          </button>
                        )}
                        <button
                          disabled={!item.available}
                          onClick={() => onUpdateCart(item.id, 1)}
                          className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${item.available
                            ? 'bg-primary text-white hover:opacity-90 active:scale-90'
                            : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
                            }`}
                        >
                          <span className="material-icons-round text-[16px]">
                            {item.available ? (cart[item.id] > 0 ? 'add' : 'add_shopping_cart') : 'block'}
                          </span>
                        </button>
                      </>
                    ) : (
                      <button className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-default">
                        <span className="material-icons-round text-[16px]">visibility</span>
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