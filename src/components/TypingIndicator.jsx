export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) return null;

  let text;
  if (typingUsers.length === 1) {
    text = `${typingUsers[0]} is typing...`;
  } else if (typingUsers.length === 2) {
    text = `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
  } else {
    text = `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
  }

  return (
    <div className="typing-indicator-container">
      <div className="typing-bubbles">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <span className="typing-text">{text}</span>
    </div>
  );
}
