export default function ChatHeader({ 
  currentRoom, 
  onToggleMobileSidebar, 
  onlineCount,
  onExitGroup,
  onOpenGroupInfo,
  currentUser 
}) {
  const isGeneral = currentRoom?.id === 'general';
  const memberCount = currentRoom?.members?.length || onlineCount;
  const hostName = currentRoom?.createdBy || 'System';

  return (
    <header className="chat-header">
      <div className="header-left">
        <button
          className="mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation sidebar"
        >
          ☰
        </button>
        <div className="room-title-info">
          <h1>
            <span className="hashtag">#</span> {currentRoom?.name || 'General'}
          </h1>
          <div className="room-subtitle-row" onClick={onOpenGroupInfo} title="Click to view group members & host">
            <span className="room-subtitle">
              {memberCount} {memberCount === 1 ? 'member' : 'members'} • Host: <strong className="host-text">{hostName}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="header-right">
        <button 
          className="btn-group-info" 
          onClick={onOpenGroupInfo}
          title="View Group Info & Members"
        >
          ℹ️ Group Info
        </button>

        {!isGeneral && (
          <button 
            className="btn-exit-group" 
            onClick={() => onExitGroup(currentRoom)}
            title="Exit Group"
          >
            🏃 Exit Group
          </button>
        )}

        <div className="connection-pill connected">
          <span className="status-dot online">●</span>
          <span className="connection-text">Connected</span>
        </div>
      </div>
    </header>
  );
}
