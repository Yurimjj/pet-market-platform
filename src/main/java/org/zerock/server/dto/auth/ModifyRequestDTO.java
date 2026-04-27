package org.zerock.server.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModifyRequestDTO {
    private Long userId;
    private String email;
    private String phoneNumber;
    private String password;
    private String nickname;
    private String region;
}
