import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './firebase';

/**
 * Safely formats a Firestore timestamp, JS Date, or pending serverTimestamp into local 12-hour time (e.g. 7:25 PM).
 * @param {object|Date|number|null} timestamp 
 * @returns {string} Formatted time string
 */
export const formatMessageTime = (timestamp) => {
  if (!timestamp) {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  let dateObj;
  if (typeof timestamp.toDate === 'function') {
    dateObj = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    dateObj = timestamp;
  } else if (typeof timestamp === 'number') {
    dateObj = new Date(timestamp);
  } else {
    dateObj = new Date();
  }

  return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Sends a user message to a room.
 * Enforces senderId matching auth.currentUser.uid.
 * @param {string} roomId 
 * @param {string} senderName 
 * @param {string} text 
 */
export const sendMessage = async (roomId, senderName, text) => {
  if (!db || !auth.currentUser) {
    throw new Error('User must be authenticated to send messages.');
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Message text cannot be empty.');
  }

  const senderId = auth.currentUser.uid;
  const messagesCol = collection(db, 'rooms', roomId, 'messages');

  await addDoc(messagesCol, {
    senderId,
    senderName,
    message: trimmedText,
    type: 'text',
    timestamp: serverTimestamp(),
    status: 'Sent',
  });
};

/**
 * Posts a system message (e.g., user joined/left group) to a room.
 * @param {string} roomId 
 * @param {string} text 
 */
export const sendSystemMessage = async (roomId, text) => {
  if (!db || !roomId) return;
  const messagesCol = collection(db, 'rooms', roomId, 'messages');

  await addDoc(messagesCol, {
    senderId: 'system',
    senderName: 'System',
    message: text,
    type: 'system',
    timestamp: serverTimestamp(),
    status: 'Sent',
  }).catch((err) => console.error('Error sending system message:', err));
};

/**
 * Listens to messages for a specific room in real time.
 * @param {string} roomId 
 * @param {function} callback 
 * @returns {function} Unsubscribe function
 */
export const subscribeToMessages = (roomId, callback) => {
  if (!db || !roomId) return () => {};

  const messagesCol = collection(db, 'rooms', roomId, 'messages');
  const q = query(messagesCol, orderBy('timestamp', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      callback(messages);
    },
    (error) => {
      console.error(`Error subscribing to messages in room ${roomId}:`, error);
      callback([]);
    }
  );
};
