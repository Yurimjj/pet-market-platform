package org.zerock.server.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.chat.ChatMessage;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    /** 방의 메시지 전부 (최신순) */
    List<ChatMessage> findByRoom_IdOrderByCreatedAtDesc(Long roomId); // ← 여기!

    /** 특정 시각 이후 메세지만 (최신순으로) - 내 삭제시각 이후로만 보이게*/
    List<ChatMessage> findByRoom_IdAndCreatedAtAfterOrderByCreatedAtDesc(Long roomId, LocalDateTime after);


}
