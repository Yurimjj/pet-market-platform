package org.zerock.server.dto.board;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class CommentPageDTO {
    private List<BoardCommentDTO> parentComments;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
}

