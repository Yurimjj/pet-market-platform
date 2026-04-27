package org.zerock.server.service.notice;

import org.zerock.server.dto.notice.NoticeCreateDTO;
import org.zerock.server.dto.notice.NoticePageRequestDTO;
import org.zerock.server.dto.notice.NoticePageResponseDTO;
import org.zerock.server.dto.notice.NoticeResponseDTO;

import java.util.List;

public interface NoticeService {
    NoticePageResponseDTO<NoticeResponseDTO> getNoticeList(NoticePageRequestDTO requestDTO);

    List<NoticeResponseDTO> getPublishedNotices();

    NoticeResponseDTO getNotice(Long noticeId);

    NoticeResponseDTO createNotice(NoticeCreateDTO request, Long userId);

    NoticeResponseDTO updateNotice(Long noticeId, NoticeCreateDTO request, Long userId);

    void deleteNotice(Long noticeId, Long userId);

    // [ADD] 관리자에겐 숨김 포함 여부를 전달하는 오버로드 메서드
    NoticePageResponseDTO<NoticeResponseDTO> getNoticeList(NoticePageRequestDTO requestDTO, boolean includeHiddenForAdmin);

}
