import React, { useRef, useState } from "react";

const MessageInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const composingRef = useRef(false);

  const submit = async () => {
    const text = message.trim();
    if (!text || disabled || sending) return;
    try {
      setSending(true);
      await onSendMessage(text);
      setMessage("");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing || composingRef.current) return;

    // Enter 전송, Shift+Enter 줄바꿈
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const emojis = ["😀", "😂", "❤️", "👍", "👎", "😢", "😮", "😡"];

  const addEmoji = (emoji) => {
    setMessage((prev) => prev + emoji);
  };

  return (
    <div className="bg-base-100 border-t border-base-300/60 p-4">
      {/* 이모지 버튼들 */}
      <div className="flex gap-2 mb-3">
        {emojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => addEmoji(emoji)}
            className={`btn btn-ghost btn-circle text-xl ${
              disabled || sending ? "btn-disabled" : ""
            }`}
            disabled={disabled || sending}
            type="button"
            aria-label={`emoji-${index}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-stretch">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => (composingRef.current = true)}
            onCompositionEnd={() => (composingRef.current = false)}
            placeholder={
              disabled
                ? "연결 중..."
                : "메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
            }
            disabled={disabled || sending}
            rows="2"
            maxLength={500}
            className="textarea textarea-bordered w-full resize-none
                       focus:outline-none focus:ring-2 focus:ring-secondary/40
                       focus:ring-offset-2 focus:ring-offset-base-100
                       focus:border-secondary
                       transition-[box-shadow,border-color] duration-150
                       disabled:bg-base-200"
          />
          <div className="absolute bottom-2 right-2 text-xs text-base-content/50">
            {message.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={disabled || sending || !message.trim()}
          className={`btn btn-secondary self-stretch h-auto min-h-0 px-6 font-semibold ${
            disabled || sending || !message.trim() ? "btn-disabled" : ""
          }`}
        >
          {sending ? "전송중..." : "전송"}
          <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
