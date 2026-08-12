export default function RoomList({ 
  rooms, 
  currentRoom, 
  onSelectRoom, 
  onCreateRoomClick, 
  onOpenSearchRooms,
  onExitGroup,
  currentUser 
}) {
  // Display rooms where the current user is a member or default general
  const myRooms = rooms.filter(
    (room) => room.id === 'general' || room.members?.includes(currentUser?.uid)
  );

  return (
    <div className="sidebar-section">
      <div className="section-header">
        <h2>MY GROUPS</h2>
        <div className="section-header-actions">
          <button 
            className="btn-icon-add" 
            onClick={onOpenSearchRooms} 
            title="Search & Discover Groups"
            aria-label="Search & Discover Groups"
          >
            🔍
          </button>
          <button 
            className="btn-icon-add" 
            onClick={onCreateRoomClick} 
            title="Create Group"
            aria-label="Create Group"
          >
            +
          </button>
        </div>
      </div>

      <div className="rooms-list">
        {myRooms.length === 0 ? (
          <div className="empty-list-text">No groups joined yet</div>
        ) : (
          myRooms.map((room) => {
            const isActive = currentRoom?.id === room.id;
            const isGeneral = room.id === 'general';
            return (
              <div 
                key={room.id} 
                className={`room-item-row ${isActive ? 'active' : ''}`}
              >
                <button
                  className="room-item-btn"
                  onClick={() => onSelectRoom(room)}
                >
                  <span className="room-hashtag">#</span>
                  <span className="room-name">{room.name}</span>
                </button>

                {!isGeneral && onExitGroup && (
                  <button
                    className="btn-exit-room-sidebar"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExitGroup(room);
                    }}
                    title={`Exit #${room.name}`}
                    aria-label={`Exit #${room.name}`}
                  >
                    🚪
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-group-actions">
        <button className="btn-search-groups-sidebar" onClick={onOpenSearchRooms}>
          <span className="search-icon">🔍</span> Search Groups
        </button>
        <button className="btn-create-room-sidebar" onClick={onCreateRoomClick}>
          <span className="plus-icon">+</span> Create Group
        </button>
      </div>
    </div>
  );
}
