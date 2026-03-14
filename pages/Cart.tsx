
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuItem, PaymentMethod } from '../types';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import StatusBar from '../components/layout/StatusBar';

interface SavedCard {
  id: string;
  cardNumber: string;
  cardType: string;
}

const TEST_CARD: SavedCard = {
  id: 'test_card_visa_4242',
  cardNumber: '**** **** **** 4242',
  cardType: 'visa'
};

interface CartProps {
  menuItems: MenuItem[];
  cart: Record<string, number>;
  onUpdateCart: (itemId: string, delta: number) => void;
  onCheckout: (method: PaymentMethod, cardId?: string) => void;
}

const Cart: React.FC<CartProps> = ({ menuItems, cart, onUpdateCart, onCheckout }) => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.CREDITS);
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>('');
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'payment_methods'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SavedCard));
      const cards = [TEST_CARD, ...fetched];
      setSavedCards(cards);
      if (cards.length > 0 && !selectedCardId) {
        setSelectedCardId(cards[0].id);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = menuItems.find(m => m.id === id)!;
    return { ...item, quantity: qty };
  });

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal;

  const paymentOptions = [
    { 
      id: PaymentMethod.CREDITS, 
      icon: 'account_balance_wallet', 
      title: 'Campus Credits', 
      desc: 'Balance: LKR 4,250.00',
      color: 'bg-primary/10 text-primary' 
    },
    { 
      id: PaymentMethod.CASH, 
      icon: 'payments', 
      title: 'Cash at Counter', 
      desc: 'Pay when picking up',
      color: 'bg-emerald-500/10 text-emerald-600' 
    },
    { 
      id: PaymentMethod.CARD, 
      icon: 'credit_card', 
      title: 'Credit/Debit Card', 
      desc: savedCards.length > 0 
        ? `${savedCards.find(c => c.id === selectedCardId)?.cardType.toUpperCase() || 'Card'} ${savedCards.find(c => c.id === selectedCardId)?.cardNumber.slice(-9)}`
        : 'No cards saved',
      color: 'bg-blue-500/10 text-blue-600' 
    }
  ];

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark">
        <StatusBar />
        <header className="sm:hidden px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/menu')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800">
            <span className="material-icons-round text-primary">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Your Basket</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-40 h-40 rounded-full bg-primary/5 flex items-center justify-center mb-6">
            <span className="material-icons-round text-6xl text-primary/20">shopping_basket</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Basket is empty</h2>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">Looks like you haven't added anything to your order yet.</p>
          <button 
            onClick={() => navigate('/menu')}
            className="mt-8 bg-primary text-white font-black py-4 px-10 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-zinc-950">
      <StatusBar />

      <header className="sm:hidden px-6 py-4 flex items-center gap-4 sticky top-0 bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-lg z-10">
        <button 
          onClick={() => navigate('/menu')}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
        >
          <span className="material-icons-round text-primary">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Review Order</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-6 sm:px-12 py-4 sm:py-8 pb-48 hide-scrollbar max-w-5xl mx-auto w-full space-y-6">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Selected Items</p>
        
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-[32px] p-4 flex gap-4 shadow-sm border border-slate-100 dark:border-zinc-800 group animate-in slide-in-from-right duration-300">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{item.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-primary dark:text-amber-500">LKR {item.price}</span>
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800 p-1 rounded-xl border border-slate-100 dark:border-zinc-700">
                    <button 
                      onClick={() => onUpdateCart(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-icons-round text-xs">remove</span>
                    </button>
                    <span className="text-xs font-black w-4 text-center dark:text-white">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateCart(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                    >
                      <span className="material-icons-round text-xs">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className="space-y-3">
          <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Choose Payment Method</p>
          <div className="space-y-3">
            {paymentOptions.map((opt) => (
              <div key={opt.id} className="space-y-3">
                <button
                  onClick={() => setSelectedMethod(opt.id)}
                  className={`w-full bg-white dark:bg-zinc-900 rounded-[24px] p-4 shadow-sm border transition-all flex items-center justify-between group ${
                    selectedMethod === opt.id 
                      ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]' 
                      : 'border-slate-100 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${opt.color}`}>
                      <span className="material-icons-round text-xl">{opt.icon}</span>
                    </div>
                    <div className="text-left">
                      <h4 className={`font-bold text-sm transition-colors ${selectedMethod === opt.id ? 'text-primary dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>{opt.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold">{opt.desc}</p>
                    </div>
                  </div>
                  {selectedMethod === opt.id ? (
                    <span className="material-icons-round text-primary text-xl">check_circle</span>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-slate-100 dark:border-zinc-700 group-hover:border-slate-200"></div>
                  )}
                </button>

                {/* Sub-menu for Card selection */}
                {selectedMethod === PaymentMethod.CARD && opt.id === PaymentMethod.CARD && (
                  <div className="pl-4 pr-2 space-y-2 py-2 animate-in slide-in-from-top-4 duration-300">
                    {savedCards.length > 0 ? (
                      savedCards.map(card => (
                        <button
                          key={card.id}
                          onClick={() => setSelectedCardId(card.id)}
                          className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                            selectedCardId === card.id 
                              ? 'bg-primary/5 border-primary/30' 
                              : 'bg-slate-50 dark:bg-zinc-800 border-slate-100 dark:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="material-icons-round text-slate-400 text-sm">credit_card</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{card.cardNumber}</span>
                          </div>
                          {selectedCardId === card.id && <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>}
                        </button>
                      ))
                    ) : (
                      <button 
                        onClick={() => navigate('/account/payment')}
                        className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 text-slate-400 text-xs font-bold flex items-center justify-center gap-2"
                      >
                        <span className="material-icons-round text-sm">add</span>
                        Add a card to continue
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 shadow-sm border border-slate-100 dark:border-zinc-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-slate-500">Subtotal</span>
            <span className="text-slate-900 dark:text-white">LKR {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs font-medium">
            <span className="text-slate-500">Service Fee</span>
            <span className="text-emerald-500 font-bold">FREE</span>
          </div>
          <div className="pt-3 border-t border-dashed border-slate-100 dark:border-zinc-800 flex justify-between items-center">
            <span className="font-black text-slate-900 dark:text-white text-base">Total</span>
            <span className="font-black text-primary dark:text-amber-500 text-xl">LKR {total.toFixed(2)}</span>
          </div>
        </section>
      </main>

      <div className="p-6 ios-blur bg-white/80 dark:bg-zinc-900/80 border-t border-slate-100 dark:border-zinc-800 sticky bottom-0 z-20">
        <div className="max-w-5xl mx-auto w-full">
          <button 
            onClick={() => {
              if (selectedMethod === PaymentMethod.CARD && savedCards.length === 0) {
                alert("Please add a payment card first.");
                navigate('/account/payment');
                return;
              }
              onCheckout(selectedMethod, selectedMethod === PaymentMethod.CARD ? selectedCardId : undefined);
            }}
            className="w-full bg-primary hover:bg-opacity-90 transition-all text-white font-black py-4 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center space-x-3 active:scale-[0.98]"
          >
            <span className="material-icons-round">payment</span>
            <span>Pay LKR {total.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
