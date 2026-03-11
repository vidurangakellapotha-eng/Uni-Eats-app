import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

interface Message {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    isAdmin: boolean;
    createdAt: any;
}

const SupportChat: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Removed orderBy to avoid requiring a composite index in Firestore
        // We will sort locally to ensure it works immediately without manual index creation
        const q = query(
            collection(db, 'supportMessages'),
            where('chatId', '==', user.uid)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const msgs = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Message));
            
            // Sort locally by timestamp
            msgs.sort((a, b) => {
                const timeA = a.createdAt?.toMillis?.() || 0;
                const timeB = b.createdAt?.toMillis?.() || 0;
                return timeA - timeB;
            });

            setMessages(msgs);
            setLoading(false);
        }, (err) => {
            console.error("Chat listener error:", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, navigate]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        const text = inputText;
        setInputText('');

        try {
            await addDoc(collection(db, 'supportMessages'), {
                chatId: user.uid,
                text,
                senderId: user.uid,
                senderName: user.displayName || 'Student',
                isAdmin: false,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-zinc-950">
            {/* iOS Header */}
            <div className="px-8 pt-10 pb-2 flex justify-between items-center w-full bg-white dark:bg-zinc-950 z-10">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">9:41</span>
                <div className="flex items-center space-x-1.5 text-slate-900 dark:text-white">
                    <span className="material-icons-round text-sm">signal_cellular_alt</span>
                    <span className="material-icons-round text-sm">wifi</span>
                    <span className="material-icons-round text-sm">battery_full</span>
                </div>
            </div>

            <header className="px-6 py-4 flex items-center gap-4 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-zinc-900 active:scale-95 transition-all"
                >
                    <span className="material-icons-round text-primary">arrow_back</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-icons-round">support_agent</span>
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-slate-900 dark:text-white">Live Support</h1>
                        <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Online
                        </div>
                    </div>
                </div>
            </header>

            <main 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-zinc-950"
            >
                {loading ? (
                    <div className="flex justify-center py-10">
                        <span className="material-icons-round text-primary animate-spin">sync</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400">
                            <span className="material-icons-round text-3xl">chat_bubble_outline</span>
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-slate-900 dark:text-white">Start a Conversation</p>
                            <p className="text-xs text-slate-500">How can we help you today?</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div 
                            key={msg.id}
                            className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}
                        >
                            <div 
                                className={`max-w-[80%] p-4 rounded-3xl text-sm ${
                                    msg.isAdmin 
                                    ? 'bg-white dark:bg-zinc-900 text-slate-900 dark:text-white rounded-tl-none border border-slate-100 dark:border-zinc-800' 
                                    : 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'
                                }`}
                            >
                                <p className="leading-relaxed">{msg.text}</p>
                                <div className={`text-[9px] mt-1.5 opacity-60 font-medium ${msg.isAdmin ? 'text-slate-400' : 'text-primary-foreground'}`}>
                                    {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>

            <footer className="p-4 bg-white dark:bg-zinc-950 border-t border-slate-100 dark:border-zinc-800 pb-8">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 py-4 px-6 bg-slate-50 dark:bg-zinc-900 border-none rounded-3xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim()}
                        className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-90"
                    >
                        <span className="material-icons-round">send</span>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default SupportChat;
