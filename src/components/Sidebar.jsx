import RoomList from './RoomList';
import OnlineUsers from './OnlineUsers';

export default function Sidebar({
  rooms,
  currentRoom,
  onSelectRoom,
  allUsers,
  currentUser,
  onCreateRoomClick,
  onOpenSearchRooms,
  onExitGroup,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}) {
  const userDisplayName = currentUser?.username || currentUser?.nickname || 'User';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div className="sidebar-backdrop" onClick={onCloseMobile} />
      )}

      <aside className={`app-sidebar ${isOpenMobile ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-logo">
            <span className="brand-icon">💬</span>
            <span className="brand-title">Real-Time Chat</span>
          </div>
          <button 
            className="mobile-close-btn" 
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="user-profile-badge">
          <div className="avatar-circle">
            {userInitial}
          </div>
          <div className="user-info">
            <span className="user-nickname">{userDisplayName}</span>
            {currentUser?.email && (
              <span className="user-email">{currentUser.email}</span>
            )}
            <div className="user-status-row">
              <span className="status-dot online">🟢</span>
              <span className="status-text">Online</span>
            </div>
          </div>
          <button 
            className="btn-logout" 
            onClick={onLogout} 
            title="Log out of account"
            aria-label="Log out of account"
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </button>
        </div>

        <div className="sidebar-content">
          <RoomList
            rooms={rooms}
            currentRoom={currentRoom}
            onSelectRoom={(room) => {
              onSelectRoom(room);
              onCloseMobile();
            }}
            onCreateRoomClick={onCreateRoomClick}
            onOpenSearchRooms={onOpenSearchRooms}
            onExitGroup={onExitGroup}
            currentUser={currentUser}
          />

          <OnlineUsers users={allUsers} currentUser={currentUser} />
        </div>
      </aside>
    </>
  );
}
