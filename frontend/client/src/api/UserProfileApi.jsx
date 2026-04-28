// client/src/api/UserProfileApi.jsx
import { API_SERVER_HOST } from "./UserApi";
import jwtAxios from "../util/JWTUtil";

const host = `${API_SERVER_HOST}/api/users`;

/** 내 프로필 조회 */
export async function getMyProfile() {
  const res = await jwtAxios.get(`${host}/me`);
  return res.data;
}

/** 내 프로필 수정 */
export async function updateMyProfile(payload) {
  const res = await jwtAxios.put(`${host}/me`, payload);
  return res.data;
}

/** 회원 탈퇴(비활성화) */
export async function deactivateMe() {
  const res = await jwtAxios.delete(`${host}/me`);
  return res.data;
}
