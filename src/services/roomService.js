import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';
import { sendSystemMessage } from './messageService';

const DEFAULT_ROOMS = [
  { id: 'general', name: 'General' },
  { id: 'tech', name: 'Tech' },
  { id: 'random', name: 'Random' },
];

/**
 * Ensures default rooms exist in Firestore and adds the current user to General.
 * @param {object} currentUser 
 */
export const ensureDefaultRooms = async (currentUser) => {
  if (!db) return;

  try {
    for (const room of DEFAULT_ROOMS) {
      const roomRef = doc(db, 'rooms', room.id);
      const roomSnap = await getDoc(roomRef);

      const isGeneral = room.id === 'general';

      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          name: room.name,
          nameLower: room.name.toLowerCase(),
          createdBy: 'System',
          creatorUid: 'system',
          members: isGeneral && currentUser?.uid ? [currentUser.uid] : [],
          createdAt: serverTimestamp(),
        });
      } else if (isGeneral) {
        // ONLY auto-add user to General group
        const data = roomSnap.data();
        const members = data.members || [];
        if (currentUser?.uid && !members.includes(currentUser.uid)) {
          await updateDoc(roomRef, {
            members: arrayUnion(currentUser.uid),
          });
          const displayName = currentUser.username || currentUser.nickname || 'User';
          await sendSystemMessage(room.id, `🟢 ${displayName} joined the group`);
        }
      }
    }
  } catch (error) {
    console.error('Error seeding default rooms:', error);
  }
};

/**
 * Listens to all public rooms in real time.
 * @param {function} callback 
 * @returns {function} Unsubscribe function
 */
export const subscribeToRooms = (callback) => {
  if (!db) return () => {};

  const roomsCol = collection(db, 'rooms');

  return onSnapshot(
    roomsCol,
    (snapshot) => {
      const rooms = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        members: docSnap.data().members || [],
      }));
      
      rooms.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      callback(rooms);
    },
    (error) => {
      console.error('Error listening to rooms:', error);
      callback([]);
    }
  );
};

/**
 * Creates a new public room with creator added as first member and host.
 * @param {string} roomName 
 * @param {string} createdBy 
 * @param {string} creatorUid 
 * @returns {Promise<{ id: string, name: string }>}
 */
export const createRoom = async (roomName, createdBy, creatorUid) => {
  if (!db) throw new Error('Database not initialized');
  
  const trimmedName = roomName.trim();
  if (!trimmedName) {
    throw new Error('Room name cannot be empty.');
  }

  if (trimmedName.length > 30) {
    throw new Error('Room name must be 30 characters or less.');
  }

  const nameLower = trimmedName.toLowerCase();

  const q = query(
    collection(db, 'rooms'),
    where('nameLower', '==', nameLower)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    throw new Error(`A room named "# ${trimmedName}" already exists.`);
  }

  const customId = nameLower.replace(/[^a-z0-9_-]/g, '_');
  const roomRef = doc(db, 'rooms', customId);

  await setDoc(roomRef, {
    name: trimmedName,
    nameLower,
    createdBy: createdBy || 'Anonymous',
    creatorUid: creatorUid || null,
    members: creatorUid ? [creatorUid] : [],
    createdAt: serverTimestamp(),
  });

  // Post system notice
  await sendSystemMessage(customId, `🟢 ${createdBy} created group "# ${trimmedName}"`);

  return {
    id: customId,
    name: trimmedName,
  };
};

/**
 * Adds a user to a group's members list and broadcasts a system join message.
 * @param {string} roomId 
 * @param {object} user 
 */
export const joinGroupRoom = async (roomId, user) => {
  if (!db || !roomId || !user?.uid) return;

  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    members: arrayUnion(user.uid),
  });

  const displayName = user.username || user.nickname || 'User';
  await sendSystemMessage(roomId, `🟢 ${displayName} joined the group`);
};

/**
 * Removes a user from a group's members list and broadcasts a system leave message.
 * @param {string} roomId 
 * @param {object} user 
 */
export const leaveGroupRoom = async (roomId, user) => {
  if (!db || !roomId || !user?.uid) return;

  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    members: arrayRemove(user.uid),
  });

  const displayName = user.username || user.nickname || 'User';
  await sendSystemMessage(roomId, `🔴 ${displayName} left the group`);
};

/**
 * Allows group host/creator to remove a member from the group.
 * @param {string} roomId 
 * @param {string} targetUid 
 * @param {string} targetUsername 
 * @param {object} hostUser 
 */
export const removeMemberFromRoom = async (roomId, targetUid, targetUsername, hostUser) => {
  if (!db || !roomId || !targetUid) return;

  const roomRef = doc(db, 'rooms', roomId);
  await updateDoc(roomRef, {
    members: arrayRemove(targetUid),
  });

  const hostName = hostUser.username || hostUser.nickname || 'Host';
  await sendSystemMessage(roomId, `🔴 ${hostName} removed ${targetUsername} from the group`);
};
