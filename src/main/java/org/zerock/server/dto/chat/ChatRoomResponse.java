package org.zerock.server.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.zerock.server.domain.chat.ChatRoom;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder

// 방 단건 응답 DTO
public class ChatRoomResponse {

    private Long roomId;
    private Long buyerId;
    private Long sellerId;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;

    public static ChatRoomResponse from(ChatRoom r) {
        return ChatRoomResponse.builder()
                .roomId(r.getId())
                .buyerId(r.getBuyerId())
                .sellerId(r.getSellerId())
                .lastMessage(r.getLastMessage())
                .lastMessageAt(r.getLastMessageAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
