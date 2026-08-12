import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, query, where, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

/**
 * Checks if a username is already taken.
 * @param {string} username 
 * @returns {Promise<boolean>}
 */
export const isUsernameTaken = async (username) => {
  if (!db) return false;
  const usernameLower = username.trim().toLowerCase();
  
  const q = query(
    collection(db, 'users'),
    where('usernameLower', '==', usernameLower)
  );

  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/**
 * Registers a new user with Email, Password, and Username.
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ uid: string, username: string, email: string }>}
 */
export const registerUser = async (username, email, password) => {
  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();

  if (!trimmedUsername) throw new Error('Username is required.');
  if (trimmedUsername.length < 3) throw new Error('Username must be at least 3 characters.');
  if (!trimmedEmail) throw new Error('Email is required.');
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters.');

  // Check username availability case-insensitively
  const taken = await isUsernameTaken(trimmedUsername);
  if (taken) {
    throw new Error(`The username "${trimmedUsername}" is already taken. Please choose another.`);
  }

  // Create account with Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
  const user = userCredential.user;

  const userData = {
    uid: user.uid,
    username: trimmedUsername,
    usernameLower: trimmedUsername.toLowerCase(),
    email: trimmedEmail,
    isOnline: true,
    lastSeen: serverTimestamp(),
    currentRoomId: 'general',
    createdAt: serverTimestamp(),
  };

  // Save user profile in Firestore
  await setDoc(doc(db, 'users', user.uid), userData);

  return {
    uid: user.uid,
    username: trimmedUsername,
    email: trimmedEmail,
  };
};

/**
 * Logs in an existing user with Email and Password.
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{ uid: string, username: string, email: string }>}
 */
export const loginUser = async (email, password) => {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) throw new Error('Email is required.');
  if (!password) throw new Error('Password is required.');

  const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
  const user = userCredential.user;

  // Fetch profile from Firestore
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  let username = user.displayName || trimmedEmail.split('@')[0];

  if (userDoc.exists()) {
    username = userDoc.data().username || username;
    // Update online presence
    await updateDoc(doc(db, 'users', user.uid), {
      isOnline: true,
      lastSeen: serverTimestamp(),
    }).catch(() => {});
  } else {
    // Create profile if missing
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      username,
      usernameLower: username.toLowerCase(),
      email: trimmedEmail,
      isOnline: true,
      lastSeen: serverTimestamp(),
      currentRoomId: 'general',
      createdAt: serverTimestamp(),
    });
  }

  return {
    uid: user.uid,
    username,
    email: trimmedEmail,
  };
};

/**
 * Logs out the current user and sets their presence to offline.
 * @param {string} uid 
 */
export const logoutUser = async (uid) => {
  if (uid && db) {
    await updateDoc(doc(db, 'users', uid), {
      isOnline: false,
      lastSeen: serverTimestamp(),
    }).catch(() => {});
  }
  await signOut(auth);
};

/**
 * Subscribes to Firebase Auth state changes for persistent sessions.
 * @param {function} callback 
 * @returns {function} Unsubscribe function
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Fetch Firestore profile data
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          // Update online status
          await updateDoc(doc(db, 'users', user.uid), {
            isOnline: true,
            lastSeen: serverTimestamp(),
          }).catch(() => {});

          callback({
            uid: user.uid,
            username: data.username || user.email.split('@')[0],
            email: user.email,
          });
          return;
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
      callback({
        uid: user.uid,
        username: user.email ? user.email.split('@')[0] : 'User',
        email: user.email,
      });
    } else {
      callback(null);
    }
  });
};
