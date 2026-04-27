// src/main/java/org/zerock/server/domain/chat/ChatMessage.java
package org.zerock.server.domain.chat;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.BaseTimeEntity;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_chat_message")
public class ChatMessage extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long id;

    /** 방 FK — 메시지 히스토리는 room 기준으로 조회 */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    /** 보낸 사람 ID — UserInfo 매핑 대신 ID만 저장 */
    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    @Column(nullable = false, length = 2000)
    private String content;

}
