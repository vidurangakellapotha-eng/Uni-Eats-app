
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const ProfileSettings: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [studentId, setStudentId] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        setName(user.displayName || '');
        setEmail(user.email || '');
        setStudentId(user.uid.slice(0, 8).toUpperCase());

        // Load extra profile data from Firestore
        getDoc(doc(db, 'users', user.uid)).then(snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setPhone(data.phone || '');
            }
        });
    }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;
        setSaving(true);
        try {
            // Update Firebase Auth display name
            await updateProfile(user, { displayName: name });
            // Save extra fields to Firestore users collection
            await setDoc(doc(db, 'users', user.uid), {
                name,
                email,
                phone,
                updatedAt: new Date(),
            }, { merge: true });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Failed to save profile:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
            <div className="px-8 pt-10 pb-2 flex justify-between items-center w-full">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">9:41</span>
                <div className="flex items-center space-x-1.5 text-slate-900 dark:text-white">
                    <span className="material-icons-round text-sm">signal_cellular_alt</span>
                    <span className="material-icons-round text-sm">wifi</span>
                    <span className="material-icons-round text-sm">battery_full</span>
                </div>
            </div>

            <header className="px-6 py-4 flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all">
                    <span className="material-icons-round text-primary">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                            {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Student Email</label>
                        <input type="email" value={email} disabled className="w-full p-4 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 77 123 4567" className="w-full p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Student ID</label>
                        <input type="text" value={studentId} disabled className="w-full p-4 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`w-full font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all mt-8 flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white shadow-green-200' : 'bg-primary text-white shadow-primary/20'}`}
                >
                    {saving ? (
                        <><span className="material-icons-round animate-spin text-lg">sync</span> Saving...</>
                    ) : saved ? (
                        <><span className="material-icons-round">check_circle</span> Saved!</>
                    ) : (
                        <><span className="material-icons-round">save</span> Save Changes</>
                    )}
                </button>
            </main>
        </div>
    );
};

export default ProfileSettings;
