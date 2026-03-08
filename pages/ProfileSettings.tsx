
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileSettings: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('John Doe');
    const [email, setEmail] = useState('john.doe@student.nibm.lk');
    const [phone, setPhone] = useState('+94 77 123 4567');
    const [studentId, setStudentId] = useState('STU12345');

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
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 active:scale-95 transition-all"
                >
                    <span className="material-icons-round text-primary">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                            {name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-zinc-800 rounded-full shadow-md flex items-center justify-center border border-slate-100 dark:border-zinc-700 text-primary">
                            <span className="material-icons-round text-sm">edit</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Student Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Student ID</label>
                        <input
                            type="text"
                            value={studentId}
                            disabled
                            className="w-full p-4 bg-slate-100 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                        />
                    </div>
                </div>

                <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all mt-8">
                    Save Changes
                </button>
            </main>
        </div>
    );
};

export default ProfileSettings;
