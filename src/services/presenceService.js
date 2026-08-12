import { 
  doc, 
  updateDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Sets user status to online and updates currentRoomId.
 */
export const setUserOnline = async (uid, roomId = 'general') => {
  if (!db || !uid) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isOnline: true,
    currentRoomId: roomId,
    lastSeen: serverTimestamp(),
  }).catch((err) => console.error('Error setting user online:', err));
};

/**
 * Sets user status to offline.
 */
export const setUserOffline = async (uid) => {
  if (!db || !uid) return;
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isOnline: false,
    lastSeen: serverTimestamp(),
  }).catch((err) => console.error('Error setting user offline:', err));
};

/**
 * Listens to all registered users presence status in real time.
 * @param {function} callback 
 * @returns {function} Unsubscribe function
 */
export const subscribeToAllUsersPresence = (callback) => {
  if (!db) return () => {};

  const usersCol = collection(db, 'users');

  return onSnapshot(
    usersCol,
    (snapshot) => {
      const users = snapshot.docs.map((docSnap) => ({
        uid: docSnap.id,
        ...docSnap.data(),
        username: docSnap.data().username || docSnap.data().nickname || 'User',
      }));

      // Sort: Online users first, then by username
      users.sort((a, b) => {
        if (a.isOnline === b.isOnline) {
          return (a.username || '').localeCompare(b.username || '');
        }
        return a.isOnline ? -1 : 1;
      });

      callback(users);
    },
    (error) => {
      console.error('Error listening to user presence:', error);
      callback([]);
    }
  );
};

/**
 * Updates user typing status in a given room.
 */
export const updateTypingStatus = async (roomId, uid, username, isTyping) => {
  if (!db || !roomId || !uid) return;
  const typingRef = doc(db, 'rooms', roomId, 'typing', uid);
  
  if (isTyping) {
    await setDoc(typingRef, {
      username,
      nickname: username,
      isTyping: true,
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch((err) => console.error('Error updating typing status:', err));
  } else {
    await setDoc(typingRef, {
      username,
      isTyping: false,
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch(() => {});
    await deleteDoc(typingRef).catch((err) => console.error('Error clearing typing status:', err));
  }
};

/**
 * Listens for active typing users in a specific room (excluding the current user).
 * @param {string} roomId 
 * @param {string} currentUid 
 * @param {function} callback 
 * @returns {function} Unsubscribe function
 */
export const subscribeToTyping = (roomId, currentUid, callback) => {
  if (!db || !roomId) return () => {};

  const typingCol = collection(db, 'rooms', roomId, 'typing');

  return onSnapshot(
    typingCol,
    (snapshot) => {
      const typingUsers = snapshot.docs
        .filter((docSnap) => docSnap.id !== currentUid)
        .map((docSnap) => docSnap.data())
        .filter((data) => data && data.isTyping === true && (data.username || data.nickname))
        .map((data) => data.username || data.nickname);

      callback(typingUsers);
    },
    (error) => {
      console.error('Error listening to typing status:', error);
      callback([]);
    }
  );
};
