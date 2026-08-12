import { useState, useEffect } from 'react';
import { createRoom } from '../services/roomService';

export default function CreateRoomModal({ isOpen, onClose, onRoomCreated, currentUser }) {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Close modal on Escape key press
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = roomName.trim();
    if (!trimmed) {
      setError('Room name is required.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const newRoom = await createRoom(trimmed, currentUser?.nickname);
      setRoomName('');
      onRoomCreated(newRoom);
      onClose();
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.message || 'Failed to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Room</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="room-name-input">Room Name</label>
            <input
              id="room-name-input"
              type="text"
              placeholder="e.g. Gaming, Movies, Design"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={30}
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !roomName.trim()}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
