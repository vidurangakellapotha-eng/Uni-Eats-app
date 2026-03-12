
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import StatusBar from '../components/layout/StatusBar';

const NotificationSettings: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        orderUpdates: true,
        promotions: true,
        cafeteriaNews: true,
        emailDigest: false,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            const user = auth.currentUser;
            if (!user) return;
            try {
                const docRef = doc(db, 'users', user.uid);
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().notificationSettings) {
                    setSettings({ ...settings, ...snap.data().notificationSettings });
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const updateSetting = async (key: string, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        
        const user = auth.currentUser;
        if (!user) return;

        try {
            await setDoc(doc(db, 'users', user.uid), {
                notificationSettings: newSettings
            }, { merge: true });
        } catch (err) {
            console.error("Error saving setting:", err);
        }
    };

    const Toggle: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 transition-all duration-300">
            <div className="flex-1 pr-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{label}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${checked ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-zinc-700'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${checked ? 'left-6' : 'left-1'}`} />
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
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Alerts</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <div className="space-y-4">
                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Push Notifications</p>
                    <div className="space-y-3">
                        <Toggle
                            label="Order Updates"
                            desc="Get real-time alerts when your food is ready for pickup"
                            checked={settings.orderUpdates}
                            onChange={(v) => updateSetting('orderUpdates', v)}
                        />
                        <Toggle
                            label="Promotions & Deals"
                            desc="Stay updated with daily cafeteria offers and discounts"
                            checked={settings.promotions}
                            onChange={(v) => updateSetting('promotions', v)}
                        />
                        <Toggle
                            label="Cafeteria News"
                            desc="Important updates regarding opening hours and menu changes"
                            checked={settings.cafeteriaNews}
                            onChange={(v) => updateSetting('cafeteriaNews', v)}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Notifications</p>
                    <div className="space-y-3">
                        <Toggle
                            label="Weekly Digest"
                            desc="Every Sunday: A summary of your spending and favorite meals"
                            checked={settings.emailDigest}
                            onChange={(v) => updateSetting('emailDigest', v)}
                        />
                    </div>
                </div>

                <div className="mt-8 p-6 bg-primary/5 dark:bg-primary/10 rounded-[32px] border border-primary/10">
                    <div className="flex items-start gap-4">
                        <span className="material-icons-round text-primary">info</span>
                        <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Note on Email Digest</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                The weekly digest is generated every Sunday at 9:00 PM. You'll receive a summary of your expenditures across all payment methods.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationSettings;
