package org.zerock.server.service.chat;

import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;

import java.util.List;

public interface ChatService {

    ChatRoom getOrCreateRoom(Long meId, Long peerId);

    List<ChatRoom> getMyRooms(Long meId);

    List<ChatMessage> getRoomMessages(Long roomId, Long meId);

    ChatMessage sendMessage(Long roomId, Long meId, String content);

    void deleteRoomForMe(Long roomId, Long meId);

    void upsertRoomContext(Long roomId, Long productId, Long meId);

    Long getRoomContextProductId(Long roomId, Long meId);
}