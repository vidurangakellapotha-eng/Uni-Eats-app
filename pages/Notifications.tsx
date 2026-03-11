
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy, updateDoc, doc, writeBatch } from 'firebase/firestore';

interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  icon?: string;
  orderId?: string;
  read: boolean;
  createdAt: { seconds: number } | null;
}

const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
  order:     { bg: 'bg-amber-50 dark:bg-amber-900/20',   text: 'text-amber-700 dark:text-amber-400',  border: 'border-amber-200 dark:border-amber-800' },
  ready:     { bg: 'bg-green-50 dark:bg-green-900/20',   text: 'text-green-700 dark:text-green-400',  border: 'border-green-200 dark:border-green-800' },
  completed: { bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800' },
  alert:     { bg: 'bg-red-50 dark:bg-red-900/20',       text: 'text-red-700 dark:text-red-400',      border: 'border-red-200 dark:border-red-800' },
};

const iconForType: Record<string, string> = {
  order:     'receipt_long',
  ready:     'shopping_bag',
  completed: 'check_circle',
  alert:     'cancel',
};

function timeAgo(seconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - seconds;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('unieats_user_id');

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    // Query notifications for this user (client-side sort to avoid composite index)
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data: AppNotification[] = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as AppNotification))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setNotifications(data);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [userId]);

  const markAllRead = async () => {
    if (!userId) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit().catch(() => {});
  };

  const markRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true }).catch(() => {});
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* iOS Status Bar */}
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
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-primary font-bold">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="ml-auto text-primary text-xs font-bold uppercase tracking-widest"
          >
            Mark all read
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-3 pb-20">
        {loading ? (
          <div className="flex justify-center py-12">
            <span className="material-icons-round text-4xl text-primary animate-spin opacity-40">sync</span>
          </div>
        ) : !userId ? (
          <div className="text-center py-16">
            <span className="material-icons-round text-5xl text-slate-200 dark:text-zinc-700">notifications_off</span>
            <p className="text-slate-400 text-sm mt-3">Please log in to see notifications</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons-round text-5xl text-slate-200 dark:text-zinc-700">notifications_none</span>
            <p className="font-bold text-slate-400 mt-3">No notifications yet</p>
            <p className="text-xs text-slate-300 dark:text-zinc-600 mt-1">Order updates will appear here</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const style = typeStyles[notif.type] ?? typeStyles.order;
            const icon = notif.icon || iconForType[notif.type] || 'notifications';
            return (
              <button
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`w-full text-left p-4 rounded-[20px] border transition-all active:scale-[0.98] ${
                  notif.read
                    ? 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800'
                    : `${style.bg} ${style.border} border`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.read ? 'bg-slate-100 dark:bg-zinc-800' : style.bg}`}>
                    <span className={`material-icons-round text-lg ${notif.read ? 'text-slate-400' : style.text}`}>
                      {icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className={`font-bold text-sm leading-tight ${notif.read ? 'text-slate-700 dark:text-slate-200' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {notif.createdAt ? timeAgo(notif.createdAt.seconds) : ''}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </main>
    </div>
  );
};

export default Notifications;
