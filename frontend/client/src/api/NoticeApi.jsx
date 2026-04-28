// client/src/api/NoticeApi.jsx
import jwtAxios from "../util/JWTUtil"; // [CHG] 일반 axios 대신 jwtAxios만 사용

// [CHG] 절대주소 제거하고, jwtAxios의 baseURL(/api) 기준 상대 경로만 사용
const prefix = `/notices`;

// 특정 번호의 공지사항 조회 (GET /api/notices/{id})
export const getOne = async (nno) => {
  // [CHG] axios → jwtAxios, 절대주소 → 상대경로
  const res = await jwtAxios.get(`${prefix}/${nno}`);
  return res.data;
};

// 페이지(리스트) 처리 (GET /api/notices/list?page=&size=)
export const getList = async (pageParam = {}) => {
  // [CHG] 기본값 보강: page/size 없을 때 안전하게 동작
  const { page = 1, size = 10 } = pageParam;
  // [CHG] axios → jwtAxios, 절대주소 → 상대경로 + params
  const res = await jwtAxios.get(`${prefix}/list`, { params: { page, size } });
  return res.data;
};

// 데이터 추가 (POST /api/notices/register)
export const postNotice = async (noticeObj) => {
  // (기존도 jwtAxios였으나 절대주소 제거)
  const res = await jwtAxios.post(`${prefix}/register`, noticeObj);
  return res.data;
};

// 삭제 (DELETE /api/notices/{id})
export const deleteOne = async (nno) => {
  // [CHG] 절대주소 제거
  const res = await jwtAxios.delete(`${prefix}/${nno}`);
  return res.data;
};

// (수정) 업데이트 (PUT /api/notices/{id})
export const putOne = async (notice) => {
  // [CHG] 절대주소 제거
  const res = await jwtAxios.put(`${prefix}/${notice.noticeId}`, notice);
  return res.data;
};
