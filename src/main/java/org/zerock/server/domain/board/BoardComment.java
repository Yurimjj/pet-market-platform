package org.zerock.server.domain.board;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.BaseTimeEntity;
import org.zerock.server.domain.user.UserInfo;
import java.util.HashSet;
import java.util.Set;

@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_board_comment")
@ToString(exclude = {"post", "user", "parentComment", "children"})  // 순환 참조 방지
public class BoardComment extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private BoardPost post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    private BoardComment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<BoardComment> children = new HashSet<>();

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(nullable = false)
    @Builder.Default
    private boolean isDeleted = false;

    @Column(nullable = false)
    @Builder.Default
    private int depth = 0; // 댓글의 깊이 (0: 최상위 댓글, 1: 1단계 대댓글, ...)

    public void changeContent(String content) {
        this.content = content;
    }

    public void changeIsDeleted(boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    // 편의 메서드: 부모 댓글 설정
    public void setParentComment(BoardComment parentComment) {
        this.parentComment = parentComment;
        if (parentComment != null) {
            this.depth = parentComment.getDepth() + 1; // 부모 댓글의 깊이 + 1
        } else {
            this.depth = 0; // 부모가 없으면 최상위 댓글
        }
    }

}
