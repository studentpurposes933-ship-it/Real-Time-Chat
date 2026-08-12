import { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

export default function MessageList({ messages, currentUser, typingUsers, currentRoom }) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // Track if user is scrolled near bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 120;
  };

  // Smooth scroll to bottom
  const scrollToBottom = (behavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  };

  // Scroll to bottom when room changes or new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      const isMyMessage = lastMsg?.senderId === currentUser?.uid;

      if (isNearBottomRef.current || isMyMessage) {
        scrollToBottom('smooth');
      }
    }
  }, [messages, currentUser?.uid]);

  // Initial room scroll
  useEffect(() => {
    scrollToBottom('auto');
  }, [currentRoom?.id]);

  return (
    <div 
      className="messages-scroll-area" 
      ref={containerRef} 
      onScroll={handleScroll}
    >
      <div className="room-welcome-banner">
        <div className="welcome-hashtag">#</div>
        <h2>Welcome to #{currentRoom?.name || 'General'}</h2>
        <p>This is the start of the #{currentRoom?.name || 'General'} channel.</p>
        <p className="welcome-subtext">Send a message to start the conversation.</p>
      </div>

      {messages.length === 0 ? (
        <div className="empty-chat-state">
          <p>No messages yet. Be the first to say hello! 👋</p>
        </div>
      ) : (
        messages.map((msg) => (
          <Message key={msg.id} message={msg} currentUser={currentUser} />
        ))
      )}

      <TypingIndicator typingUsers={typingUsers} />
      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  );
}
