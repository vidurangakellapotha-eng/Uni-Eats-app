
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export function useNotifications(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);
  const [latestNotification, setLatestNotification] = useState<any>(null);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      setHasUnreadChat(false);
      return;
    }

    // 1. Regular notifications
    const qNotifs = query(
      collection(db, 'notifications'),
      where('userId', 'in', [userId, 'all'])
    );

    const unsubNotifs = onSnapshot(qNotifs, (snap) => {
      if (snap.empty) {
        setUnreadCount(0);
      } else {
        const docs = [...snap.docs].sort((a, b) => (b.data().createdAt?.toMillis() || 0) - (a.data().createdAt?.toMillis() || 0));
        setUnreadCount(docs.filter(d => d.data().read === false).length);

        const newestDoc = docs[0];
        const data = newestDoc.data();
        const isFresh = data.createdAt && (Date.now() - data.createdAt.toMillis() < 5000);

        if (data.read === false && isFresh) {
          setLatestNotification({ id: newestDoc.id, ...data });
        }
      }
    });

    // 2. Unread Support Messages
    const qChat = query(
      collection(db, 'supportMessages'),
      where('chatId', '==', userId),
      where('isAdmin', '==', true),
      where('read', '==', false)
    );

    const unsubChat = onSnapshot(qChat, (snap) => {
      setHasUnreadChat(!snap.empty);
    });

    return () => {
      unsubNotifs();
      unsubChat();
    };
  }, [userId]);

  return { unreadCount, hasUnreadChat, latestNotification };
}
