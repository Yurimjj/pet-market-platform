package org.zerock.server.dto.board;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BoardCommentDTO {

    private Long commentId;
    private Long postId;
    private Long parentId;
    private Long userId;
    private int depth;
    private String nickname;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isDeleted;

    private List<BoardCommentDTO> children;
}
