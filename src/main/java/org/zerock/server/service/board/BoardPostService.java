package org.zerock.server.service.board;

import org.zerock.server.dto.board.BoardPostDTO;
import org.zerock.server.dto.board.PageRequestDTO;
import org.zerock.server.dto.board.PageResponseDTO;

public interface BoardPostService {

    Long register(BoardPostDTO boardPostDTO, Long userId);

    BoardPostDTO get(Long postId);

    void modify(Long postId, BoardPostDTO boardPostDTO, Long userId);

    void remove(Long postId, Long userId);

    // 페이징 처리
    PageResponseDTO<BoardPostDTO> list (PageRequestDTO pageRequestDTO);

    void removeAttachment(Long postId, Long attachmentId, Long userId);

}
