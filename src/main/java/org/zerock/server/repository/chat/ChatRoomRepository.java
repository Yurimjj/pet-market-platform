// src/main/java/org/zerock/server/repository/chat/ChatRoomRepository.java
package org.zerock.server.repository.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.zerock.server.domain.chat.ChatRoom;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    /** 두 유저 사이의 방은 1개만 */
    Optional<ChatRoom> findByBuyerIdAndSellerId(Long buyerId, Long sellerId);

    /** ‘내 삭제시각’ 이후에 새 메시지가 있는 방만 보여주기*/
    @Query("""
        select r
        from ChatRoom r
        where (r.buyerId = :uid or r.sellerId = :uid)
          and coalesce(r.lastMessageAt, r.createdAt) >
              coalesce( case when r.buyerId = :uid then r.buyerClearedAt else r.sellerClearedAt end, :epoch )
        order by coalesce(r.lastMessageAt, r.createdAt) desc, r.id desc
    """)
    List<ChatRoom> findMyVisibleRooms(@Param("uid") Long meId, @Param("epoch") LocalDateTime epoch);
}
