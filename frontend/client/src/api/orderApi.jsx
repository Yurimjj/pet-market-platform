// client/src/api/orderApi.jsx
// -----------------------------------------------------------------------------
// 주문/거래 API 유틸
//  - 거래 등록
//  - 내 활성 거래 여부
//  - [ADD] 내 "예약 중" 목록(구매자/판매자)
//  - 서버 응답은 프로젝트 표준 리스트 포맷으로 정규화
// -----------------------------------------------------------------------------

import jwtAxios from "../util/JWTUtil";
import { API_SERVER_HOST } from "./UserApi";

const ordersHost = `${API_SERVER_HOST}/api/orders`;
const productsHost = `${API_SERVER_HOST}/api/products`;

/**
 * 거래(주문) 등록
 * POST /api/orders
 */
// [CHG] registerTransaction: seller가 지정하는 플로우 지원
export async function registerTransaction({ productId, finalPrice, buyerId }) {
  const { data } = await jwtAxios.post(`/orders`, {
    productId,
    finalPrice,
    ...(buyerId ? { buyerId } : {}),
  });
  return data; // transactionId
}

/**
 * 이 상품에 대해 "나"의 활성 거래가 있는지
 * GET /api/orders/transactions/active/me?productId=...
 * 반환: { active: boolean }
 */
export const hasActiveTransaction = async (productId) => {
  const { data } = await jwtAxios.get(`${ordersHost}/transactions/active/me`, {
    params: { productId: Number(productId) },
  });
  return !!data?.active;
};

/* =============================================================================
 * [ADD] 내 "예약 중" 목록 (구매자/판매자)
 *   GET /api/orders/reserved?role=buyer|seller
 *   - Pageable 0-base 주의: page -> page-1
 *   - 응답을 화면 공용 포맷으로 normalize
 * ===========================================================================*/

/**
 * 내가 '구매자'로 참여 중인 예약 목록
 */
export const listMyReservedAsBuyer = async ({
  page = 1,
  size = 6,
  sort = "productId,desc",
} = {}) => {
  const params = new URLSearchParams();
  params.set("role", "buyer");
  params.set("page", String(page - 1)); // Spring Pageable is 0-based
  params.set("size", String(size));
  params.set("sort", sort);

  const { data } = await jwtAxios.get(`${ordersHost}/reserved`, { params });
  return normalizeProductPage(data);
};

/**
 * 내가 '판매자'로 참여 중인 예약 목록
 */
export const listMyReservedAsSeller = async ({
  page = 1,
  size = 6,
  sort = "productId,desc",
} = {}) => {
  const params = new URLSearchParams();
  params.set("role", "seller");
  params.set("page", String(page - 1)); // Spring Pageable is 0-based
  params.set("size", String(size));
  params.set("sort", sort);

  const { data } = await jwtAxios.get(`${ordersHost}/reserved`, { params });
  return normalizeProductPage(data);
};

/* =============================================================================
 * 공통 유틸: 서버 페이지 응답 → 프론트 표준 리스트 포맷으로 맞추기
 *  - items / pageInfo 를 우선 사용
 *  - content, list 등도 함께 제공(기존 컴포넌트 호환)
 *  - thumbnailUrl이 파일명일 경우 /api/products/view/{fileName}로 정규화
 * ===========================================================================*/

const toViewUrl = (fileName) =>
  fileName
    ? `${productsHost}/view/${encodeURIComponent(fileName)}`
    : "/no_image.png";

const normalizeProductPage = (data) => {
  // Page<T> 표준 응답 가정
  const content = data?.content ?? data?.items ?? data?.dtoList ?? [];
  const totalPages = data?.totalPages ?? 0;
  const zeroBased = data?.number ?? 0;
  const number = zeroBased + 1;
  const last = data?.last ?? number >= totalPages;
  const first = data?.first ?? number <= 1;

  // 썸네일 정규화 (파일명 -> 뷰 URL)
  const items = content.map((it) => ({
    ...it,
    thumbnailUrl: toViewUrl(it.thumbnailUrl ?? it.fileName ?? it.thumbnail),
  }));

  const pageInfo = {
    page: number,
    prev: !first,
    next: !last,
    prevPage: Math.max(1, number - 1),
    nextPage: totalPages ? Math.min(totalPages, number + 1) : number,
    size: data?.size ?? items.length,
    totalPages,
    totalElements: data?.totalElements ?? items.length,
    first,
    last,
  };

  // 기존 컴포넌트 하위호환 필드도 함께 반환
  return {
    items,
    pageInfo,
    content: items,
    list: items,
    totalPages,
    number: zeroBased,
    first,
    last,
  };
};
