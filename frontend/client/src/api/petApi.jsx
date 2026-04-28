// client/src/api/petApi.jsx
// 펫 API 유틸 (등록/수정 멀티파트, 목록/단건 조회, 이미지 URL 변환)

import axios from "axios";
import * as JWT from "../util/JWTUtil";
import { getAuthUser } from "../util/auth";

// jwtAxios 우선
const jwtAxios =
  JWT && (JWT.jwtAxios || JWT.default) ? JWT.jwtAxios || JWT.default : axios;

export const API_SERVER_HOST = (
  import.meta.env.VITE_API_SERVER || "http://localhost:8080"
).replace(/\/+$/, "");
const prefix = `${API_SERVER_HOST}/api/pets`;

const DEFAULT_IMG = "/no_image.png"; // ※ /public/no_image.png 존재해야 함

// -----------------------------------------
// 내부 유틸
// -----------------------------------------
const isAbsUrl = (u) => /^https?:\/\//i.test(u);

/** 서버가 무엇을 주든(파일명/상대경로/절대경로) 안전한 <img src>로 변환 */
export const toImageUrl = (raw) => {
  if (!raw) return null;
  const fileName = String(raw).trim();

  // 절대 URL이면 그대로 사용
  if (isAbsUrl(fileName)) return fileName;

  // 서버가 이미 /api/... 경로를 준 경우
  if (fileName.startsWith("/api/")) return `${API_SERVER_HOST}${fileName}`;
  if (fileName.startsWith("api/")) return `${API_SERVER_HOST}/${fileName}`;

  // 혹시 다른 루트 경로 형태로 오는 경우
  if (fileName.startsWith("/")) return `${API_SERVER_HOST}${fileName}`;

  // 일반적인 "순수 파일명"인 경우
  return `${prefix}/view/${encodeURIComponent(fileName)}`;
};

/** 서버 응답을 화면용으로 정규화 */
const normalizePet = (p = {}) => {
  // 서버 필드명이 바뀌어도 대응 (snake/camel/여러 후보)
  const file =
    p.profileImageUrl ??
    p.profile_image_url ??
    p.uploadFileName ??
    p.upload_file_name ??
    p.fileName ??
    p.filename ??
    null;

  return {
    ...p,
    // ✅ id 통일: 서버가 petId로 내려줘도 프론트는 id로 접근 가능
    id: p.id ?? p.petId ?? p.pet_id ?? null,
    photoUrl: toImageUrl(file) || DEFAULT_IMG,
  };
};

// -----------------------------
// 목록
// -----------------------------
export async function getPetList(params = {}) {
  const {
    page = 1,
    size = 10,
    mine = true,
    ownerId = null,
    petTypeId,
    keyword,
  } = params;

  const page0 = Math.max((Number(page) || 1) - 1, 0);
  const q = { page: page0, size };

  if (mine) {
    const me = getAuthUser?.();
    if (me?.userId) {
      q.ownerId = me.userId; // 내 것만 조회
    }
  } else if (ownerId) {
    q.ownerId = ownerId; // 특정 사용자 조회
  }

  if (petTypeId != null && petTypeId !== "") q.petTypeId = petTypeId;
  if (keyword) q.keyword = keyword;

  const { data } = await jwtAxios.get(prefix, { params: q });

  const content = Array.isArray(data?.content) ? data.content : [];
  const items = content.map(normalizePet);

  return {
    ...data,
    content: items,
    dtoList: items,
    list: items,
    page: (data?.number ?? page0) + 1,
    current: (data?.number ?? page0) + 1,
  };
}

// -----------------------------
// 단건
// -----------------------------
export async function getPet(petId) {
  const { data } = await jwtAxios.get(`${prefix}/${petId}`);
  return normalizePet(data);
}

// -----------------------------
// 등록 (multipart/form-data)
// form = { name, age, bodyType, breed, petTypeId, content, image(File) }
// -----------------------------
export async function registerPet(form = {}) {
  const fd = new FormData();
  if (form.name != null) fd.append("name", form.name);
  if (form.age != null) fd.append("age", form.age);
  if (form.bodyType != null) fd.append("bodyType", form.bodyType);
  if (form.breed != null) fd.append("breed", form.breed);
  // [ADD]
  if (form.gender != null) fd.append("gender", form.gender);
  if (form.neutered != null) fd.append("neutered", String(form.neutered));
  if (form.petTypeId != null && form.petTypeId !== "")
    fd.append("petTypeId", form.petTypeId);
  if (form.content != null) fd.append("content", form.content);
  if (form.image instanceof File) fd.append("image", form.image); // DTO의 MultipartFile image

  const { data } = await jwtAxios.post(prefix, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // petId
}

// -----------------------------
// 수정 (multipart/form-data)
// -----------------------------
export async function updatePet(petId, form = {}) {
  const fd = new FormData();
  if (form.name != null) fd.append("name", form.name);
  if (form.age != null) fd.append("age", form.age);
  if (form.bodyType != null) fd.append("bodyType", form.bodyType);
  if (form.breed != null) fd.append("breed", form.breed);
  // [ADD]
  if (form.gender != null) fd.append("gender", form.gender);
  if (form.neutered != null) fd.append("neutered", String(form.neutered));
  if (form.petTypeId != null && form.petTypeId !== "")
    fd.append("petTypeId", form.petTypeId);
  if (form.content != null) fd.append("content", form.content);
  if (form.image instanceof File) fd.append("image", form.image);

  await jwtAxios.put(`${prefix}/${petId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// -----------------------------
// 삭제
// -----------------------------
export async function removePet(petId) {
  await jwtAxios.delete(`${prefix}/${petId}`);
}
