import React, { useEffect, useRef } from "react";

const MessageList = ({ messages, currentUser, nameResolver }) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (ts) =>
    new Date(ts || Date.now()).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderMessage = (m, idx) => {
    const isOwn = m.sender === currentUser;
    const isSystem = m.type === "JOIN" || m.type === "LEAVE";

    if (isSystem) {
      return (
        <div key={idx} className="flex justify-center my-2">
          <div
            className={`badge badge-ghost gap-2 px-3 py-2 ${
              m.type === "JOIN" ? "text-success" : "text-error"
            }`}
          >
            <span>👋</span>
            <span className="font-medium">{m.content}</span>
            <span className="text-xs text-base-content/60">
              {formatTime(m.timestamp)}
            </span>
          </div>
        </div>
      );
    }

    const displayName =
      m.senderNickname || (nameResolver ? nameResolver(m.sender) : m.sender);

    return (
      <div key={idx} className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
        {!isOwn && (
          <div className="chat-image">
            <div
              className="inline-flex items-center justify-center w-8 h-8 rounded-full
                            bg-secondary text-secondary-content overflow-hidden select-none"
            >
              <span className="text-sm font-bold leading-[1] translate-y-[0.5px]">
                {(displayName || m.sender)?.charAt(0)?.toUpperCase?.()}
              </span>
            </div>
          </div>
        )}

        {!isOwn && (
          <div className="chat-header text-xs text-base-content/60 mb-0.5">
            <span className="font-semibold text-base-content">
              {displayName}
            </span>
            <time className="ml-1 opacity-70">{formatTime(m.timestamp)}</time>
          </div>
        )}

        <div
          className={`chat-bubble ${
            isOwn
              ? "chat-bubble-success text-success-content"
              : "bg-accent text-neutral-content"
          } whitespace-pre-wrap break-words`}
        >
          {m.content}
        </div>

        {isOwn && (
          <div className="chat-footer opacity-70 text-xs mt-1">
            {formatTime(m.timestamp)}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 p-4 space-y-2 scroll-smooth">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-base-content/60">
            <div className="text-4xl mb-4">💬</div>
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
          </div>
        </div>
      ) : (
        messages.map(renderMessage)
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
