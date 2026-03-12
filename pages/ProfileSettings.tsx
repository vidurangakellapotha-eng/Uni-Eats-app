
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import StatusBar from '../components/layout/StatusBar';

const ProfileSettings: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [studentId, setStudentId] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);

    const avatars = [
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Aria',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
        'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
    ];

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        setName(user.displayName || '');
        setEmail(user.email || '');
        setPhotoURL(user.photoURL || '');
        setStudentId(user.uid.slice(0, 8).toUpperCase());

        // Load extra profile data from Firestore with fresh fetch
        const fetchProfile = async () => {
            try {
                const snapshot = await getDoc(doc(db, 'users', user.uid));
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    console.log("Fetched profile data:", data);
                    if (data.phone) setPhone(data.phone);
                    if (data.photoURL) setPhotoURL(data.photoURL);
                    if (data.name) setName(data.name);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
        };
        fetchProfile();
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser) return;

        setUploading(true);
        try {
            const storageRef = ref(storage, `profile_pics/${auth.currentUser.uid}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setPhotoURL(downloadURL);
            // Optionally save immediately
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
            await setDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: downloadURL }, { merge: true });
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) {
            alert("You must be logged in to save changes.");
            return;
        }

        setSaving(true);
        try {
            console.log("Saving changes for user:", user.uid, { name, phone, photoURL });
            
            // 1. Update Firebase Auth Profile
            await updateProfile(user, { 
                displayName: name, 
                photoURL: photoURL 
            });

            // 2. Update Firestore User Document
            const userRef = doc(db, 'users', user.uid);
            await setDoc(userRef, {
                name,
                email: user.email, // Keep email updated
                phone: phone,
                photoURL: photoURL,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            console.log("Profile saved successfully");
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            console.error('Failed to save profile:', err);
            alert(`Error saving profile: ${err.message || 'Unknown error'}`);
        } finally {
            setSaving(false);
        }
    };

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
                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Profile</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-8 pb-32">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-[42px] bg-white dark:bg-zinc-900 flex items-center justify-center p-1.5 shadow-2xl border-2 border-primary/20 overflow-hidden">
                            {uploading ? (
                                <div className="flex flex-col items-center gap-2">
                                    <span className="material-icons-round animate-spin text-primary text-3xl">sync</span>
                                    <span className="text-[10px] font-bold text-primary uppercase">Uploading</span>
                                </div>
                            ) : photoURL ? (
                                <img src={photoURL} className="w-full h-full rounded-[38px] object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full rounded-[38px] bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white text-4xl font-black">
                                    {name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                                </div>
                            )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="absolute -bottom-2 -right-2 flex flex-col gap-2">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-slate-50 dark:border-zinc-950 active:scale-90 transition-all hover:brightness-110"
                                title="Upload Photo"
                            >
                                <span className="material-icons-round text-lg">photo_camera</span>
                            </button>
                            <button 
                                onClick={() => setIsChoosingAvatar(!isChoosingAvatar)}
                                className="w-10 h-10 bg-white dark:bg-zinc-800 text-primary rounded-2xl flex items-center justify-center shadow-lg border-4 border-slate-50 dark:border-zinc-950 active:scale-90 transition-all hover:bg-slate-50"
                                title="Choose Avatar"
                            >
                                <span className="material-icons-round text-lg">face</span>
                            </button>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                        />
                    </div>
                    
                    <p className="mt-6 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">Update your profile picture</p>

                    {isChoosingAvatar && (
                        <div className="mt-8 p-6 bg-white dark:bg-zinc-900 rounded-[32px] border border-slate-100 dark:border-zinc-800 shadow-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="flex justify-between items-center mb-6 px-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Choose an avatar</p>
                                <button onClick={() => setIsChoosingAvatar(false)} className="text-slate-400"><span className="material-icons-round text-sm">close</span></button>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {avatars.map((av, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => { setPhotoURL(av); setIsChoosingAvatar(false); }}
                                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all active:scale-95 ${photoURL === av ? 'border-primary ring-2 ring-primary/20' : 'border-slate-100 dark:border-zinc-800'}`}
                                    >
                                        <img src={av} className="w-full h-full object-cover" alt={`Avatar ${i}`} />
                                        {photoURL === av && (
                                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                <span className="material-icons-round text-primary bg-white rounded-full text-xs p-0.5 shadow-sm">check</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Full Name</label>
                        <div className="relative">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">person</span>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Phone Number</label>
                        <div className="relative">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">phone</span>
                            <input 
                                type="tel" 
                                value={phone} 
                                onChange={(e) => setPhone(e.target.value)} 
                                placeholder="+94 77 123 4567" 
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2 opacity-60">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Email (Non-Editable)</label>
                        <div className="relative">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">email</span>
                            <input type="email" value={email} disabled className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 font-bold text-sm cursor-not-allowed" />
                        </div>
                    </div>

                    <div className="space-y-2 opacity-60">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2">Student ID (Non-Editable)</label>
                        <div className="relative">
                            <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">badge</span>
                            <input type="text" value={studentId} disabled className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-200 dark:border-zinc-800 text-slate-500 font-bold text-sm cursor-not-allowed" />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || uploading}
                    className={`w-full font-black py-5 rounded-[24px] shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${
                        saved 
                        ? 'bg-emerald-500 text-white shadow-emerald-200 dark:shadow-emerald-900/20' 
                        : 'bg-primary text-white shadow-primary/30'
                    } disabled:opacity-50`}
                >
                    {saving ? (
                        <><span className="material-icons-round animate-spin">sync</span> Saving Changes...</>
                    ) : saved ? (
                        <><span className="material-icons-round">check_circle</span> Changes Saved!</>
                    ) : (
                        <><span className="material-icons-round text-xl">save</span> Save Everything</>
                    )}
                </button>
            </main>
        </div>
    );
};

export default ProfileSettings;

