package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.user.UserInfo;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_product_info")
@ToString(exclude = {"seller", "category", "images", "likes", "tagRelations"})
public class ProductInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private UserInfo seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 0)
    private BigDecimal price;

    @Column(nullable = false, length = 50)
    private String conditionStatus;

    @Column(nullable = false, length = 50)
    private String tradeMethod;

    @Column(length = 255)
    private String tradeLocation;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 7)
    private BigDecimal longitude;

    @Column(name = "addr", length = 255)   // ⬅︎ 선생님 방식: 주소 문자열만 저장
    private String addr;

    // ✅ @Builder.Default 로 빌더 생성 시에도 기본값 유지
    @Builder.Default
    @Column(nullable = false)
    private int viewCount = 0;

    @Builder.Default
    @Column(nullable = false, length = 50)
    private String status = "SELLING";

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    // 클래스 내부 하단에 필드 4개 추가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id")
    private UserInfo buyer;                // 누가 구매했는지

    @Column(name = "sold_at")
    private LocalDateTime soldAt;          // 판매자가 '판매 완료' 누른 시각

    @Column(name = "seller_confirmed_at")
    private LocalDateTime sellerConfirmedAt;

    @Column(name = "buyer_confirmed_at")
    private LocalDateTime buyerConfirmedAt; // 구매자가 '구매 완료' 누른 시각

    // 상품-이미지 양방향
    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductImage> images = new HashSet<>();

    // 찜 양방향
    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductLike> likes = new HashSet<>();

    // 태그 조인 양방향
    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ProductTagRelation> tagRelations = new HashSet<>();
}
