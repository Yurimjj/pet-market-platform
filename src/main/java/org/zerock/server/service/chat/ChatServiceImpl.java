// src/main/java/org/zerock/server/service/chat/ChatServiceImpl.java
package org.zerock.server.service.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.chat.ChatMessage;
import org.zerock.server.domain.chat.ChatRoom;
import org.zerock.server.repository.chat.ChatMessageRepository;
import org.zerock.server.repository.chat.ChatRoomRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChatServiceImpl implements ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Override
    @Transactional
    public ChatRoom getOrCreateRoom(Long meId, Long peerId) {
        require(meId, "meId");
        require(peerId, "peerId");

        // 본인과의 대화는 금지
        if (Objects.equals(meId, peerId)) {
            throw new IllegalArgumentException("본인과는 채팅방을 만들 수 없습니다.");
        }

        // (작은ID, 큰ID)로 정규화 → 내부적으로 buyer/seller 자리에 고정
        long buyerId = Math.min(meId, peerId);
        long sellerId = Math.max(meId, peerId);

        // 이미 있으면 그 방을 반환, 없으면 생성
        return chatRoomRepository.findByBuyerIdAndSellerId(buyerId, sellerId)
                .orElseGet(() -> chatRoomRepository.save(
                        ChatRoom.builder()
                                .buyerId(buyerId)
                                .sellerId(sellerId)
                                .build()
                ));
    }


    @Override
    public List<ChatRoom> getMyRooms(Long meId) {
        require(meId, "meId");
        return chatRoomRepository.findMyVisibleRooms(meId, LocalDateTime.of(1970,1,1,0,0));
    }

    @Override
    public List<ChatMessage> getRoomMessages(Long roomId, Long meId) {
        require(roomId, "roomId");
        require(meId, "meId");

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));

        LocalDateTime cut = room.getBuyerId().equals(meId) ? room.getBuyerClearedAt() : room.getSellerClearedAt();
        if (cut == null) {
            return chatMessageRepository.findByRoom_IdOrderByCreatedAtDesc(roomId);
        }

        return chatMessageRepository.findByRoom_IdAndCreatedAtAfterOrderByCreatedAtDesc(roomId, cut);

    }

    @Override
    @Transactional
    public ChatMessage sendMessage(Long roomId, Long meId, String content) {
        require(roomId, "roomId");
        require(meId, "meId");

        // 메시지 내용 검증(공백만 들어오는 경우 방지)
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("메시지 내용이 비어 있습니다.");
        }
        String trimmed = content.trim();

        // 방 존재 여부 확인
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다. roomId=" + roomId));

        // 방 참여자 검증(권한 체크)
        if (!Objects.equals(room.getBuyerId(), meId) && !Objects.equals(room.getSellerId(), meId)) {
            throw new IllegalStateException("해당 방의 참가자가 아닙니다.");
        }

        // 1) 메시지 저장
        ChatMessage saved = chatMessageRepository.save(
                ChatMessage.builder()
                        .room(room)
                        .senderId(meId)
                        .content(trimmed)
                        .build()
        );

        // 2) 방 프리뷰/정렬용 메타 갱신
        //    - 너무 긴 본문은 잘라서 저장(목록 프리뷰에 과도한 데이터 방지)
        room.setLastMessage(trimmed.length() > 500 ? trimmed.substring(0, 500) : trimmed);
        room.setLastMessageAt(LocalDateTime.now());


        return saved;
    }


    private void require(Object v, String name) {
        if (v == null) {
            throw new IllegalArgumentException(name + " is null");
        }
    }

    @Override
    @Transactional
    public void deleteRoomForMe(Long roomId, Long meId) {
        require(roomId, "roomId");
        require(meId, "meId");

        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));

        LocalDateTime now = LocalDateTime.now();

        if (Objects.equals(room.getBuyerId(), meId)){
            room.setBuyerClearedAt(now);
        } else if (Objects.equals(room.getSellerId(), meId)){
            room.setSellerClearedAt(now);
        } else {
            throw new IllegalStateException("해당 방의 참가자가 아닙니다.");
        }

    }

    @Override
    @Transactional
    public void upsertRoomContext(Long roomId, Long productId, Long meId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));
        if (!Objects.equals(room.getBuyerId(), meId) && !Objects.equals(room.getSellerId(), meId)) {
            throw new IllegalStateException("해당 방의 참가자가 아닙니다.");
        }
        room.setContextProductId(productId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getRoomContextProductId(Long roomId, Long meId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));
        if (!Objects.equals(room.getBuyerId(), meId) && !Objects.equals(room.getSellerId(), meId)) {
            throw new IllegalStateException("해당 방의 참가자가 아닙니다.");
        }
        return room.getContextProductId();
    }
}
