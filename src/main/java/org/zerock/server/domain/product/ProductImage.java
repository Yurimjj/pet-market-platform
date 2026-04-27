package org.zerock.server.domain.product;

import jakarta.persistence.*;
import lombok.*;
import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "tb_product_image")
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductInfo product;

    @Column(nullable = false, length = 255)
    private String imageUrl;

    @Builder.Default
    @Column(name = "is_thumbnail", nullable = false)
    private boolean isThumbnail = false;

    @Column(name = "uploaded_at", updatable = false)
    private Timestamp uploadedAt;
}
