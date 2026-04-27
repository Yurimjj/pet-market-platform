package org.zerock.server.controller.product;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.zerock.server.domain.product.ProductLike;
import org.zerock.server.domain.user.UserInfo;
import org.zerock.server.dto.product.*;
import org.zerock.server.dto.user.UserInfoDTO;
import org.zerock.server.service.product.ProductService;
import org.zerock.server.util.CustomFileUtil;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;
    private final CustomFileUtil customFileUtil;

    /**
     * 파일 보기 (선택기능, 선생님 스타일)
     */
    @GetMapping("/view/{fileName:.+}") // .+ 패턴으로 확장자 포함 허용
    public ResponseEntity<Resource> viewFile(@PathVariable String fileName) {
        return customFileUtil.getFile(fileName);
    }

    /**
     * 상품 등록: RequestPart 제거, 컨트롤러에서 파일 저장 후 DTO에 파일명 주입
     */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Long> registerProduct(
            @ModelAttribute ProductRegisterRequestDto dto,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserInfoDTO user // 현재 로그인 사용자
    ) {
        // 1) 실제 파일 저장 → 저장된 파일명 목록 획득
        List<String> uploadFileNames = (images != null && !images.isEmpty())
                ? customFileUtil.saveFiles(images)
                : Collections.emptyList();

        // 2) DTO에 파일명 세팅
        dto.setUploadFileNames(uploadFileNames);

        // 3) 서비스 호출(DB 등록) — DB는 파일명만 저장
        Long productId = productService.registerProduct(dto, user != null ? user.getUserId() : null);

        // (선생님 예시처럼 딜레이가 필요하면 쓰세요)
        // try { Thread.sleep(2000); } catch (InterruptedException ignored) {}

        return ResponseEntity.ok(productId);
    }

    /**
     * 상품 수정: 컨트롤러에서 "최종 파일 목록"을 만들어 서비스에 전달 + 삭제할 파일은 여기서 실제 삭제
     */
    @PutMapping(
            value = "/{productId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Void> updateProduct(
            @PathVariable Long productId,
            @ModelAttribute ProductUpdateRequestDto dto,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        // 1) 새로 업로드된 파일 저장
        List<String> newlyUploaded = (images != null && !images.isEmpty())
                ? customFileUtil.saveFiles(images)
                : Collections.emptyList();

        // 2) 클라이언트가 유지하겠다고 보낸 기존 파일명들 + 새로 업로드된 파일명 → 최종 목록 구성
        List<String> finalUploaded = new ArrayList<>();
        if (dto.getUploadFileNames() != null) {
            finalUploaded.addAll(dto.getUploadFileNames());
        }
        finalUploaded.addAll(newlyUploaded);
        dto.setUploadFileNames(finalUploaded);

        // 3) 기존 DB에 있던 파일명 목록
        ProductDetailResponseDto old = productService.getProductDetail(productId, user);
        List<String> oldFileNames = old.getImages().stream()
                .map(ProductImageDto::getImageUrl) // imageUrl에 "파일명"을 넣도록 서비스에서 관리
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // 4) 최종 목록에 없는 파일 = 물리파일 삭제 대상
        Set<String> finalSet = new HashSet<>(finalUploaded);
        List<String> removeFiles = oldFileNames.stream()
                .filter(fn -> !finalSet.contains(fn))
                .collect(Collectors.toList());

        // 5) 서비스 호출(DB 갱신)
        productService.updateProduct(productId, dto, user != null ? user.getUserId() : null);

        // 6) 실제 파일 삭제
        if (!removeFiles.isEmpty()) {
            customFileUtil.deleteFiles(removeFiles);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * 상품 삭제: 서비스(DB → 삭제 플래그) 후, 컨트롤러에서 실제 파일 삭제
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        // 삭제 전, 현재 연결된 파일명 확보
        ProductDetailResponseDto old = productService.getProductDetail(productId, user);
        List<String> oldFileNames = old.getImages().stream()
                .map(ProductImageDto::getImageUrl)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // DB 삭제(soft delete)
        productService.deleteProduct(productId, user != null ? user.getUserId() : null);

        // 물리 파일 삭제
        if (!oldFileNames.isEmpty()) {
            customFileUtil.deleteFiles(oldFileNames);
        }
        return ResponseEntity.ok().build();
    }

    /**
     * 상품 상세
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetailResponseDto> getProductDetail(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        return ResponseEntity.ok(productService.getProductDetail(productId, user));
    }

    /**
     * 상품 목록 (네가 쓰던 Pageable 그대로 유지)
     */
    @GetMapping
    public ResponseEntity<Page<ProductListResponseDto>> getProductList(
            Pageable pageable,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long sellerId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        Page<ProductListResponseDto> page = productService.getProductList(pageable, categoryId, keyword, status, sellerId, user);
        return ResponseEntity.ok(page);
    }

    /**
     * 상품 찜/좋아요 (그대로 유지)
     */
    @PostMapping("/{productId}/like")
    public ResponseEntity<ProductLikeResponseDto> toggleLike(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        ProductLikeResponseDto result = productService.toggleLike(productId, user);
        return ResponseEntity.ok(result);
    }

    /** 내가 찜한 상품 목록 (페이지네이션) */
    @GetMapping("/likes")
    public ResponseEntity<Page<ProductListResponseDto>> getMyLikes(
            Pageable pageable,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        return ResponseEntity.ok(productService.getLikedProducts(pageable, user));
    }

    /**
     * 상품 이미지 개별 삭제: DB 먼저 삭제 → 컨트롤러에서 실제 파일 삭제
     */
    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable Long imageId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        // DB에서 삭제 후, 삭제된 파일명을 돌려받아 물리삭제
        String removedFileName = productService.deleteImageAndReturnFileName(imageId, user != null ? user.getUserId() : null);
        if (removedFileName != null) {
            customFileUtil.deleteFiles(Collections.singletonList(removedFileName));
        }
        return ResponseEntity.ok().build();
    }

    // 판매자가 '판매 완료' (buyer 지정)
    @PostMapping("/{productId}/sell")
    public ResponseEntity<Void> markSold(
            @PathVariable Long productId,
            @RequestBody(required = false) ProductSellRequestDto dto, // ★ 본문 선택
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        productService.markSold(productId, dto, user); // ★ 시그니처 그대로
        return ResponseEntity.ok().build();
    }

    // 구매자가 '구매 완료' 확인
    @PostMapping("/{productId}/purchase/confirm")
    public ResponseEntity<Void> confirmPurchase(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        productService.confirmPurchase(productId, user);
        return ResponseEntity.ok().build();
    }

    // 내 구매 내역(페이징)
    @GetMapping("/purchases")
    public ResponseEntity<Page<ProductListResponseDto>> getMyPurchases(
            Pageable pageable,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        return ResponseEntity.ok(productService.getPurchasedProducts(pageable, user));
    }

    // [ADD] 판매자가 누른 '판매완료' 취소
    @PostMapping("/{productId}/sell/cancel")
    public ResponseEntity<Void> cancelSellerConfirm(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        productService.cancelSellerConfirm(productId, user);
        return ResponseEntity.ok().build();
    }

    // [ADD] 구매자가 누른 '구매완료' 취소
    @PostMapping("/{productId}/purchase/cancel")
    public ResponseEntity<Void> cancelBuyerConfirm(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserInfoDTO user
    ) {
        productService.cancelBuyerConfirm(productId, user);
        return ResponseEntity.ok().build();
    }

}
