import { useState, useRef, useEffect } from 'react';
import { sendMessage } from '../services/messageService';
import { updateTypingStatus } from '../services/presenceService';

export default function MessageInput({ currentRoom, currentUser }) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const isTypingRef = useRef(false);

  const displayName = currentUser?.username || currentUser?.nickname || 'User';

  // Clear typing status on room change or unmount
  useEffect(() => {
    return () => {
      if (isTypingRef.current && currentRoom?.id && currentUser?.uid) {
        updateTypingStatus(currentRoom.id, currentUser.uid, displayName, false);
        isTypingRef.current = false;
      }
    };
  }, [currentRoom?.id, currentUser?.uid, displayName]);

  const handleTyping = (newText) => {
    setText(newText);

    if (!currentRoom?.id || !currentUser?.uid) return;

    const hasText = newText.trim().length > 0;

    if (hasText && !isTypingRef.current) {
      isTypingRef.current = true;
      updateTypingStatus(currentRoom.id, currentUser.uid, displayName, true);
    } else if (!hasText && isTypingRef.current) {
      isTypingRef.current = false;
      updateTypingStatus(currentRoom.id, currentUser.uid, displayName, false);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || isSending || !currentRoom?.id) return;

    setIsSending(true);
    setText('');

    // Clear typing status immediately on send
    if (isTypingRef.current) {
      isTypingRef.current = false;
      updateTypingStatus(currentRoom.id, currentUser.uid, displayName, false);
    }

    try {
      await sendMessage(currentRoom.id, displayName, trimmed);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Restore text if sending failed
      setText(trimmed);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isButtonDisabled = !text.trim() || isSending;

  return (
    <form onSubmit={handleSend} className="message-input-form">
      <div className="input-wrapper">
        <input
          type="text"
          placeholder={`Message #${currentRoom?.name || 'room'}...`}
          value={text}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          aria-label={`Message #${currentRoom?.name || 'room'}`}
        />
        <button
          type="submit"
          className="btn-send"
          disabled={isButtonDisabled}
          aria-label="Send message"
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
