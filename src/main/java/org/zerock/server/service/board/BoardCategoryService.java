package org.zerock.server.service.board;

import org.zerock.server.dto.board.BoardCategoryDTO;

public interface BoardCategoryService {

    // 카테고리 변경 메서드
    void changeCategoryName(BoardCategoryDTO boardCategoryDTO);
}
