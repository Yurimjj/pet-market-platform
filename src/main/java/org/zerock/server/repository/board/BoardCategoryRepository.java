package org.zerock.server.repository.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.board.BoardCategory;

import java.util.Optional;

public interface BoardCategoryRepository extends JpaRepository<BoardCategory, Integer> {
    Optional<BoardCategory> findByCategoryName(String CategoryName);

}
