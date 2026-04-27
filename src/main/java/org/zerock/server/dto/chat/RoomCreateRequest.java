package org.zerock.server.dto.chat;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor

// 방 생성 요청 DTO
public class RoomCreateRequest {

    private Long peerId;
}
