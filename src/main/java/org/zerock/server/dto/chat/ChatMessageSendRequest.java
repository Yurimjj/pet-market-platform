package org.zerock.server.dto.chat;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
// 메세지 전송 요청 DTO
public class ChatMessageSendRequest {
    private Long roomId;
    private String content;
}
