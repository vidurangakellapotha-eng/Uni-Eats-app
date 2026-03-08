
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacySettings: React.FC = () => {
    const navigate = useNavigate();
    const [dataSharing, setDataSharing] = useState(false);
    const [locationServices, setLocationServices] = useState(true);

    const Toggle: React.FC<{ label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }> = ({ label, desc, checked, onChange }) => (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <div>
                <h4 className="font-bold text-slate-900 dark:text-white">{label}</h4>
                <p className="text-xs text-slate-400">{desc}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-7 rounded-full transition-colors relative ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-zinc-700'}`}
            >
                <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-6' : 'left-1'}`} />
            </button>
        </div>
    );

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
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Privacy & Security</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security</p>
                <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                            <span className="material-icons-round">lock</span>
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-900 dark:text-white">Change Password</h4>
                            <p className="text-xs text-slate-400">Last changed 30 days ago</p>
                        </div>
                    </div>
                    <span className="material-icons-round text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 group">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
                            <span className="material-icons-round">fingerprint</span>
                        </div>
                        <div className="text-left">
                            <h4 className="font-bold text-slate-900 dark:text-white">Biometric Login</h4>
                            <p className="text-xs text-slate-400">Face ID enabled</p>
                        </div>
                    </div>
                    <span className="material-icons-round text-primary">toggle_on</span>
                </button>

                <p className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-6">Data Privacy</p>
                <div className="space-y-3">
                    <Toggle
                        label="Data Sharing"
                        desc="Allow usage data to improve app"
                        checked={dataSharing}
                        onChange={setDataSharing}
                    />
                    <Toggle
                        label="Location Services"
                        desc="For cafe location and pickup estimates"
                        checked={locationServices}
                        onChange={setLocationServices}
                    />
                </div>

                <div className="pt-8">
                    <button className="w-full py-4 text-red-500 text-sm font-bold bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-900/30 rounded-2xl">
                        Delete Account Data
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PrivacySettings;
