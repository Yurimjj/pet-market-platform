package org.zerock.server.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.zerock.server.domain.chat.ChatMessage;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
// 메세지 응답 DTO (REST 전용)
public class ChatMessageResponseDTO {

    private Long messageId;
    private Long roomId;
    private Long senderId;
    private String senderNickname;
    private String content;
    private LocalDateTime createdAt;

    public static ChatMessageResponseDTO from(ChatMessage m, String senderNickname) {
        return ChatMessageResponseDTO.builder()
                .messageId(m.getId())
                .roomId(m.getRoom().getId())
                .senderId(m.getSenderId())
                .senderNickname(senderNickname)
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
