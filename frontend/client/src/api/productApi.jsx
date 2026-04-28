// client/src/api/productApi.jsx
// -----------------------------------------------------------------------------
// 상품 API 유틸 (이미지 URL 정규화 + 목록/상세 + 등록/수정/삭제 + 상태변경)
// -----------------------------------------------------------------------------

import axios from "axios";
import jwtAxios from "../util/JWTUtil";
import { API_SERVER_HOST } from "./UserApi";
import { getCookie } from "../util/CookieUtil"; // JWTUtil은 그대로, 이 API에서만 우회

const host = `${API_SERVER_HOST}/api/products`;
const catHost = `${API_SERVER_HOST}/api/product-categories`;

// 로컬 플레이스홀더
const DEFAULT_IMG = "/no_image.png";

/** 파일명 -> 서버 이미지 뷰 URL */
export const getImageUrl = (fileName) =>
  fileName ? `${host}/view/${encodeURIComponent(fileName)}` : DEFAULT_IMG;

/** URL/파일명 정규화 (UI 표시용) */
const toViewUrl = (maybeName) => {
  if (!maybeName) return DEFAULT_IMG;
  const v = String(maybeName).trim();

  // 절대/데이터 URL이면 그대로
  if (/^(https?:)?\/\//i.test(v) || /^data:/.test(v)) return v;

  // 플레이스홀더 파일명
  if (/no[-_]?image\.png$/i.test(v)) return DEFAULT_IMG;

  // 루트 경로 정적 파일
  if (v.startsWith("/")) return v;

  // 파일명 → 서버 뷰 엔드포인트
  return getImageUrl(v);
};

/** 카테고리 전체 조회 */
export const listCategories = async () => {
  const { data } = await axios.get(catHost);
  return data;
};

/** 목록 조회 (Spring Page → {items, pageInfo}) */
export const listProducts = async (params = {}) => {
  const page = Number(params.page || 1);
  const size = Number(params.size || 12);

  const qs = new URLSearchParams();
  qs.set("page", String(page - 1)); // Spring Pageable 0-base
  qs.set("size", String(size));
  if (params.categoryId != null)
    qs.set("categoryId", String(params.categoryId));
  if (params.keyword) qs.set("keyword", params.keyword);
  if (params.status) qs.set("status", params.status);
  if (params.sellerId != null) qs.set("sellerId", String(params.sellerId));
  // 기본 정렬: 최신(id 내림차순) → 좌상단에 최신 상품
  if (params.sort) qs.set("sort", params.sort);
  else qs.set("sort", "productId,desc");

  const { data } = await axios.get(`${host}?${qs.toString()}`);

  const content = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const number = (data?.number ?? 0) + 1;
  const last = data?.last ?? number >= totalPages;
  const first = data?.first ?? number <= 1;

  // 썸네일 URL 정규화 + [ADD] seller 정규화(닉네임 보장)
  const items = content.map((it) => ({
    ...it,
    // [CHG] 썸네일이 없으면 첫 이미지/파일명으로 보강
    thumbnailUrl: toViewUrl(
      it.thumbnailUrl ||
        it.images?.[0]?.imageUrl ||
        (Array.isArray(it.uploadFileNames) ? it.uploadFileNames[0] : "")
    ),
    // [ADD] 어디서 오든 항상 item.seller.nickname을 사용할 수 있게 보장
    seller: it.seller || {
      userId: it.sellerId,
      nickname: it.sellerNickname,
      region: it.region,
    },
  }));

  const pageInfo = {
    page: number,
    prev: !first,
    next: !last,
    prevPage: Math.max(1, number - 1),
    nextPage: Math.min(totalPages, number + 1),
    pageNumList: Array.from({ length: totalPages }, (_, i) => i + 1),
  };

  return {
    items,
    pageInfo,
    content: items,
    list: items,
    serverData: pageInfo,
    totalPages,
    number,
    first,
    last,
  };
};

/** 단건 조회 (images/thumbnailUrl 정규화) */
export const getProduct = async (productId) => {
  const { data } = await jwtAxios.get(`/products/${productId}`);

  // 서버가 images 또는 uploadFileNames 로 줄 수 있음 → 통합 처리
  let raw = [];
  if (Array.isArray(data.images)) raw = data.images;
  else if (Array.isArray(data.uploadFileNames))
    raw = data.uploadFileNames.map((fn) => ({ imageUrl: fn }));

  const images = raw.map((img) => {
    if (typeof img === "string") {
      return { imageUrl: toViewUrl(img) };
    }
    return { ...img, imageUrl: toViewUrl(img.imageUrl || img.fileName || "") };
  });

  // ★ liked(서버 직렬화) ↔ isLiked(컴포넌트 기대치) 통일
  const likedFlag =
    typeof data.isLiked === "boolean"
      ? data.isLiked
      : typeof data.liked === "boolean"
      ? data.liked
      : false;

  return {
    ...data,
    images,
    // [CHG] 썸네일 보강
    thumbnailUrl: toViewUrl(
      data.thumbnailUrl ||
        images?.[0]?.imageUrl ||
        (Array.isArray(data.uploadFileNames) ? data.uploadFileNames[0] : "")
    ),
    isLiked: likedFlag, // 컴포넌트는 이것만 사용하면 됨
    // [ADD] 상세에서도 seller 객체 보장 (닉네임 일관 접근)
    seller: data.seller || {
      userId: data.sellerId,
      nickname: data.sellerNickname,
      region: data.region,
    },
  };
};

/** Form 객체 → FormData (ModelAttribute 매핑) */
const buildFormData = (form = {}, images = [], keepFileNames = []) => {
  const fd = new FormData();

  // content → description 자동 매핑(중복 방지)
  const normalized = { ...form };
  if (normalized.content != null && normalized.description == null) {
    normalized.description = normalized.content;
    delete normalized.content;
  }

  // 1) 기본 필드
  Object.entries(normalized).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (Array.isArray(v)) v.forEach((vv) => fd.append(k, vv));
    else fd.append(k, v);
  });

  // 2) 기존 유지 파일명 → uploadFileNames[]
  (keepFileNames || []).forEach((name) => {
    const n = String(name || "").trim();
    if (!n || /no[-_]?image\.png$/i.test(n)) return;
    fd.append("uploadFileNames", n);
  });

  // 3) 새 이미지 → images[]
  (images || []).forEach((file) => file && fd.append("images", file));

  return fd;
};

/** 뷰 URL/파일명 → 파일명만 추출 */
const extractFileName = (urlOrName) => {
  if (!urlOrName) return urlOrName;
  try {
    const u = String(urlOrName);
    if (!u.includes("/")) return u;
    return decodeURIComponent(u.split("/").pop());
  } catch {
    return String(urlOrName).split("/").pop();
  }
};

/** 등록 (jwt 필요) */
export const addProduct = async (form, images = []) => {
  const fd = buildFormData(form, images);
  const headers = { headers: { "Content-Type": "multipart/form-data" } };
  const { data } = await jwtAxios.post(`/products`, fd, headers);
  return data; // 생성된 productId
};

/**
 * 수정 (jwt 필요)
 * 4번째 인자는 다음 둘 중 하나:
 *  - string[] : keepFileNames (명시적 유지 목록)
 *  - { keepFileNames?, removeFileNames?, keepAllExisting? = true } : 옵션 객체
 */
export const updateProduct = async (
  productId,
  form = {},
  images = [],
  optsOrKeep
) => {
  let options = Array.isArray(optsOrKeep)
    ? { keepFileNames: optsOrKeep }
    : optsOrKeep || {};

  const { keepFileNames, removeFileNames, keepAllExisting = true } = options;

  let keep = keepFileNames;

  if (!keep) {
    // 현재 상세조회로 기존 파일명 목록 확보
    let existing = [];
    try {
      const detail = await getProduct(productId);
      existing = (detail.images || []).map((img) =>
        extractFileName(img.imageUrl)
      );
    } catch {
      existing = [];
    }

    if (Array.isArray(removeFileNames) && removeFileNames.length > 0) {
      const rm = new Set(removeFileNames.map(String));
      keep = existing.filter((fn) => !rm.has(String(fn)));
    } else if (keepAllExisting) {
      keep = existing;
    } else {
      keep = [];
    }
  }

  const fd = buildFormData(form, images, keep);
  const headers = { headers: { "Content-Type": "multipart/form-data" } };
  const { data } = await jwtAxios.put(`/products/${productId}`, fd, headers);
  return data;
};

/** 상태만 빠르게 변경 (기존 이미지는 자동 유지) */
export const updateProductStatus = async (productId, status) => {
  return updateProduct(productId, { status }, [], { keepAllExisting: true });
};

/** 삭제 (jwt 필요) */
export const deleteProduct = async (productId) => {
  const { data } = await jwtAxios.delete(`/products/${productId}`);
  return data;
};

/** 좋아요 토글 (jwt 필요) */
export const toggleLike = async (productId) => {
  const { data } = await jwtAxios.post(`/products/${productId}/like`);
  return data; // { productId, liked, likeCount }
};

/**
 * 내 찜 목록 조회 (jwt 필요)
 * - JWTUtil은 그대로 두고, 이 API에 한해 "직접 Authorization 주입 + 401 시 refresh 1회 재시도"
 * - 추가로 서버 정렬 필드 오류 방지를 위해 sort를 'product.productId,desc'로 전송
 */
export const listMyLikedProducts = async (params = {}) => {
  const page = Number(params.page || 1);
  const size = Number(params.size || 12);

  const qs = new URLSearchParams();
  qs.set("page", String(page - 1)); // Spring Pageable 0-base
  qs.set("size", String(size));

  // [CHG] 정렬 필드: 'productId,desc' → 'product.productId,desc'
  //      (Spring Data가 'productId'를 'product.id'로 오해하는 문제 해결)
  if (params.sort) {
    qs.set("sort", params.sort);
  } else {
    qs.set("sort", "product.productId,desc"); // ★ 핵심 수정
  }

  // 절대 URL (jwtAxios 우회)
  const absUrl = `${API_SERVER_HOST}/api/products/likes?${qs.toString()}`;

  // 쿠키에서 user(access/refresh) 파싱
  let user = getCookie("user");
  if (typeof user === "string") {
    try {
      user = JSON.parse(user);
    } catch {
      /* ignore */
    }
  }
  const accessToken = user?.accessToken;
  const refreshToken = user?.refreshToken;

  const authHeader = accessToken
    ? { Authorization: `Bearer ${accessToken}` }
    : {};

  // 1차: 기존 accessToken으로 요청
  try {
    const { data } = await axios.get(absUrl, { headers: authHeader });
    return normalizeLikedPage(data, size);
  } catch (err) {
    // 401이 아니거나 refreshToken이 없으면 그대로 throw
    if (err?.response?.status !== 401 || !refreshToken) throw err;

    // 2차: refresh로 새 accessToken 받아서 "한 번만" 재시도 (쿠키는 갱신하지 않음)
    try {
      const { data: r } = await axios.get(
        `${API_SERVER_HOST}/api/user/refresh?refreshToken=${encodeURIComponent(
          refreshToken
        )}`,
        { headers: authHeader }
      );
      const newAccess = r?.accessToken;
      if (!newAccess) throw err;

      const { data } = await axios.get(absUrl, {
        headers: { Authorization: `Bearer ${newAccess}` },
      });
      return normalizeLikedPage(data, size);
    } catch {
      throw err;
    }
  }
};

// 내 찜 목록 응답 정규화 유틸 (기존 규칙 유지)
const normalizeLikedPage = (data, fallbackSize) => {
  const content = data.content ?? data.dtoList ?? [];
  const items = content.map((it) => ({
    ...it,
    thumbnailUrl: toViewUrl(it.thumbnailUrl),
  }));

  const pageInfo = {
    page: (data.number ?? 0) + 1,
    size: data.size ?? fallbackSize,
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
    first: !!data.first,
    last: !!data.last,
  };

  return {
    items,
    pageInfo,
    content: items,
    list: items,
    totalPages: pageInfo.totalPages,
    number: pageInfo.page - 1,
    first: pageInfo.first,
    last: pageInfo.last,
  };
};

/** 개별 이미지 삭제 (jwt 필요) */
export const deleteImage = async (imageId) => {
  const { data } = await jwtAxios.delete(`/products/images/${imageId}`);
  return data;
};

// ============================================================================
// =============================== [ADD] 신규 =================================
// ============================================================================

// 변경 (구매자 식별 없음)
export const markProductSold = async ({ productId }) => {
  await jwtAxios.post(`/products/${productId}/sell`, {}); // 또는 바디 없이
};

/** [ADD] 구매자가 '구매 완료' 확정 */
export const confirmPurchase = async (productId) => {
  await jwtAxios.post(`/products/${productId}/purchase/confirm`);
};

/** [ADD] 내 구매 내역(Page) */
export const listMyPurchasedProducts = async (params = {}) => {
  const page = Number(params.page || 1);
  const size = Number(params.size || 12);
  const sort = params.sort || "productId,desc";

  const qs = new URLSearchParams();
  qs.set("page", String(page - 1)); // Spring Pageable 0-base
  qs.set("size", String(size));
  qs.set("sort", sort);

  const { data } = await jwtAxios.get(`/products/purchases?${qs.toString()}`);

  const content = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;
  const number = (data?.number ?? 0) + 1;
  const last = data?.last ?? number >= totalPages;
  const first = data?.first ?? number <= 1;

  const items = content.map((it) => ({
    ...it,
    thumbnailUrl: toViewUrl(it.thumbnailUrl),
  }));

  const pageInfo = {
    page: number,
    prev: !first,
    next: !last,
    prevPage: Math.max(1, number - 1),
    nextPage: Math.min(totalPages, number + 1),
    pageNumList: Array.from({ length: totalPages }, (_, i) => i + 1),
  };

  return {
    items,
    pageInfo,
    content: items,
    list: items,
    serverData: pageInfo,
    totalPages,
    number,
    first,
    last,
  };
};

/**
 * [ADD] 내 판매 내역(Page)
 * - 서버의 공용 목록 API 재사용: status=SOLD & sellerId=나
 * - 호출 측에서 myUserId를 넘겨주는 형태(프로필 탭에서 사용)
 */
export const listMySoldProducts = async ({
  userId,
  page = 1,
  size = 12,
  sort = "productId,desc",
}) => {
  if (!userId) throw new Error("userId가 필요합니다.");
  return await listProducts({
    page,
    size,
    status: "SOLD",
    sellerId: userId,
    sort,
  });
};

// [ADD] 판매자 '판매완료' 취소
export const cancelMarkProductSold = async ({ productId }) => {
  await jwtAxios.post(`/products/${productId}/sell/cancel`);
};

// [ADD] 구매자 '구매완료' 취소
export const cancelConfirmPurchase = async (productId) => {
  await jwtAxios.post(`/products/${productId}/purchase/cancel`);
};
