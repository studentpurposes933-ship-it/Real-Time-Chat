import { formatMessageTime } from '../services/messageService';

export default function OnlineUsers({ users, currentUser }) {
  const onlineCount = users.filter((u) => u.isOnline).length;

  return (
    <div className="sidebar-section">
      <div className="section-header">
        <h2>USERS</h2>
        <span className="online-count-badge" title="Online users">{onlineCount} Online</span>
      </div>

      <div className="users-list">
        {users.length === 0 ? (
          <div className="empty-list-text">No registered users found</div>
        ) : (
          users.map((user) => {
            const isMe = user.uid === currentUser?.uid;
            const displayName = user.username || user.nickname || 'User';
            const isOnline = user.isOnline;
            const lastSeenTime = !isOnline && user.lastSeen ? formatMessageTime(user.lastSeen) : null;

            return (
              <div key={user.uid} className={`user-item ${isMe ? 'user-item-self' : ''} ${!isOnline ? 'user-offline' : ''}`}>
                <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? '🟢' : '⚪'}
                </span>
                <div className="user-name-col">
                  <div className="user-name-row">
                    <span className="user-name">{displayName}</span>
                    {isMe && <span className="you-pill">You</span>}
                  </div>
                  <div className="user-status-detail">
                    {isOnline ? (
                      <span className="text-online-status">Online</span>
                    ) : (
                      <span className="text-offline-status">
                        Offline {lastSeenTime ? `• Last seen ${lastSeenTime}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
