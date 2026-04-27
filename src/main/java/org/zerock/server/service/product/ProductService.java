package org.zerock.server.service.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.zerock.server.dto.product.*;
import org.springframework.security.core.userdetails.UserDetails;

public interface ProductService {

    // 컨트롤러에서 파일 저장 후 파일명 목록이 DTO에 담겨옴
    Long registerProduct(ProductRegisterRequestDto dto, Long userId);

    // 마찬가지로 DTO.uploadFileNames = 최종 파일명 목록
    void updateProduct(Long productId, ProductUpdateRequestDto dto, Long userId);

    // soft delete
    void deleteProduct(Long productId, Long userId);

    void markSold(Long productId, ProductSellRequestDto dto, UserDetails seller);
    void confirmPurchase(Long productId, UserDetails buyer);
    Page<ProductListResponseDto> getPurchasedProducts(Pageable pageable, UserDetails buyer);


    // 기존 그대로 유지 (다른 곳도 쓸 수 있어서)
    ProductDetailResponseDto getProductDetail(Long productId, UserDetails userDetails);

    Page<ProductListResponseDto> getProductList(Pageable pageable,
                                                Integer categoryId,
                                                String keyword,
                                                String status,
                                                Long sellerId,
                                                UserDetails userDetails);

    ProductLikeResponseDto toggleLike(Long productId, UserDetails userDetails);

    Page<ProductListResponseDto> getLikedProducts(Pageable pageable, UserDetails userDetails);

    // 컨트롤러에서 실제 파일을 지울 수 있도록, 삭제된 파일명을 반환
    String deleteImageAndReturnFileName(Long imageId, Long userId);

    /** [ADD] 판매자 '판매완료' 취소 */
    void cancelSellerConfirm(Long productId, UserDetails sellerDetails);

    /** [ADD] 구매자 '구매완료' 취소 */
    void cancelBuyerConfirm(Long productId, UserDetails buyerDetails);


}
