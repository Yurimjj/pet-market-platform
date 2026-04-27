package org.zerock.server.domain.order;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;

@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_review_info")
public class ReviewInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", unique = true, nullable = false)
    private TransactionHistory transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private UserInfo reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private UserInfo reviewee;

    @Column(nullable = false)
    private int rating;

    @Lob
    private String content;

    @Column(name = "created_at", updatable = false, insertable = false)
    private java.sql.Timestamp createdAt;
}
