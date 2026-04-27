package org.zerock.server.dto.notice;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.zerock.server.domain.admin.Notice;

import java.sql.Timestamp;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NoticeResponseDTO {
    private Long noticeId;       // 공지사항 ID
    private String writerName;   // 작성자 닉네임
    private Long writerId;       // 작성자 ID
    private String title;        // 제목
    private String content;      // 내용
    private Boolean isPublished; // 게시 여부
    private Integer viewCount;   // 조회수
    private Timestamp createdAt; // 작성일
    private Timestamp updatedAt; // 수정일

    public NoticeResponseDTO(Notice notice) {
        this.noticeId = notice.getNoticeId();
        this.writerName = notice.getWriter().getNickname();
        this.writerId = notice.getWriter().getUserId();
        this.title = notice.getTitle();
        this.content = notice.getContent();
        this.isPublished = notice.getIsPublished();
        this.viewCount = notice.getViewCount(); //조회수
        this.createdAt = notice.getCreatedAt();
        this.updatedAt = notice.getUpdatedAt();
    }

    public NoticeResponseDTO(Long noticeId, String title, String writerName,
                             Timestamp createdAt, Integer viewCount) {
        this.noticeId = noticeId;
        this.title = title;
        this.writerName = writerName;
        this.createdAt = createdAt;
        this.viewCount = viewCount;
    }
}
