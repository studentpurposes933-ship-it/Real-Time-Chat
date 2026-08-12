import { useState, useEffect } from 'react';
import { joinGroupRoom } from '../services/roomService';

export default function SearchRoomsModal({ isOpen, onClose, rooms, currentUser, onSelectRoom }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredRooms = rooms.filter((r) =>
    (r.name || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const handleJoin = async (room) => {
    setIsLoading(true);
    try {
      await joinGroupRoom(room.id, currentUser);
      onSelectRoom(room);
      onClose();
    } catch (err) {
      console.error('Error joining group:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content search-rooms-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Discover & Search Groups</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Search group name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-results-list">
          {filteredRooms.length === 0 ? (
            <div className="empty-search-text">No groups found matching "{searchQuery}"</div>
          ) : (
            filteredRooms.map((room) => {
              const isJoined = room.members?.includes(currentUser?.uid);
              return (
                <div key={room.id} className="search-room-item">
                  <div className="search-room-info">
                    <span className="search-room-hashtag">#</span>
                    <span className="search-room-name">{room.name}</span>
                    <span className="search-room-members-count">
                      ({room.members?.length || 0} {room.members?.length === 1 ? 'member' : 'members'})
                    </span>
                  </div>

                  {isJoined ? (
                    <button
                      className="btn-joined-badge"
                      onClick={() => {
                        onSelectRoom(room);
                        onClose();
                      }}
                    >
                      ✓ Joined
                    </button>
                  ) : (
                    <button
                      className="btn-join-group"
                      onClick={() => handleJoin(room)}
                      disabled={isLoading}
                    >
                      + Join Group
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
