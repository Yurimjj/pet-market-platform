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
@Table(name = "tb_board_post")
public class BoardPost extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserInfo userInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private BoardCategory category;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false)
    private String content;

    @Builder.Default
    private int viewCount = 0;

    @Builder.Default
    private boolean isDeleted = false;

    public void changeTitle(String title){
        this.title = title;
    }

    public void changeCategory(BoardCategory category){
        this.category = category;
    }

    public void changeContent(String content){
        this.content = content;
    }
}
