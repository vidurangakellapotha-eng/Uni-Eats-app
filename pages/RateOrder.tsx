
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { OrderItem } from '../types';

interface RateOrderProps {
  orderId: string;
  items: OrderItem[];
  userId: string;
  userName: string;
}

const StarRating: React.FC<{ rating: number; onRate: (r: number) => void; size?: string }> = ({ rating, onRate, size = 'w-8 h-8' }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
          className={`transition-all duration-300 active:scale-75 ${star <= (hovered || rating) ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-slate-200 dark:text-zinc-700'}`}
        >
          <Star className={size} fill={star <= (hovered || rating) ? 'currentColor' : 'none'} strokeWidth={star <= (hovered || rating) ? 0 : 2} />
        </button>
      ))}
    </div>
  );
};

const ratingLabels: Record<number, string> = {
  1: 'Poor 😞',
  2: 'Fair 😐',
  3: 'Good 😊',
  4: 'Great 😄',
  5: 'Excellent! 🤩',
};

const RateOrderPage: React.FC<RateOrderProps> = ({ orderId, items, userId, userName }) => {
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const allRated = items.length > 0 && items.every(item => ratings[item.menuItemId] > 0);

  const handleSubmit = async () => {
    if (!allRated) return;
    
    // 1. Explicit Session Check
    const user = auth.currentUser;
    if (!user) {
      alert("Session Expired: Please log out and log in again to submit a rating. (Firestore requires an active login)");
      setSubmitting(false);
      return;
    }

    setSubmitting(true);

    try {
      // 2. Recursive Cleaning Function
      const deepClean = (obj: any): any => {
        if (Array.isArray(obj)) return obj.map(deepClean).filter(v => v !== undefined);
        if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
          return Object.fromEntries(
            Object.entries(obj)
              .map(([k, v]) => [k, deepClean(v)])
              .filter(([_, v]) => v !== undefined)
          );
        }
        return obj;
      };

      // 3. Prepare Review (v1.6)
      const rawReview = {
        orderId: orderId || 'unknown',
        userId: user.uid, // Use physical auth ID
        userName: userName || user.displayName || 'Customer',
        ratings: ratings || {},
        comment: (comment || '').trim(),
        createdAt: serverTimestamp(),
        v: '1.6' 
      };
      
      const cleanedReview = deepClean(rawReview);

      // 4. Submit main Review
      console.log('Final Submission Check:', { authId: user.uid, data: cleanedReview });
      let reviewDocRef;
      try {
        reviewDocRef = await addDoc(collection(db, 'reviews'), cleanedReview);
      } catch (err: any) {
        throw new Error(`Permission Denied for 'reviews'. Check Firebase Rules. (${err.message})`);
      }

      // 5. Update Menu Aggregations
      await Promise.all(
        (items || []).map(async (item) => {
          const newRating = ratings[item.menuItemId];
          if (!newRating) return;
          try {
            const menuRef = doc(db, 'menu', item.menuItemId);
            const snap = await getDoc(menuRef);
            if (snap.exists()) {
              const data = snap.data();
              const oldRating: number = data.rating ?? 4.0;
              const oldCount: number = data.reviewCount ?? 0;
              const newCount = oldCount + 1;
              const newAvg = parseFloat(((oldRating * oldCount + newRating) / newCount).toFixed(1));
              await updateDoc(menuRef, { rating: newAvg, reviewCount: newCount });
            }
          } catch (err: any) {
             console.warn(`Menu update failed: ${err.message}`);
             // Note: Review still succeeds if menu update fails
          }
        })
      );

      localStorage.removeItem('unieats_active_order_id');
      localStorage.removeItem('unieats_rating_order');
      setSubmitted(true);
      setTimeout(() => navigate('/menu'), 2200);

    } catch (err: any) {
      console.error('Rating Failed:', err);
      alert(`[V1.6 Error] ${err.message}\n\nPlease ensure your Firebase Rules allow "write" to the "reviews" collection.`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('unieats_active_order_id');
    localStorage.removeItem('unieats_rating_order');
    navigate('/menu');
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent blur-3xl rounded-full" />
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6 animate-bounce shadow-[0_0_40px_rgba(16,185,129,0.2)]">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Thank you!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[200px]">Your feedback directly helps us improve the Uni-Eats experience.</p>
        <p className="text-[10px] uppercase tracking-widest text-primary font-black mt-10 animate-pulse">Returning to Menu...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 overflow-y-auto hide-scrollbar relative">
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[40vh] bg-gradient-to-br from-orange-400/20 via-amber-200/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Header */}
      <div className="px-6 pt-16 pb-10 text-center relative z-10">
        <div className="inline-flex bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-4 rounded-3xl shadow-lg shadow-orange-500/10 mb-6 border border-white/40 dark:border-white/5">
          <Star className="w-10 h-10 text-amber-500 fill-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Rate Your Experience</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 px-4 leading-relaxed">
          How was the food? Tap the stars below to let the kitchen know!
        </p>
      </div>

      {/* Rating Cards */}
      <div className="px-6 pb-6 space-y-4 relative z-10">
        {items.map((item) => {
          const r = ratings[item.menuItemId] ?? 0;
          return (
            <div
              key={item.menuItemId}
              className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/50 dark:border-white/5 transition-all duration-300 hover:shadow-md hover:bg-white dark:hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight mb-1">{item.name}</h3>
                  <div className="w-10 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full" />
                </div>
                {r > 0 && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-100 dark:border-amber-900/50">
                    {ratingLabels[r]}
                  </span>
                )}
              </div>
              <div className="flex justify-center bg-slate-50/50 dark:bg-zinc-950/50 py-4 rounded-2xl border border-slate-100/50 dark:border-zinc-800/50">
                   <StarRating
                     rating={r}
                     onRate={(star) => setRatings(prev => ({ ...prev, [item.menuItemId]: star }))}
                   />
              </div>
            </div>
          );
        })}

        {/* Comment Box */}
        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl rounded-[2rem] p-6 shadow-sm border border-white/50 dark:border-white/5 mt-6">
          <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-4 h-4 text-primary" />
              <label className="block text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Additional Comments
              </label>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Was it fresh? Portions good? (Optional)"
            rows={3}
            className="w-full bg-slate-50 dark:bg-zinc-950 rounded-2xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none resize-none border border-slate-100 dark:border-zinc-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 px-6 pt-6 pb-12 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-slate-50/95 dark:via-zinc-950/95 to-transparent z-20 space-y-4">
        {!allRated && (
          <div className="flex justify-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/50 dark:bg-zinc-800/50 px-4 py-1.5 rounded-full backdrop-blur-md">
                Please rate all {items.length} item{items.length > 1 ? 's' : ''}
              </span>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!allRated || submitting}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 active:scale-[0.98] ${allRated
            ? 'bg-primary text-white shadow-xl shadow-primary/30 hover:bg-orange-600'
            : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed opacity-70'
            }`}
        >
          {submitting ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
          ) : (
            <>Submit Review</>
          )}
        </button>
        <button
          onClick={handleSkip}
          className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          Skip This Step
        </button>
      </div>
    </div>
  );
};

export default RateOrderPage;
