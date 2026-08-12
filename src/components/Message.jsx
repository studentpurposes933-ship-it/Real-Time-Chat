import { formatMessageTime } from '../services/messageService';

export default function Message({ message, currentUser }) {
  const isSystem = message.type === 'system' || message.senderId === 'system';
  const timeString = formatMessageTime(message.timestamp);

  if (isSystem) {
    return (
      <div className="system-message-container">
        <div className="system-message-bubble">
          <span className="system-message-text">{message.message}</span>
          <span className="system-message-time">• {timeString}</span>
        </div>
      </div>
    );
  }

  const isOwnMessage = message.senderId === currentUser?.uid;

  return (
    <div className={`message-wrapper ${isOwnMessage ? 'message-own' : 'message-other'}`}>
      <div className="message-bubble">
        {!isOwnMessage && (
          <div className="message-sender-name">{message.senderName || 'Anonymous'}</div>
        )}

        <div className="message-content-text">{message.message}</div>

        <div className="message-metadata">
          <span className="message-time">{timeString}</span>
          {isOwnMessage && (
            <span className="message-status-check" title="Sent">
              ✓ Sent
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
