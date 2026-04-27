package org.zerock.server.dto.auth;

import lombok.Data;

@Data
public class WithdrawalRequestDTO {
    private Long userId;
    private String email;
    private String password;
}
