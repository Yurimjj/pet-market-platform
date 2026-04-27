package org.zerock.server.dto.board;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class PageRequestDTO {

    @Builder.Default
    private int page = 1;

    @Builder.Default
    private int size = 10;

    private String type;
    private String keyword;

    public String getLink() {
        StringBuilder builder = new StringBuilder();
        builder.append("page=" + this.page);
        builder.append("&size=" + this.size);
        if (this.type != null && this.keyword != null) {
            try {
                // 키워드에 특수문자가 있을 경우를 대비해 인코딩 처리
                builder.append("&type=" + this.type);
                builder.append("&keyword=" + java.net.URLEncoder.encode(this.keyword, "UTF-8"));
            } catch (java.io.UnsupportedEncodingException e) {
            }
        }
        return builder.toString();
    }
}
