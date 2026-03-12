
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import StatusBar from '../components/layout/StatusBar';

const PrivacySettings: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    
    const [settings, setSettings] = useState({
        dataSharing: false,
        locationServices: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const user = auth.currentUser;
            if (!user) return;
            try {
                const docRef = doc(db, 'users', user.uid);
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().privacySettings) {
                    setSettings({ ...settings, ...snap.data().privacySettings });
                }
            } catch (err) {
                console.error("Error fetching privacy settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updatePrivacySetting = async (key: string, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        
        const user = auth.currentUser;
        if (!user) return;

        try {
            await setDoc(doc(db, 'users', user.uid), {
                privacySettings: newSettings
            }, { merge: true });
        } catch (err) {
            console.error("Error saving privacy setting:", err);
        }
    };

    const handlePasswordChange = async () => {
        const user = auth.currentUser;
        if (!user || !user.email) return;

        setActionLoading(true);
        try {
            await sendPasswordResetEmail(auth, user.email);
            setFeedback({ msg: `Reset link sent to ${user.email}`, type: 'success' });
        } catch (err: any) {
            setFeedback({ msg: err.message, type: 'error' });
        } finally {
            setActionLoading(false);
            setTimeout(() => setFeedback(null), 5000);
        }
    };

    const handleDeleteAccountData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setActionLoading(true);
        try {
            const batch = writeBatch(db);
            
            // 1. Delete user document
            batch.delete(doc(db, 'users', user.uid));

            // 2. Find and delete notifications
            const notifSnap = await getDocs(query(collection(db, 'notifications'), where('userId', '==', user.uid)));
            notifSnap.forEach(d => batch.delete(d.ref));

            // 3. Find and delete orders
            const orderSnap = await getDocs(query(collection(db, 'orders'), where('userId', '==', user.uid)));
            orderSnap.forEach(d => batch.delete(d.ref));

            await batch.commit();

            // 4. Delete Auth user
            // Note: deleteUser might fail if session is old. We handle that in catch.
            await deleteUser(user);
            
            navigate('/login');
        } catch (err: any) {
            console.error("Delete failed:", err);
            if (err.code === 'auth/requires-recent-login') {
                setFeedback({ msg: "Please log out and log in again to verify your identity before deleting.", type: 'error' });
            } else {
                setFeedback({ msg: "Failed to delete account. Try again later.", type: 'error' });
            }
        } finally {
            setActionLoading(false);
            setShowDeleteConfirm(false);
            setTimeout(() => setFeedback(null), 5000);
        }
    };

    const Toggle: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 transition-all">
            <div className="flex-1 pr-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{label}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
            </div>
            <button
                disabled={actionLoading}
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${checked ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-zinc-700'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
                <span className="material-icons-round text-primary animate-spin text-4xl">sync</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-transparent">
            <StatusBar />
            <header className="px-6 py-6 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                    <span className="material-icons-round text-primary text-xl">arrow_back</span>
                </button>
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Security</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {feedback && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${feedback.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        <span className="material-icons-round">{feedback.type === 'success' ? 'check_circle' : 'error'}</span>
                        <p className="text-xs font-bold">{feedback.msg}</p>
                    </div>
                )}

                <div className="space-y-4">
                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Account Security</p>
                    
                    {/* Password Row */}
                    <button 
                        onClick={handlePasswordChange}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 group disabled:opacity-50"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                                <span className="material-icons-round">lock</span>
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Change Password</h4>
                                <p className="text-[10px] text-slate-400">Receive a secure reset link via email</p>
                            </div>
                        </div>
                        {actionLoading ? (
                            <span className="material-icons-round animate-spin text-slate-300">sync</span>
                        ) : (
                            <span className="material-icons-round text-slate-300 group-hover:text-primary transition-all">chevron_right</span>
                        )}
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Data Privacy</p>
                    <div className="space-y-3">
                        <Toggle
                            label="Data Sharing"
                            desc="Help us improve the cafeteria experience by sharing anonymous usage statistics"
                            checked={settings.dataSharing}
                            onChange={(v) => updatePrivacySetting('dataSharing', v)}
                        />
                        <Toggle
                            label="Location Services"
                            desc="Required for campus-specific offers and accurate delivery/pickup estimates"
                            checked={settings.locationServices}
                            onChange={(v) => updatePrivacySetting('locationServices', v)}
                        />
                    </div>
                </div>

                {/* Important Privacy Note */}
                <div className="p-6 bg-slate-100 dark:bg-zinc-900/50 rounded-[32px] border border-slate-200 dark:border-zinc-800">
                    <div className="flex items-start gap-3">
                        <span className="material-icons-round text-slate-400 text-sm">info</span>
                        <div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                NIBM Uni-Eats respects your privacy. Location data is only used while the app is active and is never stored on our servers permanently. Data sharing is strictly for operational improvements.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full py-5 text-red-500 text-xs font-black uppercase tracking-widest bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-[32px] active:scale-95 transition-all"
                    >
                        Delete Account Data
                    </button>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[40px] p-8 shadow-2xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center mb-6">
                            <span className="material-icons-round text-3xl">warning</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Delete Everything?</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                            This will permanently remove your profile, order history, and saved ratings. This action cannot be undone.
                        </p>
                        <div className="w-full space-y-3">
                            <button
                                onClick={handleDeleteAccountData}
                                disabled={actionLoading}
                                className="w-full py-5 bg-red-500 text-white font-black rounded-3xl shadow-xl shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50 flex justify-center"
                            >
                                {actionLoading ? <span className="material-icons-round animate-spin">sync</span> : "Yes, Delete My Data"}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="w-full py-5 bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white font-black rounded-3xl active:scale-95 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PrivacySettings;
