package org.zerock.server.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@AllArgsConstructor

// 웹소켓 DTO
public class ChatMessageDTO {
    private MessageType type;
    private String content;
    private String sender;

    // 수신자 (1:1 채팅용)
    private String receiver;

    private String timestamp;

    private String senderNickname;    // 표시용
    private String receiverNickname;  // 표시용

    public enum MessageType {
        CHAT, JOIN, LEAVE
    }

    public ChatMessageDTO() {
        this.timestamp = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    }

    public ChatMessageDTO(MessageType type, String content, String sender) {
        this();
        this.type = type;
        this.content = content;
        this.sender = sender;
//        this.roomUserNames = names;
    }
}
