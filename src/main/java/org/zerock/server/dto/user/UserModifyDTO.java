package org.zerock.server.dto.user;

import lombok.Data;

@Data
public class UserModifyDTO {

    private String email;
    private String pw;
    private String nickname;

}
