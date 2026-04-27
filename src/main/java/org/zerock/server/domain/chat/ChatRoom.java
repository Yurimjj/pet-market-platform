// src/main/java/org/zerock/server/domain/chat/ChatRoom.java
package org.zerock.server.domain.chat;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.BaseTimeEntity;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_chat_room")
public class ChatRoom extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_id")
    private Long id;

    /** 참여자: UserInfo 매핑 대신 ID만 저장 */
    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "context_product_id")
    private Long contextProductId;

    @Column(length = 500)
    private String lastMessage;

    private LocalDateTime lastMessageAt;

    /** 각 사용자별 내 화면에서 삭제 시간 (이전 메세지는 숨김) */
    private LocalDateTime buyerClearedAt;
    private LocalDateTime sellerClearedAt;


}
