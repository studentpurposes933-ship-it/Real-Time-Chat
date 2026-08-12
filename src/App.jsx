import { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import CreateRoomModal from './components/CreateRoomModal';
import SearchRoomsModal from './components/SearchRoomsModal';
import GroupInfoModal from './components/GroupInfoModal';
import { checkFirebaseConfig } from './services/firebase';
import { ensureDefaultRooms, subscribeToRooms, leaveGroupRoom } from './services/roomService';
import { 
  setUserOnline, 
  setUserOffline, 
  subscribeToAllUsersPresence, 
  subscribeToTyping 
} from './services/presenceService';
import { subscribeToMessages } from './services/messageService';
import { subscribeToAuthChanges, logoutUser } from './services/authService';

export default function App() {
  const [configError] = useState(() => checkFirebaseConfig());
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => configError.isValid);

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState({ id: 'general', name: 'General' });
  const [allUsers, setAllUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isSearchRoomsOpen, setIsSearchRoomsOpen] = useState(false);
  const [isGroupInfoOpen, setIsGroupInfoOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Persistent Auth Session Subscription
  useEffect(() => {
    if (!configError.isValid) return;

    const unsubscribeAuth = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, [configError.isValid]);

  // Initialize default rooms and setup presence listeners
  useEffect(() => {
    if (!configError.isValid || !currentUser) return;

    // Seed default rooms and add user to General
    ensureDefaultRooms(currentUser);

    // Subscribe to rooms list
    const unsubscribeRooms = subscribeToRooms((updatedRooms) => {
      setRooms(updatedRooms);
      if (updatedRooms.length > 0) {
        setCurrentRoom((prev) => {
          const match = updatedRooms.find((r) => r.id === prev.id);
          // If active room no longer exists or user was removed, fallback to General
          if (match && match.id !== 'general' && !match.members?.includes(currentUser.uid)) {
            return updatedRooms.find((r) => r.id === 'general') || updatedRooms[0];
          }
          return match || updatedRooms[0];
        });
      }
    });

    // Subscribe to all users presence
    const unsubscribeUsersPresence = subscribeToAllUsersPresence((users) => {
      setAllUsers(users);
    });

    return () => {
      unsubscribeRooms();
      unsubscribeUsersPresence();
    };
  }, [configError.isValid, currentUser]);

  // Handle presence online / offline lifecycle
  useEffect(() => {
    if (!currentUser?.uid || !currentRoom?.id) return;

    setUserOnline(currentUser.uid, currentRoom.id);

    const handleBeforeUnload = () => {
      setUserOffline(currentUser.uid);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser?.uid, currentRoom?.id]);

  // Subscribe to messages & typing indicators for active currentRoom
  useEffect(() => {
    if (!configError.isValid || !currentUser || !currentRoom?.id) return;

    const unsubscribeMsgs = subscribeToMessages(currentRoom.id, (newMessages) => {
      setMessages(newMessages);
    });

    const unsubscribeTyping = subscribeToTyping(currentRoom.id, currentUser.uid, (typers) => {
      setTypingUsers(typers);
    });

    return () => {
      unsubscribeMsgs();
      unsubscribeTyping();
    };
  }, [configError.isValid, currentUser, currentRoom?.id]);

  // Handle Logout
  const handleLogout = async () => {
    if (currentUser?.uid) {
      await logoutUser(currentUser.uid);
      setCurrentUser(null);
    }
  };

  // Handle Exit Group
  const handleExitGroup = async (room) => {
    if (!room || room.id === 'general' || !currentUser?.uid) return;
    try {
      await leaveGroupRoom(room.id, currentUser);
      const generalRoom = rooms.find((r) => r.id === 'general') || { id: 'general', name: 'General' };
      setCurrentRoom(generalRoom);
    } catch (err) {
      console.error('Error exiting group:', err);
    }
  };

  // Handle room selection
  const handleSelectRoom = (room) => {
    setCurrentRoom(room);
    if (currentUser?.uid) {
      setUserOnline(currentUser.uid, room.id);
    }
  };

  // Loading state while checking auth session persistence
  if (authLoading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="logo-badge">💬</div>
          <h2>Loading Session...</h2>
        </div>
      </div>
    );
  }

  // Display Login / Register screen if user is not authenticated
  if (!currentUser) {
    return (
      <Login
        onLoginSuccess={(user) => setCurrentUser(user)}
        configError={configError}
      />
    );
  }

  return (
    <div className="chat-app-root">
      <Sidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onSelectRoom={handleSelectRoom}
        allUsers={allUsers}
        currentUser={currentUser}
        onCreateRoomClick={() => setIsCreateRoomOpen(true)}
        onOpenSearchRooms={() => setIsSearchRoomsOpen(true)}
        onExitGroup={handleExitGroup}
        onLogout={handleLogout}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <main className="chat-main-content">
        <ChatHeader
          currentRoom={currentRoom}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onlineCount={allUsers.filter((u) => u.isOnline).length}
          onExitGroup={handleExitGroup}
          onOpenGroupInfo={() => setIsGroupInfoOpen(true)}
          currentUser={currentUser}
        />

        <MessageList
          messages={messages}
          currentUser={currentUser}
          typingUsers={typingUsers}
          currentRoom={currentRoom}
        />

        <MessageInput
          currentRoom={currentRoom}
          currentUser={currentUser}
        />
      </main>

      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onRoomCreated={(newRoom) => handleSelectRoom(newRoom)}
        currentUser={currentUser}
      />

      <SearchRoomsModal
        isOpen={isSearchRoomsOpen}
        onClose={() => setIsSearchRoomsOpen(false)}
        rooms={rooms}
        currentUser={currentUser}
        onSelectRoom={handleSelectRoom}
      />

      <GroupInfoModal
        isOpen={isGroupInfoOpen}
        onClose={() => setIsGroupInfoOpen(false)}
        room={currentRoom}
        allUsers={allUsers}
        currentUser={currentUser}
      />
    </div>
  );
}
