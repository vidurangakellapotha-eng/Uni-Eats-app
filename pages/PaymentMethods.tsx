
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import StatusBar from '../components/layout/StatusBar';

interface SavedCard {
    id: string;
    cardNumber: string; // Masked
    cardType: 'visa' | 'mastercard' | 'amex' | 'other';
    holderName: string;
    expiryDate: string;
}

const PaymentMethods: React.FC = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<SavedCard[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [isFunding, setIsFunding] = useState(false); // Controls the funding modal
    const [selectedFundAmount, setSelectedFundAmount] = useState<number | null>(null); // Track selected amount before payment
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null); // Track the chosen card for top-up
    const [walletBalance, setWalletBalance] = useState(4250.00); // Stateful fake balance
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<User | null>(auth.currentUser);

    // Form states
    const [formData, setFormData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!u) setLoading(false);
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!user) return;

        setLoading(true);
        const q = query(collection(db, 'payment_methods'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SavedCard));
            setCards(fetched);
            setLoading(false);
        }, (err) => {
            console.error("Firestore error:", err);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user]);

    // Formatters
    const formatCardNumber = (val: string) => {
        const numbers = val.replace(/\D/g, '').slice(0, 16);
        return numbers.replace(/(\d{4})/g, '$1 ').trim();
    };

    const formatExpiry = (val: string) => {
        const numbers = val.replace(/\D/g, '').slice(0, 4);
        if (numbers.length > 2) {
            return numbers.substring(0, 2) + '/' + numbers.substring(2);
        }
        return numbers;
    };

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = auth.currentUser || user;
        if (!currentUser) {
            alert("Session expired. Please log in again.");
            return;
        }

        if (formData.number.replace(/\D/g, '').length < 16) {
            alert("Please enter a valid 16-digit card number.");
            return;
        }

        setSubmitting(true);
        // Mask the number
        const last4 = formData.number.replace(/\D/g, '').slice(-4);
        const masked = `**** **** **** ${last4}`;
        
        let type: SavedCard['cardType'] = 'other';
        const num = formData.number.replace(/\D/g, '');
        if (num.startsWith('4')) type = 'visa';
        else if (num.startsWith('5')) type = 'mastercard';

        try {
            console.log("Attempting to save card for user:", currentUser.uid);
            const docRef = await addDoc(collection(db, 'payment_methods'), {
                userId: currentUser.uid,
                cardNumber: masked,
                cardType: type,
                holderName: formData.name,
                expiryDate: formData.expiry,
                createdAt: serverTimestamp()
            });
            console.log("Card saved with ID:", docRef.id);
            setIsAdding(false);
            setFormData({ number: '', name: '', expiry: '', cvv: '' });
        } catch (err: any) {
            console.error("FULL ERROR SAVING CARD:", err);
            let msg = "Failed to save card.";
            if (err.code === 'permission-denied') {
                msg += " Firestore rules are blocking this write. Please check your Firebase rules.";
            } else if (err.code === 'unavailable') {
                msg += " Firestore service is currently unavailable. Check your connection.";
            } else {
                msg += " " + (err.message || "Unknown error occurred.");
            }
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteCard = async (id: string) => {
        if (window.confirm("Remove this card?")) {
            await deleteDoc(doc(db, 'payment_methods', id));
        }
    };

    const handleAddFunds = () => {
        if (!selectedFundAmount) {
            alert("Please select an amount to add.");
            return;
        }
        if (!selectedCardId) {
            alert("Please select a valid Credit/Debit card to process the payment.");
            return;
        }

        setSubmitting(true);
        // Simulate a tiny network delay for the transaction processing UX
        setTimeout(() => {
            setWalletBalance(prev => prev + selectedFundAmount);
            const addedAmount = selectedFundAmount; // capture before reset
            setSubmitting(false);
            setIsFunding(false);
            setSelectedFundAmount(null);
            setSelectedCardId(null);
            alert(`Rs. ${addedAmount.toFixed(2)} successfully added to your Campus Credits!`);
        }, 1200);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-transparent">
            <div className="sm:hidden">
                <StatusBar />
            </div>

            <header className="sm:hidden px-6 py-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                    <span className="material-icons-round text-primary text-xl">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Payments</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-8 sm:py-16 pb-32 hide-scrollbar">
                <div className="max-w-2xl mx-auto w-full space-y-8">
                {/* Credits Card */}
                <div className="relative overflow-hidden bg-gradient-to-br from-primary to-orange-600 rounded-[32px] p-8 text-white shadow-xl shadow-primary/20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <span className="material-icons-round text-3xl bg-white/20 p-2 rounded-xl backdrop-blur-sm">school</span>
                            <span className="font-black tracking-widest uppercase text-[10px] opacity-70">Uni-Eats Wallet</span>
                        </div>
                        <div className="space-y-1 mb-8">
                            <p className="text-xs font-medium opacity-80">Campus Credits Balance</p>
                            <h3 className="text-4xl font-black transition-all">Rs. {walletBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                        </div>
                        <button 
                            onClick={() => {
                                setIsFunding(true);
                                setSelectedFundAmount(null);
                                setSelectedCardId(null);
                            }}
                            className="bg-white text-primary px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 active:scale-95 transition-all shadow-lg shadow-black/10"
                        >
                            + Add Funds
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between px-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Credit & Debit Cards</h3>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <span className="material-icons-round animate-spin text-primary">sync</span>
                    </div>
                ) : !user ? (
                    <div className="text-center p-8 bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-zinc-800">
                        <p className="text-slate-500 text-sm">Please log in to manage your cards.</p>
                        <button onClick={() => navigate('/login')} className="mt-4 text-primary font-bold">Login Now</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {cards.map(card => (
                            <div key={card.id} className="flex items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-[24px] border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.cardType === 'visa' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
                                    <span className="material-icons-round text-2xl">
                                        {card.cardType === 'visa' ? 'credit_card' : 'payments'}
                                    </span>
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
                                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-sm font-bold placeholder:opacity-30"
                                        value={formData.number}
                                        onChange={e => setFormData({ ...formData, number: formatCardNumber(e.target.value) })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Card Holder Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Name on card"
                                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-sm font-bold placeholder:opacity-30"
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
                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-sm font-bold placeholder:opacity-30"
                                            value={formData.expiry}
                                            onChange={e => setFormData({ ...formData, expiry: formatExpiry(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">CVV</label>
                                        <input 
                                            required
                                            type="password" 
                                            placeholder="***"
                                            className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none text-sm font-bold placeholder:opacity-30"
                                            value={formData.cvv}
                                            onChange={e => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                                        />
                                    </div>
                                </div>

                                <button 
                                    disabled={submitting}
                                    type="submit"
                                    className={`w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 transition-all ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {submitting ? (
                                        <>
                                            <span className="material-icons-round animate-spin text-sm">sync</span>
                                            Saving...
                                        </>
                                    ) : 'Save Card Details'}
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
                </div>
            </main>

            {/* Fund Wallet Modal */}
            {isFunding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[32px] p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-800 pb-4">
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white">Top Up Wallet</h3>
                                <p className="text-xs text-slate-400 mt-1">Select an amount to simulate adding funds</p>
                            </div>
                            <button onClick={() => setIsFunding(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <span className="material-icons-round text-sm">close</span>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {[500, 1000, 2000, 5000].map(amount => (
                                <button
                                    key={amount}
                                    disabled={submitting}
                                    onClick={() => setSelectedFundAmount(amount)}
                                    className={`py-4 rounded-2xl border-2 font-black transition-all active:scale-[0.98] ${submitting ? 'cursor-not-allowed opacity-50' : ''} ${selectedFundAmount === amount ? 'border-primary bg-primary/10 text-primary' : 'border-slate-100 dark:border-zinc-800 text-slate-400 hover:border-primary/30'}`}
                                >
                                    + {amount.toLocaleString()}
                                </button>
                            ))}
                        </div>

                        {/* Payment Method Selector for Top-Up */}
                        {!submitting && (
                            <div className="space-y-3">
                                <div className="h-px w-full bg-slate-100 dark:bg-zinc-800 my-4"></div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Select Payment Source</h4>
                                {cards.length === 0 ? (
                                    <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-center">
                                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium tracking-wide">
                                            You must add a Credit or Debit card below before you can top up your wallet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 hide-scrollbar">
                                        {cards.map(card => (
                                            <button
                                                key={card.id}
                                                onClick={() => setSelectedCardId(card.id)}
                                                className={`w-full flex items-center text-left gap-3 p-3 rounded-xl border transition-all ${selectedCardId === card.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : 'border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-600'}`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.cardType === 'visa' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-600'}`}>
                                                    <span className="material-icons-round text-sm">
                                                        {card.cardType === 'visa' ? 'credit_card' : 'payments'}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-xs font-bold ${selectedCardId === card.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                        {card.cardType.toUpperCase()} {card.cardNumber.slice(-4)}
                                                    </p>
                                                </div>
                                                {selectedCardId === card.id && (
                                                    <span className="material-icons-round text-emerald-500 text-sm">check_circle</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <button 
                                    disabled={!selectedCardId || !selectedFundAmount}
                                    onClick={handleAddFunds}
                                    className={`w-full py-4 mt-2 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all shadow-lg ${(selectedCardId && selectedFundAmount) ? 'bg-primary text-white hover:bg-orange-600 shadow-primary/20 active:scale-95' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'}`}
                                >
                                    Confirm Top-Up
                                </button>
                            </div>
                        )}
                        
                        {submitting && (
                            <div className="flex flex-col items-center justify-center py-8 bg-orange-50 dark:bg-orange-900/10 rounded-2xl animate-in zoom-in duration-300">
                                <span className="material-icons-round text-primary animate-spin text-4xl mb-3">sync</span>
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Processing...</span>
                            </div>
                        )}
                        
                        {!submitting && (
                            <p className="text-[10px] text-center text-slate-400 font-bold tracking-wider uppercase px-4 pt-2">
                                This is a simulation. No real money will be charged.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentMethods;
