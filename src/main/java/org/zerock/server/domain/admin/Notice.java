package org.zerock.server.domain.admin;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.zerock.server.domain.user.UserInfo;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_notice")
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long noticeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writer_id", nullable = false)
    private UserInfo writer;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isPublished = true;

    @Column(nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @CreationTimestamp // 엔티티 생성 시 현재 시간을 자동 주입
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp // 엔티티 수정 시 현재 시간을 자동 갱신
    @Column(nullable = false)
    private Timestamp updatedAt;
}
