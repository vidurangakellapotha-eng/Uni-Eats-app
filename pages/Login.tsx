
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import StatusBar from '../components/layout/StatusBar';

interface LoginProps {
  onLogin: (role: UserRole, id: string, name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Domain Validation
      const emailLower = email.toLowerCase().trim();
      const isAdminEmail = emailLower === 'vidurangakellapotha@gmail.com'; // Allow owner bypass for testing if needed
      
      if (!emailLower.endsWith('@student.nibm.lk') && !isAdminEmail) {
        setError('Access Denied: Please use your official university email (@student.nibm.lk) to access Uni Eats.');
        setLoading(false);
        return;
      }

      if (isSignUp) {
        // Create new account
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        
        // Tag as student in Firestore 'users' collection
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          id: userCredential.user.uid,
          name: displayName,
          email: email,
          role: 'student',
          userType: 'Student',
          createdAt: serverTimestamp(),
          notificationSettings: {
            orderUpdates: true,
            promotions: true,
            cafeteriaNews: true,
            emailDigest: false,
          }
        });

        onLogin(UserRole.STUDENT, userCredential.user.uid, displayName);
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Security Check: Is this an admin trying to enter the student app?
        const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
        if (adminDoc.exists()) {
          await signOut(auth); // Kick them out
          setError('Access Denied: Admin accounts cannot log in to the Student App. Please use the Admin Dashboard.');
          setLoading(false);
          return;
        }

        const name = userCredential.user.displayName || userCredential.user.email || 'Student';
        onLogin(UserRole.STUDENT, userCredential.user.uid, name);
      }
    } catch (err: any) {
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password.');
          break;
        case 'auth/email-already-in-use':
          setError('This email is already registered. Try logging in.');
          break;
        case 'auth/weak-password':
          setError('Password must be at least 6 characters.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent">
      <StatusBar />

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 rounded-[2rem] bg-primary mx-auto mb-2 flex items-center justify-center shadow-2xl shadow-primary/40 overflow-hidden border-4 border-white dark:border-zinc-900 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <img src="/logo.png" alt="Uni Eats" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-none">
              Uni-Eats
            </h1>
            <p className="text-slate-400 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] mt-3">
              {isSignUp ? 'Create Student Account' : 'Student Portal Access'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">

            {/* Name field (sign up only) */}
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">person</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Viduranga Perera"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-id@student.nibm.lk"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <div className="relative">
                <span className="material-icons-round absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-zinc-800 border-none ring-1 ring-slate-200 dark:ring-zinc-700 focus:ring-2 focus:ring-primary rounded-2xl text-slate-900 dark:text-white transition-all outline-none"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="material-icons-round">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <span className="material-icons-round text-sm">error</span>
              {error}
            </div>
          )}

          {!isSignUp && (
            <div className="flex items-center justify-end px-1">
              <button type="button" onClick={() => navigate('/forgot-pin')} className="text-sm font-medium text-primary hover:text-primary/80">Forgot Password?</button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {loading
              ? <><span className="material-icons-round animate-spin text-lg">sync</span> Please wait...</>
              : <><span className="material-icons-round">login</span>{isSignUp ? 'Create Account' : 'Secure Login'}</>
            }
          </button>
        </form>

        {/* Toggle sign up / login */}
        <p className="text-sm text-center text-slate-500 dark:text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          {' '}
          <button
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="font-bold text-primary hover:text-primary/80"
          >
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>

        <p className="text-xs text-center text-slate-400 dark:text-slate-500 leading-relaxed px-4">
          By logging in, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a> as per campus regulations.
        </p>
      </div>

      <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="fixed bottom-0 left-0 -z-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
};

export default Login;