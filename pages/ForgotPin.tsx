
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPin: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [studentId, setStudentId] = useState('');
    const [email, setEmail] = useState('');

    const handleSendReset = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(2);
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

            <div className="w-full flex-1 flex flex-col justify-center max-w-sm space-y-8">
                <button
                    onClick={() => navigate('/login')}
                    className="absolute top-12 left-6 w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-zinc-800 text-slate-500"
                >
                    <span className="material-icons-round">arrow_back</span>
                </button>

                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-500/20 text-amber-500 mb-4">
                        <span className="material-icons-round text-4xl">lock_reset</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Forgot PIN?</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                            {step === 1
                                ? "Enter your student ID and university email to reset your access PIN."
                                : "We've sent a temporary reset link to your student email. Please check your inbox."}
                        </p>
                    </div>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendReset} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Student ID</label>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    placeholder="STU..."
                                    className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">University Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@student.nibm.lk"
                                    className="w-full pl-4 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all"
                        >
                            Reset PIN
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-2xl flex items-start gap-3">
                            <span className="material-icons-round mt-0.5">check_circle</span>
                            <div className="text-sm">
                                <p className="font-bold">Email Sent</p>
                                <p className="opacity-80">Check {email}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all"
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
