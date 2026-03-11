
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

interface SavedCard {
    id: string;
    cardNumber: string; // Stored as masked **** **** **** 1234
    cardType: 'visa' | 'mastercard' | 'amex' | 'other';
    holderName: string;
    expiryDate: string;
}

const PaymentMethods: React.FC = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<SavedCard[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form states
    const [formData, setFormData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'payment_methods'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SavedCard));
            setCards(fetched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        // Mask the number
        const last4 = formData.number.slice(-4);
        const masked = `**** **** **** ${last4}`;
        
        // Determine type (simple logic)
        let type: SavedCard['cardType'] = 'other';
        if (formData.number.startsWith('4')) type = 'visa';
        else if (formData.number.startsWith('5')) type = 'mastercard';

        try {
            await addDoc(collection(db, 'payment_methods'), {
                userId: user.uid,
                cardNumber: masked,
                cardType: type,
                holderName: formData.name,
                expiryDate: formData.expiry,
                createdAt: serverTimestamp()
            });
            setIsAdding(false);
            setFormData({ number: '', name: '', expiry: '', cvv: '' });
        } catch (err) {
            console.error("Error adding card:", err);
            alert("Failed to add card. Please try again.");
        }
    };

    const handleDeleteCard = async (id: string) => {
        if (window.confirm("Remove this card?")) {
            await deleteDoc(doc(db, 'payment_methods', id));
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
            {/* iOS Status Bar */}
            <div className="px-8 pt-10 pb-2 flex justify-between items-center w-full">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">9:41</span>
                <div className="flex items-center space-x-1.5 text-slate-900 dark:text-white">
                    <span className="material-icons-round text-sm">signal_cellular_alt</span>
                    <span className="material-icons-round text-sm">wifi</span>
                    <span className="material-icons-round text-sm">battery_full</span>
                </div>
            </div>

            <header className="px-6 py-4 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                    <span className="material-icons-round text-primary">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Payment Methods</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6 pb-20">
                {/* Credits Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-600 rounded-[32px] p-8 text-white shadow-xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <span className="material-icons-round text-3xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">school</span>
                            <span className="font-black tracking-widest uppercase text-[10px] opacity-70">Uni-Eats Wallet</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium opacity-80">Campus Credits Balance</p>
                            <h3 className="text-4xl font-black">Rs. 4,250.00</h3>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Credit & Debit Cards</h3>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <span className="material-icons-round animate-spin text-primary">sync</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cards.map(card => (
                            <div key={card.id} className="flex items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.cardType === 'visa' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                                    <span className="material-icons-round">{card.cardType === 'visa' ? 'credit_card' : 'payments'}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{card.cardType.toUpperCase()} ending in {card.cardNumber.slice(-4)}</h4>
                                    <p className="text-xs text-slate-400">Expires {card.expiryDate} • {card.holderName}</p>
                                </div>
                                <button 
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-icons-round text-lg">delete_outline</span>
                                </button>
                            </div>
                        ))}

                        {isAdding ? (
                            <form onSubmit={handleAddCard} className="bg-white dark:bg-zinc-900 rounded-[32px] p-6 border-2 border-primary/20 space-y-4 animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white">Add New Card</h4>
                                    <button onClick={() => setIsAdding(false)} type="button" className="text-slate-400">
                                        <span className="material-icons-round">close</span>
                                    </button>
                                </div>
                                
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Card Number</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="0000 0000 0000 0000"
                                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-sm font-bold"
                                        value={formData.number}
                                        onChange={e => setFormData({ ...formData, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Card Holder Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Full Name"
                                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-sm font-bold"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Expiry Date</label>
                                        <input 
                                            required
                                            type="text" 
                                            placeholder="MM/YY"
                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-sm font-bold"
                                            value={formData.expiry}
                                            onChange={e => setFormData({ ...formData, expiry: e.target.value.slice(0, 5) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">CVV</label>
                                        <input 
                                            required
                                            type="password" 
                                            placeholder="***"
                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-sm font-bold"
                                            value={formData.cvv}
                                            onChange={e => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                >
                                    Save Card Details
                                </button>
                            </form>
                        ) : (
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="w-full py-5 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[28px] flex items-center justify-center gap-2 text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all active:scale-[0.98]"
                            >
                                <span className="material-icons-round">add</span>
                                Add New Credit/Debit Card
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default PaymentMethods;
