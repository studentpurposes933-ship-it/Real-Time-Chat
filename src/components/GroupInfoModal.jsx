import { useState, useEffect } from 'react';
import { removeMemberFromRoom } from '../services/roomService';
import { formatMessageTime } from '../services/messageService';

export default function GroupInfoModal({ 
  isOpen, 
  onClose, 
  room, 
  allUsers, 
  currentUser 
}) {
  const [isLoading, setIsLoading] = useState(false);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !room) return null;

  const isHost = 
    (room.creatorUid && room.creatorUid === currentUser?.uid) ||
    (room.createdBy && room.createdBy === (currentUser?.username || currentUser?.nickname));

  const hostName = room.createdBy || 'System';
  const createdDate = room.createdAt ? formatMessageTime(room.createdAt) : null;

  // Filter members in this room from allUsers
  const memberUids = room.members || [];
  const memberList = memberUids.map((uid) => {
    const found = allUsers.find((u) => u.uid === uid);
    if (found) return found;
    return {
      uid,
      username: uid === room.creatorUid ? hostName : 'Group Member',
      isOnline: false,
    };
  });

  const handleRemoveMember = async (targetUser) => {
    if (!isHost || targetUser.uid === currentUser?.uid) return;
    const targetName = targetUser.username || targetUser.nickname || 'User';

    if (!window.confirm(`Are you sure you want to remove ${targetName} from #${room.name}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await removeMemberFromRoom(room.id, targetUser.uid, targetName, currentUser);
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content group-info-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="group-info-title-row">
            <span className="hashtag">#</span>
            <h3>{room.name}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="group-meta-card">
          <div className="host-badge-row">
            <span className="crown-icon">👑</span>
            <span className="meta-label">Group Host:</span>
            <span className="host-name">{hostName}</span>
          </div>
          {createdDate && (
            <div className="created-date-row">
              <span className="meta-label">Created at:</span>
              <span>{createdDate}</span>
            </div>
          )}
        </div>

        <div className="members-section-header">
          <h4>GROUP MEMBERS ({memberList.length})</h4>
          {isHost && <span className="admin-status-pill">You are Host</span>}
        </div>

        <div className="group-members-list">
          {memberList.map((member) => {
            const isMemberHost = 
              member.uid === room.creatorUid || 
              member.username === hostName;
            const isMe = member.uid === currentUser?.uid;

            return (
              <div key={member.uid} className="member-item-row">
                <div className="member-item-left">
                  <span className={`status-dot ${member.isOnline ? 'online' : 'offline'}`}>
                    {member.isOnline ? '🟢' : '⚪'}
                  </span>
                  <div className="member-info-col">
                    <div className="member-name-row">
                      <span className="member-name">{member.username || 'User'}</span>
                      {isMe && <span className="you-pill">(You)</span>}
                      {isMemberHost && <span className="host-crown-tag" title="Group Host">👑 Host</span>}
                    </div>
                    <span className={member.isOnline ? 'text-online-status' : 'text-offline-status'}>
                      {member.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                {isHost && !isMemberHost && !isMe && (
                  <button
                    className="btn-remove-member"
                    onClick={() => handleRemoveMember(member)}
                    disabled={isLoading}
                    title={`Remove ${member.username || 'member'}`}
                  >
                    🚫 Remove
                  </button>
                )}
              </div>
            );
          })}
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
