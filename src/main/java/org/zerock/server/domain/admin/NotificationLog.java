package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_notification_log")
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo user;

    @Column(nullable = false, length = 50)
    private String type; // CHAT_MESSAGE, PRICE_CHANGE, NEW_PRODUCT, TRANSACTION_STATUS

    @Lob
    @Column(nullable = false)
    private String content;

    @Column
    private Long relatedId; // 연관 엔티티 ID (nullable)

    @Column(nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(nullable = false, updatable = false, insertable = false)
    private Timestamp createdAt;
}
