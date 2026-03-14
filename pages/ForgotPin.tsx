import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPin: React.FC = () => {
    const navigate = useNavigate();
    
    // States
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSendResetLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setLoading(false);
            setSuccess(true);
        } catch (err: any) {
            setLoading(false);
            if (err.code === 'auth/user-not-found') {
                alert("Error: No student account was found with this email.");
            } else if (err.code === 'auth/invalid-email') {
                alert("Error: Please enter a valid email address.");
            } else {
                alert(`Error: ${err.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center p-6 bg-white dark:bg-zinc-900 relative">
            <div className="absolute top-0 w-full flex justify-between px-8 py-4 pointer-events-none">
                <span className="text-sm font-semibold">9:41</span>
                <div className="flex gap-1.5 items-center">
                    <span className="material-icons-round text-sm">signal_cellular_alt</span>
                    <span className="material-icons-round text-sm">wifi</span>
                    <span className="material-icons-round text-sm">battery_full</span>
                </div>
            </div>

            <div className="w-full flex-1 flex flex-col justify-center max-w-sm space-y-8 animate-in fade-in duration-300">
                <button
                    onClick={() => navigate('/login')}
                    className="absolute top-12 left-6 w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-zinc-800 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    <span className="material-icons-round">arrow_back</span>
                </button>

                <div className="text-center space-y-4">
                    {success ? (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 mb-4 animate-in zoom-in">
                            <span className="material-icons-round text-4xl">mark_email_read</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-500/20 text-amber-500 mb-4 animate-in zoom-in">
                            <span className="material-icons-round text-4xl">lock_reset</span>
                        </div>
                    )}
                    
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {success ? 'Email Sent!' : 'Reset Password'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed px-4">
                            {success 
                                ? 'We have sent a highly secure password reset link directly to your inbox. Check your email to recover access.' 
                                : 'Enter your university email address. We will securely send you a link to choose a new password.'}
                        </p>
                    </div>
                </div>

                {!success ? (
                    <form onSubmit={handleSendResetLink} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                University Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@student.nibm.lk"
                                className="w-full px-4 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className={`w-full text-white font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading || !email ? 'bg-slate-300 dark:bg-zinc-700 cursor-not-allowed' : 'bg-primary shadow-primary/20 hover:bg-orange-600'}`}
                        >
                            {loading ? <span className="material-icons-round animate-spin text-sm">sync</span> : null}
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                ) : (
                    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300 pt-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all shadow-xl shadow-slate-900/20"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPin;
