// client/src/util/auth.js
import { getCookie } from "./CookieUtil";

/** 쿠키/토큰에서 userId와 roles를 추출 */
export function getAuthUser() {
  const raw = getCookie("user");
  if (!raw) return null;

  let obj = raw;
  try {
    if (typeof raw === "string") obj = JSON.parse(raw);
  } catch {
    /* ignore */
  }

  const access = obj?.accessToken;
  let payload = {};
  try {
    if (access) payload = JSON.parse(atob(access.split(".")[1] || ""));
  } catch {
    /* ignore */
  }

  // 프로젝트마다 키 이름이 다를 수 있어 가능한 키를 다 시도
  const userId =
    obj?.userId ??
    obj?.id ??
    payload?.userId ??
    payload?.uid ??
    payload?.sub ??
    null;

  const roles = obj?.roles ?? payload?.roles ?? payload?.authorities ?? [];

  return userId ? { userId: String(userId), roles, accessToken: access } : null;
}

export const hasRole = (roles = [], roleName = "ADMIN") =>
  roles?.some((r) => String(r).toUpperCase().includes(roleName));
