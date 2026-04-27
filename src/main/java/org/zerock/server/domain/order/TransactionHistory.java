package org.zerock.server.domain.order;

import jakarta.persistence.*;
import lombok.*;
import org.zerock.server.domain.product.ProductInfo;
import org.zerock.server.domain.user.UserInfo;

@Getter @Setter @Builder
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "tb_transaction_history")
public class TransactionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long transactionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private ProductInfo product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private UserInfo buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private UserInfo seller;

    @Column(name = "transaction_date", updatable = false, insertable = false)
    private java.sql.Timestamp transactionDate;

    @Column(precision = 10, scale = 0)
    private java.math.BigDecimal finalPrice;

    @Column(nullable = false, length = 50)
    private String transactionStatus;
}
