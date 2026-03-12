
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { OrderItem } from '../types';

interface RateOrderProps {
  orderId: string;
  items: OrderItem[];
  userId: string;
  userName: string;
}

const StarRating: React.FC<{ rating: number; onRate: (r: number) => void; size?: string }> = ({ rating, onRate, size = 'text-3xl' }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
          className={`${size} transition-all duration-150 active:scale-90`}
          style={{ color: star <= (hovered || rating) ? '#F59E0B' : '#E2E8F0', lineHeight: 1 }}
        >
          ★
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
    setSubmitting(true);

    try {
      // 1. Recursive Cleaning Function (Handles objects and arrays)
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

      // 2. Prepare and Deep Clean the review
      const rawReview = {
        orderId: orderId || 'unknown',
        userId: userId || 'anonymous',
        userName: userName || 'Customer',
        ratings: ratings || {},
        comment: (comment || '').trim(),
        createdAt: serverTimestamp(),
        v: '1.5' // Version tracking
      };
      
      const cleanedReview = deepClean(rawReview);

      // 3. Save the main Review Document
      console.log('Submitting review:', cleanedReview);
      let reviewDocRef;
      try {
        reviewDocRef = await addDoc(collection(db, 'reviews'), cleanedReview);
      } catch (err: any) {
        throw new Error(`Review Creation Failed: ${err.message}`);
      }

      // 4. Update Menu Aggregations (Non-blocking if one fails, but we track errors)
      let aggregationErrors = 0;
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
          } catch (err) {
            console.warn(`Could not update menu item ${item.menuItemId}`, err);
            aggregationErrors++;
          }
        })
      );

      // 5. Finalize UI
      localStorage.removeItem('unieats_active_order_id');
      localStorage.removeItem('unieats_rating_order');
      setSubmitted(true);
      setTimeout(() => navigate('/menu'), 2200);

    } catch (err: any) {
      console.error('Rating Error:', err);
      // Detailed error reporting for the user
      const msg = err.message || 'Check your database rules or internet.';
      alert(`[V1.5 Error] ${msg}\n\nTip: Make sure you have "reviews" collection rules set to allow "create" in Firebase Console.`);
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
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-900 p-10 text-center">
        <div className="w-24 h-24 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-6 animate-bounce">
          <span className="text-5xl">🎉</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Thanks for rating!</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Your feedback helps us improve.</p>
        <p className="text-xs text-primary font-bold mt-6 animate-pulse">Returning to menu...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950 overflow-y-auto hide-scrollbar">
      {/* iOS Status Bar */}
      <div className="px-8 pt-10 pb-2 flex justify-between items-center w-full">
        <span className="text-sm font-semibold">9:41</span>
        <div className="flex items-center space-x-1.5">
          <span className="material-icons-round text-sm">signal_cellular_alt</span>
          <span className="material-icons-round text-sm">wifi</span>
          <span className="material-icons-round text-sm">battery_full</span>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 pt-4 pb-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-900 dark:to-zinc-900 -z-10" />
        <div className="text-5xl mb-3">⭐</div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Rate Your Meal</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          How was it? Your feedback helps us improve!
        </p>
      </div>

      {/* Rating Cards */}
      <div className="px-6 pb-4 space-y-4">
        {items.map((item) => {
          const r = ratings[item.menuItemId] ?? 0;
          return (
            <div
              key={item.menuItemId}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.name}</h3>
                  <p className="text-xs text-slate-400">×{item.quantity}</p>
                </div>
                {r > 0 && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                    {ratingLabels[r]}
                  </span>
                )}
              </div>
              <StarRating
                rating={r}
                onRate={(star) => setRatings(prev => ({ ...prev, [item.menuItemId]: star }))}
              />
            </div>
          );
        })}

        {/* Comment Box */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-zinc-800">
          <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
            💬 Tell us more (optional)
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Was the food fresh? Portions good? Any suggestions..."
            rows={3}
            className="w-full bg-slate-50 dark:bg-zinc-800 rounded-2xl p-4 text-sm text-slate-700 dark:text-white placeholder:text-slate-400 outline-none resize-none border border-transparent focus:border-primary/30 transition-all"
          />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 px-6 pb-10 pt-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-t border-slate-100 dark:border-zinc-800 space-y-3">
        {!allRated && (
          <p className="text-center text-xs text-slate-400 font-medium">
            Please rate all {items.length} item{items.length > 1 ? 's' : ''} to submit
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!allRated || submitting}
          className={`w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${allRated
            ? 'bg-primary text-white shadow-xl shadow-primary/20'
            : 'bg-slate-200 dark:bg-zinc-800 text-slate-400 cursor-not-allowed'
            }`}
        >
          {submitting ? (
            <><span className="material-icons-round animate-spin text-lg">sync</span> Submitting...</>
          ) : (
            <><span className="material-icons-round">star_rate</span> Submit Rating</>
          )}
        </button>
        <button
          onClick={handleSkip}
          className="w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default RateOrderPage;
