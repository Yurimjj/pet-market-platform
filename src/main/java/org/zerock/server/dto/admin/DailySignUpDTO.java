package org.zerock.server.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class DailySignUpDTO {
    private final LocalDate date;
    private final long count;
}
