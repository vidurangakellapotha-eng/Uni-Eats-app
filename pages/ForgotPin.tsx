import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPin: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'choose' | 'verify' | 'reset' | 'success'>('choose');
    
    // Form States
    const [contactType, setContactType] = useState<'email' | 'mobile'>('email');
    const [contactValue, setContactValue] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // Recovery Code State (For Dashboard Simulation)
    const [generatedCode, setGeneratedCode] = useState('');
    const [showMockSms, setShowMockSms] = useState(false);
    
    // Loading States
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contactValue) return;
        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedCode(code);
            setShowMockSms(true);
            setStep('verify');
        }, 1200);
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (otpCode.length < 6) return;
        setLoading(true);
        
        // Strict Validation Check
        if (otpCode !== generatedCode) {
            setTimeout(() => {
                setLoading(false);
                alert("Incorrect code. Please try again.");
            }, 800);
            return;
        }

        // Simulate code verification
        setTimeout(() => {
            setLoading(false);
            setShowMockSms(false); // Hide the popup once verified
            setStep('reset');
        }, 1200);
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) return;
        setLoading(true);
        
        try {
            const res = await fetch('/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    identifier: contactValue,
                    newPassword: newPassword
                })
            });
            const data = await res.json();
            
            setLoading(false);
            if (data.success) {
                setStep('success');
            } else {
                alert(data.error || "Failed to update password.");
            }
        } catch (err: any) {
             setLoading(false);
             alert("Network error processing password reset: " + err.message);
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

            {/* MOCK SMS NOTIFICATION BANNER */}
            {showMockSms && (
                <div className="absolute top-12 left-4 right-4 bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-auto border border-slate-700">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-icons-round text-primary text-xl">{contactType === 'mobile' ? 'sms' : 'mail'}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <p className="font-bold text-white text-sm">New {contactType === 'mobile' ? 'Message' : 'Email'}</p>
                                <button onClick={() => setShowMockSms(false)} className="text-slate-400 hover:text-white transition-colors">
                                    <span className="material-icons-round text-sm">close</span>
                                </button>
                            </div>
                            <p className="text-slate-300 text-xs mt-1 leading-relaxed pr-2">
                                Your Uni-Eats recovery code is <strong className="text-white text-sm tracking-widest">{generatedCode}</strong>.<br/>Do not share this with anyone.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full flex-1 flex flex-col justify-center max-w-sm space-y-8 animate-in fade-in duration-300">
                <button
                    onClick={() => {
                        if (step === 'choose' || step === 'success') navigate('/login');
                        else if (step === 'verify') setStep('choose');
                        else if (step === 'reset') setStep('verify');
                    }}
                    className="absolute top-12 left-6 w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-zinc-800 text-slate-500 hover:bg-slate-100 transition-colors"
                >
                    <span className="material-icons-round">arrow_back</span>
                </button>

                <div className="text-center space-y-4">
                    {step === 'success' ? (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-500 mb-4 animate-in zoom-in">
                            <span className="material-icons-round text-4xl">check_circle</span>
                        </div>
                    ) : (
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-500/20 text-amber-500 mb-4 animate-in zoom-in">
                            <span className="material-icons-round text-4xl">
                                {step === 'choose' ? 'lock_reset' : step === 'verify' ? 'domain_verification' : 'key'}
                            </span>
                        </div>
                    )}
                    
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                            {step === 'choose' && 'Forgot Password'}
                            {step === 'verify' && 'Verify Code'}
                            {step === 'reset' && 'Create New Password'}
                            {step === 'success' && 'Password Reset!'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed px-4">
                            {step === 'choose' && 'Where should we send your secure 6-digit recovery code?'}
                            {step === 'verify' && `We just sent a 6-digit code to your ${contactType}. Enter it below to proceed.`}
                            {step === 'reset' && 'Your code is verified! Please enter your new password.'}
                            {step === 'success' && 'You have successfully created a new password. You can now log in.'}
                        </p>
                    </div>
                </div>

                {/* STEP 1: CHOOSE MOBILE OR EMAIL */}
                {step === 'choose' && (
                    <form onSubmit={handleSendCode} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-2 gap-3 pb-2">
                            <button
                                type="button"
                                onClick={() => setContactType('email')}
                                className={`py-3 px-4 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${contactType === 'email' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-zinc-800 text-slate-500'}`}
                            >
                                <span className="material-icons-round text-sm">email</span> Email
                            </button>
                            <button
                                type="button"
                                onClick={() => setContactType('mobile')}
                                className={`py-3 px-4 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition-all ${contactType === 'mobile' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-zinc-800 text-slate-500'}`}
                            >
                                <span className="material-icons-round text-sm">smartphone</span> Mobile
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">
                                {contactType === 'email' ? 'University Email Address' : 'Mobile Phone Number'}
                            </label>
                            <input
                                type={contactType === 'email' ? 'email' : 'tel'}
                                value={contactValue}
                                onChange={(e) => setContactValue(e.target.value)}
                                placeholder={contactType === 'email' ? "student@nibm.lk" : "+94 77 123 4567"}
                                className="w-full px-4 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-80' : ''}`}
                        >
                            {loading ? <span className="material-icons-round animate-spin text-sm">sync</span> : null}
                            {loading ? 'Sending Code...' : 'Send Recovery Code'}
                        </button>
                    </form>
                )}

                {/* STEP 2: VERIFY CODE */}
                {step === 'verify' && (
                    <form onSubmit={handleVerifyCode} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1.5 pt-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 block text-center">
                                Enter 6-Digit Code
                            </label>
                            <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                placeholder="• • • • • •"
                                className="w-full tracking-[1em] text-center font-black text-2xl px-4 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otpCode.length < 6}
                            className={`w-full text-white font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading || otpCode.length < 6 ? 'bg-slate-300 dark:bg-zinc-700 cursor-not-allowed' : 'bg-primary shadow-primary/20 hover:bg-orange-600'}`}
                        >
                            {loading ? <span className="material-icons-round animate-spin text-sm">sync</span> : null}
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                )}

                {/* STEP 3: RESET PASSWORD */}
                {step === 'reset' && (
                    <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter at least 6 characters"
                                minLength={6}
                                className="w-full px-4 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                                required
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wide text-center">
                            Powered by Uni-Eats Auth Network
                        </p>
                        <button
                            type="submit"
                            disabled={loading || newPassword.length < 6}
                            className={`w-full text-white font-bold py-4 rounded-2xl shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${loading || newPassword.length < 6 ? 'bg-slate-300 dark:bg-zinc-700 cursor-not-allowed' : 'bg-primary shadow-primary/20 hover:bg-orange-600'}`}
                        >
                            {loading ? <span className="material-icons-round animate-spin text-sm">sync</span> : null}
                            {loading ? 'Saving securely...' : 'Confirm New Password'}
                        </button>
                    </form>
                )}

                {/* STEP 4: SUCCESS */}
                {step === 'success' && (
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
