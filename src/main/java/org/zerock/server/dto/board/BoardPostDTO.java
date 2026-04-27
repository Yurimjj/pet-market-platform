package org.zerock.server.dto.board;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class BoardPostDTO {
    private Long postId;

    private Long userInfo;

    private String title;

    private String nickname;

    private String content;

    @Builder.Default
    private int viewCount = 0;

    @Builder.Default
    private boolean isDeleted = false;

    private String categoryName;

    // 업로드가 완료된 파일의 이름만 문자열로 저장한 리스트
    @Builder.Default
    private List<String> uploadFileNames = new ArrayList<>();

    @Builder.Default
    private List<BoardAttachmentDTO> attachmentList = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
