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

// 방 목록 DTO
public class ChatRoomListItemDTO {

    private Long roomId;
    private Long meId;
    private Long peerId;
    private String peerNickname;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;

    public static ChatRoomListItemDTO from(ChatRoom r, Long meId, String peerNickname) {
        Long peerId = r.getBuyerId().equals(meId) ? r.getSellerId() : r.getBuyerId();
        return ChatRoomListItemDTO.builder()
                .roomId(r.getId())
                .meId(meId)
                .peerId(peerId)
                .peerNickname(peerNickname)
                .lastMessage(r.getLastMessage())
                .lastMessageAt(r.getLastMessageAt())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
