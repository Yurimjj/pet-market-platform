package org.zerock.server.repository.board;

import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.board.BoardAttachment;
import org.zerock.server.domain.board.BoardPost;

import java.util.List;

public interface BoardAttachmentRepository extends JpaRepository<BoardAttachment, Long> {
    // 특정 게시글(BoardPost) 엔티티에 연결된 모든 첨부 파일 찾아오는 메서드
    List<BoardAttachment> findByBoardPost(BoardPost boardPost);
}
