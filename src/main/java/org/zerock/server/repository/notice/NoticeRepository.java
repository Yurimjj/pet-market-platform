package org.zerock.server.repository.notice;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.zerock.server.domain.admin.Notice;

import java.util.List;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    // 사용자에게 보여줄 게시된 최신 공지사항 목록 조회
    List<Notice> findByIsPublishedTrueOrderByCreatedAtDesc();

    List<Notice> findAllByOrderByCreatedAtDesc();

    Page<Notice> findAllByIsPublishedTrue(Pageable pageable);
}
