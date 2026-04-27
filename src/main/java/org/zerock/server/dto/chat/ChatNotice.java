package org.zerock.server.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatNotice {

    private String type;
    private Long roomId;
    private Long messageId;
    private Long fromUserId;
}
