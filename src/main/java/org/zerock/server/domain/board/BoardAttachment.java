package org.zerock.server.domain.board;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_board_attachment")
public class BoardAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attachmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private BoardPost boardPost;

    @Column(nullable = false, length = 255)
    private String fileUrl;

    @Column(nullable = false, length = 50)
    private String fileType;

    @UpdateTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private Timestamp uploadedAt;

}