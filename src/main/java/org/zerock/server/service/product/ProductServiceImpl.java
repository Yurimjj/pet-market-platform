package org.zerock.server.service.product;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.zerock.server.domain.product.*;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.domain.user.UserRole;
import org.zerock.server.dto.product.*;
import org.zerock.server.repository.product.*;
import org.zerock.server.repository.user.UserInfoRepository;
import org.zerock.server.repository.order.TransactionHistoryRepository;

import java.time.LocalDateTime; // ★ toggleLike에 필요
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductInfoRepository productInfoRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductTagRepository productTagRepository;
    private final ProductTagRelationRepository productTagRelationRepository;
    private final ProductLikeRepository productLikeRepository;
    private final UserInfoRepository userInfoRepository;
    private final TransactionHistoryRepository transactionHistoryRepository;

    /** 권한/유저 헬퍼 */
    private boolean hasRole(UserInfo user, UserRole role) {
        return user.getUserRoleList() != null && user.getUserRoleList().contains(role);
    }
    private UserInfo getUser(UserDetails userDetails) {
        if (userDetails == null) throw new IllegalArgumentException("로그인 필요");
        return userInfoRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }
    private UserInfo getUser(Long userId) {
        if (userId == null) throw new IllegalArgumentException("로그인 필요");
        return userInfoRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자 없음"));
    }

    // ProductServiceImpl 클래스 내부
    private void setTxStatusByProduct(Long productId, String status) {
        transactionHistoryRepository.findByProduct_ProductId(productId)
                .ifPresent(tx -> {
                    tx.setTransactionStatus(status);
                    transactionHistoryRepository.save(tx);
                });
    }

    /** 등록: 컨트롤러가 저장한 파일명(dto.uploadFileNames)을 DB에만 기록 */
    @Transactional
    @Override
    public Long registerProduct(ProductRegisterRequestDto dto, Long userId) {
        UserInfo user = getUser(userId);

        ProductCategory category = productCategoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리 없음"));

        ProductInfo product = ProductInfo.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .conditionStatus(dto.getConditionStatus())
                .tradeMethod(dto.getTradeMethod())
                .addr(dto.getAddr())
                .seller(user)
                .category(category)
                .build();

        ProductInfo saved = productInfoRepository.save(product);

        // 이미지(파일명 기반)
        List<String> fileNames = dto.getUploadFileNames();
        if (fileNames != null && !fileNames.isEmpty()) {
            boolean first = true;
            for (String fn : fileNames) {
                productImageRepository.save(ProductImage.builder()
                        .product(saved)
                        .imageUrl(fn)          // 컨트롤러가 넘긴 "파일명"만 저장
                        .isThumbnail(first)
                        .build());
                first = false;
            }
        }

        // 태그
        if (dto.getTagNames() != null) {
            for (String tagName : dto.getTagNames()) {
                ProductTag tag = productTagRepository.findByTagName(tagName)
                        .orElseGet(() -> productTagRepository.save(ProductTag.builder().tagName(tagName).build()));
                productTagRelationRepository.save(ProductTagRelation.builder()
                        .product(saved)
                        .tag(tag)
                        .build());
            }
        }

        return saved.getProductId();
    }

    /** 수정: DTO.uploadFileNames = 수정 후 최종 파일 집합 */
    @Transactional
    @Override
    public void updateProduct(Long productId, ProductUpdateRequestDto dto, Long userId) {
        UserInfo user = getUser(userId);

        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        if (!product.getSeller().getUserId().equals(user.getUserId()) && !hasRole(user, UserRole.ADMIN)) {
            throw new SecurityException("수정 권한 없음");
        }

        // [ADD] SOLD 전환 감지를 위한 이전 상태 저장
        String beforeStatus = product.getStatus(); // [ADD]

        // 기본 필드 업데이트
        if (dto.getTitle() != null) product.setTitle(dto.getTitle());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getConditionStatus() != null) product.setConditionStatus(dto.getConditionStatus());
        if (dto.getTradeMethod() != null) product.setTradeMethod(dto.getTradeMethod());
        if (dto.getStatus() != null) product.setStatus(dto.getStatus());
        if (dto.getCategoryId() != null) {
            ProductCategory cat = productCategoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("카테고리 없음"));
            product.setCategory(cat);
        }
        if (dto.getAddr() != null) {                    // ★ 변경: 선생님 방식 핵심 – addr만 갱신
            product.setAddr(dto.getAddr());
        }

        // --- 이미지 동기화 (DB 레코드 기준) ---
        List<ProductImage> current = productImageRepository.findAllByProduct_ProductId(productId);
        Set<String> currentNames = current.stream()
                .map(ProductImage::getImageUrl)
                .collect(Collectors.toSet());

        List<String> finalNames = (dto.getUploadFileNames() != null) ? dto.getUploadFileNames() : Collections.emptyList();
        Set<String> finalSet = new HashSet<>(finalNames);

        // 삭제 대상(현재 DB엔 있는데 최종 목록엔 없음)
        List<ProductImage> toDelete = current.stream()
                .filter(img -> !finalSet.contains(img.getImageUrl()))
                .collect(Collectors.toList());
        if (!toDelete.isEmpty()) {
            productImageRepository.deleteAll(toDelete);
        }

        // 추가 대상(최종 목록엔 있는데 DB엔 없음)
        List<String> toAdd = finalNames.stream()
                .filter(fn -> !currentNames.contains(fn))
                .collect(Collectors.toList());
        for (String fn : toAdd) {
            productImageRepository.save(ProductImage.builder()
                    .product(product)
                    .imageUrl(fn)
                    .isThumbnail(false) // 썸네일은 아래에서 일괄 재설정
                    .build());
        }

        // 썸네일 재설정: 최종 목록의 첫 번째를 썸네일로
        current = productImageRepository.findAllByProduct_ProductId(productId);
        for (ProductImage img : current) {
            img.setThumbnail(false);
        }
        if (!finalNames.isEmpty()) {
            String thumb = finalNames.get(0);
            for (ProductImage img : current) {
                if (thumb.equals(img.getImageUrl())) {
                    img.setThumbnail(true);
                    break;
                }
            }
        }

        // ★ 태그 교체: dto.getTagNames()가 "전달된 경우"에만 실행 (null이면 유지)
        if (dto.getTagNames() != null) {
            productTagRelationRepository.deleteAllByProduct_ProductId(productId); // 기존 전부 제거
            for (String name : dto.getTagNames()) {
                if (name == null || name.isBlank()) continue;
                String tagName = name.trim();
                ProductTag tag = productTagRepository.findByTagName(tagName)
                        .orElseGet(() -> productTagRepository.save(ProductTag.builder().tagName(tagName).build()));
                productTagRelationRepository.save(
                        ProductTagRelation.builder().product(product).tag(tag).build()
                );
            }
        }
        productInfoRepository.save(product);

        // [ADD] 상태가 SOLD로 "전환"되면 찜 일괄 삭제
        if ((beforeStatus == null || !"SOLD".equalsIgnoreCase(beforeStatus))
                && "SOLD".equalsIgnoreCase(product.getStatus())) {
            productLikeRepository.deleteByProduct_ProductId(productId); // [ADD]
            setTxStatusByProduct(productId, "판매완료"); // ★ 예약목록에서 빠지도록 거래이력도 완료 처리
        }
    }

    /** 삭제: soft delete만 수행 (실제 파일 삭제는 컨트롤러에서) */
    @Transactional
    @Override
    public void deleteProduct(Long productId, Long userId) {
        UserInfo user = getUser(userId);

        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        if (!product.getSeller().getUserId().equals(user.getUserId()) && !hasRole(user, UserRole.ADMIN)) {
            throw new SecurityException("삭제 권한 없음");
        }

        // ★ (선택) 찜 레코드 정리 – DB도 깔끔하게
        productLikeRepository.deleteByProduct_ProductId(productId);

        product.setDeleted(true);
        productInfoRepository.save(product);
    }

    // ===== 기존 구현 그대로 채워 넣음 =====

    @Transactional(readOnly = true)
    @Override
    public ProductDetailResponseDto getProductDetail(Long productId, UserDetails userDetails) {
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        // [CHG] 삭제 예외 허용 로직: 구매자(또는 관리자)이고 거래완료면 상세 접근 허용
        UserInfo currentUser = (userDetails != null) ? getUser(userDetails) : null; // [CHG] 체크를 위해 먼저 로드
        if (product.isDeleted()) { // [CHG]
            boolean allowed = false; // [CHG]

            if (currentUser != null) { // [CHG]
                boolean isBuyer = product.getBuyer() != null
                        && Objects.equals(product.getBuyer().getUserId(), currentUser.getUserId());
                boolean isAdmin = hasRole(currentUser, UserRole.ADMIN);
                boolean completed = ("SOLD".equalsIgnoreCase(product.getStatus()))
                        || (product.getBuyerConfirmedAt() != null && product.getSellerConfirmedAt() != null);
                allowed = (isBuyer || isAdmin) && completed;
            }

            if (!allowed) {
                throw new IllegalArgumentException("삭제된 상품"); // [CHG] 기존 동작 유지(권한 없으면 차단)
            }
        }
        // (삭제되지 않았거나, 삭제됐지만 허용된 경우 → 계속 진행)

        // 이미지 목록 매핑
        List<ProductImageDto> images = new ArrayList<>();
        productImageRepository.findAllByProduct_ProductId(productId)
                .forEach(img -> images.add(ProductImageDto.builder()
                        .imageId(img.getImageId())
                        .imageUrl(img.getImageUrl())
                        .isThumbnail(img.isThumbnail())
                        .build()));

        // 태그명 목록
        List<String> tagNames = new ArrayList<>();
        productTagRelationRepository.findAllByProduct_ProductId(productId)
                .forEach(rel -> tagNames.add(rel.getTag().getTagName()));

        // 로그인 유저가 찜했는지
        boolean isLiked = false;
        if (currentUser != null) {
            isLiked = productLikeRepository.findByUserInfoAndProduct(currentUser, product).isPresent();
        }

        // [CHG] 상세 DTO에 거래 관련 필드들 매핑 추가
        UserInfo buyer = product.getBuyer(); // [CHG]
        Long buyerId = (buyer != null ? buyer.getUserId() : null); // [CHG]
        String buyerNickname = (buyer != null ? buyer.getNickname() : null); // [CHG]

        // 카테고리/판매자 DTO와 함께 반환
        return ProductDetailResponseDto.builder()
                .productId(product.getProductId())
                .title(product.getTitle())
                .description(product.getDescription())
                .price(product.getPrice())
                .conditionStatus(product.getConditionStatus())
                .tradeMethod(product.getTradeMethod())
                .addr(product.getAddr())
                .status(product.getStatus())
                .viewCount(product.getViewCount())
                .isLiked(isLiked)
                .category(ProductCategoryDto.builder()
                        .categoryId(product.getCategory().getCategoryId())
                        .categoryName(product.getCategory().getCategoryName())
                        .parentCategoryId(product.getCategory().getParentCategory() != null
                                ? product.getCategory().getParentCategory().getCategoryId()
                                : null)
                        .petTypeId(product.getCategory().getPetTypeCategory() != null
                                ? product.getCategory().getPetTypeCategory().getPetTypeId()
                                : null)
                        .build())
                .seller(ProductSellerDto.builder()
                        .userId(product.getSeller().getUserId())
                        .nickname(product.getSeller().getNickname())
                        .region(product.getSeller().getRegion())
                        .build())
                .images(images)
                .tags(tagNames)

                // ===== [CHG] 여기부터 추가 =====
                .buyerId(buyerId)                            // [CHG]
                .buyerNickname(buyerNickname)                // [CHG]
                .soldAt(product.getSoldAt())                 // [CHG]
                .sellerConfirmedAt(product.getSellerConfirmedAt()) // [CHG]
                .buyerConfirmedAt(product.getBuyerConfirmedAt())   // [CHG]
                // ===== [CHG] 추가 끝 =====
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ProductListResponseDto> getProductList(
            Pageable pageable,
            Integer categoryId,
            String keyword,
            String status,
            Long sellerId,
            UserDetails userDetails
    ) {
        Page<ProductInfo> productPage;
        if (categoryId != null) {
            productPage = productInfoRepository.findAllByCategory_CategoryIdAndIsDeletedFalse(categoryId, pageable);
        } else if (sellerId != null && status != null && !status.isBlank()) {
            productPage = productInfoRepository.findAllBySeller_UserIdAndStatusAndIsDeletedFalse(sellerId, status, pageable);
        } else if (keyword != null && !keyword.isBlank()) {
            productPage = productInfoRepository.searchByTitleOrTag(keyword.trim(), pageable);
        } else if (status != null) {
            productPage = productInfoRepository.findAllByStatusAndIsDeletedFalse(status, pageable);
        } else {
            productPage = productInfoRepository.findAllByIsDeletedFalse(pageable);
        }

        UserInfo currentUser = (userDetails != null) ? getUser(userDetails) : null;

        return productPage.map(product -> {
            // 썸네일
            String thumbnailUrl = null;
            ProductImage thumbnail = productImageRepository.findByProduct_ProductIdAndIsThumbnailTrue(product.getProductId());
            if (thumbnail != null) thumbnailUrl = thumbnail.getImageUrl();

            // 로그인 유저의 찜 여부
            boolean isLiked = false;
            if (currentUser != null) {
                isLiked = productLikeRepository.findByUserInfoAndProduct(currentUser, product).isPresent();
            }

            // 태그명 목록
            List<String> tagNames = new ArrayList<>();
            productTagRelationRepository.findAllByProduct_ProductId(product.getProductId())
                    .forEach(rel -> tagNames.add(rel.getTag().getTagName()));

            // [CHG] 목록에도 최소 정보(buyerId, soldAt) 매핑
            Long buyerId = (product.getBuyer() != null ? product.getBuyer().getUserId() : null); // [CHG]

            return ProductListResponseDto.builder()
                    .productId(product.getProductId())
                    .title(product.getTitle())
                    .price(product.getPrice())
                    .thumbnailUrl(thumbnailUrl)
                    .conditionStatus(product.getConditionStatus())
                    .addr(product.getAddr())
                    // .tradeLocation(product.getTradeLocation()) // [OPT] 엔티티에 있으면 주석 해제
                    .status(product.getStatus())
                    .viewCount(product.getViewCount())
                    .isLiked(isLiked)
                    .category(ProductCategoryDto.builder()
                            .categoryId(product.getCategory().getCategoryId())
                            .categoryName(product.getCategory().getCategoryName())
                            .parentCategoryId(product.getCategory().getParentCategory() != null
                                    ? product.getCategory().getParentCategory().getCategoryId()
                                    : null)
                            .petTypeId(product.getCategory().getPetTypeCategory() != null
                                    ? product.getCategory().getPetTypeCategory().getPetTypeId()
                                    : null)
                            .build())
                    .seller(ProductSellerDto.builder()
                            .userId(product.getSeller().getUserId())
                            .nickname(product.getSeller().getNickname())
                            .region(product.getSeller().getRegion())
                            .build())
                    .tags(tagNames)

                    // ===== [CHG] 여기부터 추가 =====
                    .buyerId(buyerId)                 // [CHG]
                    .soldAt(product.getSoldAt())      // [CHG]
                    // ===== [CHG] 추가 끝 =====
                    .build();
        });
    }

    /** 개별 이미지 삭제: DB에서 지우고, 삭제한 파일명을 반환(컨트롤러가 물리 삭제) */
    @Transactional
    @Override
    public String deleteImageAndReturnFileName(Long imageId, Long userId) {
        UserInfo user = getUser(userId);

        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("이미지 없음"));
        ProductInfo product = image.getProduct();

        if (!product.getSeller().getUserId().equals(user.getUserId()) && !hasRole(user, UserRole.ADMIN)) {
            throw new SecurityException("삭제 권한 없음");
        }
        String fileName = image.getImageUrl();
        productImageRepository.delete(image);
        return fileName;
    }

    /** 찜/좋아요 토글 */
    @Transactional
    @Override
    public ProductLikeResponseDto toggleLike(Long productId, UserDetails userDetails) {
        // 현재 로그인 사용자 엔티티
        UserInfo user = getUser(userDetails);

        // 상품 조회
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        // ★ 추가: 삭제된 상품은 찜 불가
        if (product.isDeleted()) {
            throw new IllegalArgumentException("삭제된 상품입니다.");
        }

        // [ADD] SOLD 상품은 찜/해제 불가(UX 일관성)
        if ("SOLD".equalsIgnoreCase(product.getStatus())) {            // [ADD]
            Long cntLong = productLikeRepository.countByProduct(product); // [ADD]
            int likeCnt = (cntLong == null) ? 0 : Math.toIntExact(cntLong); // [ADD]
            return ProductLikeResponseDto.builder()                    // 예외 대신 현 상태 그대로 반환
                    .productId(productId)
                    .liked(false)
                    .likeCount(likeCnt)                                // [CHG]
                    .build();
        }

        // 유저-상품 조합으로 기존 찜 레코드 조회
        Optional<ProductLike> existing = productLikeRepository.findByUserInfoAndProduct(user, product);

        final boolean liked;
        if (existing.isPresent()) {
            // 이미 찜한 상태 → 취소
            productLikeRepository.delete(existing.get());
            liked = false;
        } else {
            // 아직 안 찜함 → 새로 찜
            ProductLike like = ProductLike.builder()
                    .userInfo(user)
                    .product(product)
                    .likedAt(LocalDateTime.now())
                    .build();
            productLikeRepository.save(like);
            liked = true;
        }

        // 현재 찜 개수 (Long → int 안전 변환)
        Long cntLong = productLikeRepository.countByProduct(product);      // [ADD]
        int likeCnt = (cntLong == null) ? 0 : Math.toIntExact(cntLong);    // [ADD]

        return ProductLikeResponseDto.builder()
                .productId(productId)
                .liked(liked)
                .likeCount(likeCnt)                                        // [CHG]
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public Page<ProductListResponseDto> getLikedProducts(Pageable pageable, UserDetails userDetails) {
        UserInfo currentUser = getUser(userDetails);
        // ★ 변경전
        // Page<ProductLike> likesPage =
        //        productLikeRepository.findAllByUserInfo_UserId(currentUser.getUserId(), pageable);

        // ★ 변경후: 삭제된 상품 제외
        Page<ProductLike> likesPage =
                productLikeRepository.findAllByUserInfo_UserIdAndProduct_IsDeletedFalse(
                        currentUser.getUserId(), pageable);

        // ProductListResponseDto로 매핑 (getProductList와 동일한 규칙)
        return likesPage.map(like -> {
            ProductInfo product = like.getProduct();

            // 썸네일
            String thumbnailUrl = null;
            ProductImage thumbnail =
                    productImageRepository.findByProduct_ProductIdAndIsThumbnailTrue(product.getProductId());
            if (thumbnail != null) thumbnailUrl = thumbnail.getImageUrl();

            // 태그명
            java.util.List<String> tagNames = new java.util.ArrayList<>();
            productTagRelationRepository.findAllByProduct_ProductId(product.getProductId())
                    .forEach(rel -> tagNames.add(rel.getTag().getTagName()));

            // [CHG] 일관성: 찜 목록에서도 buyerId/soldAt 매핑
            Long buyerId = (product.getBuyer() != null ? product.getBuyer().getUserId() : null); // [CHG]

            return ProductListResponseDto.builder()
                    .productId(product.getProductId())
                    .title(product.getTitle())
                    .price(product.getPrice())
                    .thumbnailUrl(thumbnailUrl)
                    .conditionStatus(product.getConditionStatus())
                    .addr(product.getAddr())
                    // .tradeLocation(product.getTradeLocation()) // [OPT] 엔티티에 있으면 주석 해제
                    .status(product.getStatus())
                    .viewCount(product.getViewCount())
                    .isLiked(true) // 내 찜 목록이므로 항상 true
                    .category(ProductCategoryDto.builder()
                            .categoryId(product.getCategory().getCategoryId())
                            .categoryName(product.getCategory().getCategoryName())
                            .parentCategoryId(product.getCategory().getParentCategory() != null
                                    ? product.getCategory().getParentCategory().getCategoryId() : null)
                            .petTypeId(product.getCategory().getPetTypeCategory() != null
                                    ? product.getCategory().getPetTypeCategory().getPetTypeId() : null)
                            .build())
                    .seller(ProductSellerDto.builder()
                            .userId(product.getSeller().getUserId())
                            .nickname(product.getSeller().getNickname())
                            .region(product.getSeller().getRegion())
                            .build())
                    .tags(tagNames)

                    // ===== [CHG] 여기부터 추가 =====
                    .buyerId(buyerId)                 // [CHG]
                    .soldAt(product.getSoldAt())      // [CHG]
                    // ===== [CHG] 추가 끝 =====
                    .build();
        });
    }

    // =====================================================================
    // ============================ [ADD] 신규 메서드 ========================
    // =====================================================================

    /** [ADD] 판매자가 '판매 완료' 처리 (buyer 지정 + 상태/타임스탬프 세팅) */
    @Transactional
    @Override
    public void markSold(Long productId, ProductSellRequestDto dto, UserDetails sellerDetails) {
        UserInfo seller = getUser(sellerDetails);
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        boolean isOwner = product.getSeller().getUserId().equals(seller.getUserId());
        boolean isAdmin = hasRole(seller, UserRole.ADMIN);
        if (!isOwner && !isAdmin) throw new SecurityException("권한 없음");

        // ★ 구매자 식별 절차 제거 (dto 무시)
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        // 판매자 확인만 기록
        if (product.getSellerConfirmedAt() == null) {
            product.setSellerConfirmedAt(now);
        }

        // ★ 양측 확인이 모두 끝났다면 이 시점에서 SOLD 전환
        if (product.getBuyerConfirmedAt() != null) {
            product.setStatus("SOLD");
            if (product.getSoldAt() == null) product.setSoldAt(now);
            productLikeRepository.deleteByProduct_ProductId(productId); // 찜 정리
            setTxStatusByProduct(productId, "판매완료"); // ★ 거래 이력도 완료 처리
        }

        productInfoRepository.save(product);
    }

    /** [ADD] 구매자가 '구매 완료' 확정 (buyerConfirmedAt 기록) */
    @Transactional
    @Override
    public void confirmPurchase(Long productId, UserDetails buyerDetails) {
        UserInfo buyer = getUser(buyerDetails);
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        // 판매자는 본인 상품에 구매완료 불가
        if (product.getSeller().getUserId().equals(buyer.getUserId())) {
            throw new IllegalArgumentException("본인 상품은 구매 완료 처리 불가");
        }

        // ★ buyer 확정 (미지정 시 현재 사용자로)
        if (product.getBuyer() == null) {
            product.setBuyer(buyer);
        } else if (!product.getBuyer().getUserId().equals(buyer.getUserId())) {
            // 이미 다른 유저로 확정된 경우
            throw new IllegalArgumentException("이미 다른 구매자가 확정되었습니다.");
        }

        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        if (product.getBuyerConfirmedAt() == null) {
            product.setBuyerConfirmedAt(now);
        }

        // ★ 양측 모두 확인되면 이 시점에 SOLD
        if (product.getSellerConfirmedAt() != null) {
            product.setStatus("SOLD");
            if (product.getSoldAt() == null) product.setSoldAt(now);
            productLikeRepository.deleteByProduct_ProductId(productId); // 찜 정리
            setTxStatusByProduct(productId, "판매완료"); // ★ 거래 이력도 완료 처리
        }

        productInfoRepository.save(product);
    }

    /** [ADD] 내 구매 내역(Page) */
    @Transactional(readOnly = true)
    @Override
    public Page<ProductListResponseDto> getPurchasedProducts(Pageable pageable, UserDetails buyerDetails) {
        UserInfo buyer = getUser(buyerDetails);

        // [CHG] 삭제된 상품도 구매 내역에는 남겨야 하므로 isDeleted 조건 제거된 쿼리 사용
        Page<ProductInfo> page = productInfoRepository
                // .findAllByBuyer_UserIdAndBuyerConfirmedAtIsNotNullAndSellerConfirmedAtIsNotNullAndIsDeletedFalse(  // [OLD] ❌
                .findAllByBuyer_UserIdAndBuyerConfirmedAtIsNotNullAndSellerConfirmedAtIsNotNull(                     // [NEW] ✅
                        buyer.getUserId(), pageable);

        // getProductList/getLikedProducts와 동일 규칙으로 매핑
        return page.map(product -> {
            // 썸네일
            String thumbnailUrl = null;
            ProductImage thumbnail =
                    productImageRepository.findByProduct_ProductIdAndIsThumbnailTrue(product.getProductId());
            if (thumbnail != null) thumbnailUrl = thumbnail.getImageUrl();

            // 태그명
            List<String> tagNames = new ArrayList<>();
            productTagRelationRepository.findAllByProduct_ProductId(product.getProductId())
                    .forEach(rel -> tagNames.add(rel.getTag().getTagName()));

            // 내가 찜했는지
            boolean isLiked = productLikeRepository.findByUserInfoAndProduct(buyer, product).isPresent();

            // [CHG] 구매 내역도 buyerId/soldAt 매핑
            Long buyerId = (product.getBuyer() != null ? product.getBuyer().getUserId() : null); // [CHG]

            return ProductListResponseDto.builder()
                    .productId(product.getProductId())
                    .title(product.getTitle())
                    .price(product.getPrice())
                    .thumbnailUrl(thumbnailUrl)
                    .conditionStatus(product.getConditionStatus())
                    .addr(product.getAddr())
                    // .tradeLocation(product.getTradeLocation()) // [OPT] 엔티티에 있으면 주석 해제
                    .status(product.getStatus())
                    .viewCount(product.getViewCount())
                    .isLiked(isLiked)
                    .category(ProductCategoryDto.builder()
                            .categoryId(product.getCategory().getCategoryId())
                            .categoryName(product.getCategory().getCategoryName())
                            .parentCategoryId(product.getCategory().getParentCategory() != null
                                    ? product.getCategory().getParentCategory().getCategoryId() : null)
                            .petTypeId(product.getCategory().getPetTypeCategory() != null
                                    ? product.getCategory().getPetTypeCategory().getPetTypeId() : null)
                            .build())
                    .seller(ProductSellerDto.builder()
                            .userId(product.getSeller().getUserId())
                            .nickname(product.getSeller().getNickname())
                            .region(product.getSeller().getRegion())
                            .build())
                    .tags(tagNames)

                    // ===== [CHG] 여기부터 추가 =====
                    .buyerId(buyerId)                 // [CHG]
                    .soldAt(product.getSoldAt())      // [CHG]
                    // ===== [CHG] 추가 끝 =====
                    .build();
        });
    }
    // ========================== [/ADD] 신규 메서드 끝 =======================

    /** [ADD] 판매자가 누른 '판매완료' 취소 */
    @Transactional
    @Override
    public void cancelSellerConfirm(Long productId, UserDetails sellerDetails) {
        UserInfo seller = getUser(sellerDetails);
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        boolean isOwner = product.getSeller().getUserId().equals(seller.getUserId());
        boolean isAdmin = hasRole(seller, UserRole.ADMIN);
        if (!isOwner && !isAdmin) throw new SecurityException("권한 없음");

        // 최종 완료는 취소 불가
        if ("SOLD".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("이미 거래가 완료된 상품입니다.");
        }

        // 판매자 확인만 되돌림
        product.setSellerConfirmedAt(null);

        // SOLD가 아니므로 soldAt은 의미 없음 → 방어적으로 비움
        product.setSoldAt(null);

        // 거래 이력도 예약중으로 복귀
        setTxStatusByProduct(productId, "예약중");
    }

    /** [ADD] 구매자가 누른 '구매완료' 취소 */
    @Transactional
    @Override
    public void cancelBuyerConfirm(Long productId, UserDetails buyerDetails) {
        UserInfo me = getUser(buyerDetails);
        ProductInfo product = productInfoRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("상품 없음"));

        boolean isAdmin = hasRole(me, UserRole.ADMIN);

        // 최종 완료는 취소 불가
        if ("SOLD".equalsIgnoreCase(product.getStatus())) {
            throw new IllegalStateException("이미 거래가 완료된 상품입니다.");
        }

        // 구매자 본인(또는 관리자)만 취소 가능
        if (product.getBuyer() == null) {
            throw new IllegalStateException("구매 확정된 사용자가 없습니다.");
        }
        boolean isBuyerSelf = product.getBuyer().getUserId().equals(me.getUserId());
        if (!isBuyerSelf && !isAdmin) {
            throw new SecurityException("구매자 본인만 취소할 수 있습니다.");
        }

        // 구매자 확인/배정 되돌림 → 다른 사용자가 다시 구매완료 할 수 있게
        product.setBuyerConfirmedAt(null);
        product.setBuyer(null);

        // 거래 이력도 예약중으로 복귀
        setTxStatusByProduct(productId, "예약중");
    }
}
