// client/src/util/JWTUtil.jsx
import axios from "axios";
import { getCookie, setCookie } from "../util/CookieUtil";

export const API_SERVER_HOST = "http://localhost:8080";

/** JWT 전용 axios 인스턴스: /api 기준 */
const jwtAxios = axios.create({
  baseURL: `${API_SERVER_HOST}/api`,
});

/** Access 만료 시 Refresh 로 재발급 */
const refreshJWT = async (accessToken, refreshToken) => {
  const header = { headers: { Authorization: `Bearer ${accessToken}` } };
  const res = await axios.get(
    `${API_SERVER_HOST}/api/user/refresh?refreshToken=${refreshToken}`,
    header
  );
  return res.data;
};

/** 로그인 없이 허용할 공개 GET 경로(정규식) */
const PUBLIC_GETS = [
  /^\/products(\/.*)?$/, // 목록/상세 등
  /^\/product-categories(\/.*)?$/, // 카테고리 조회
];

/** 요청 직전 인터셉터 */
const beforeReq = (config) => {
  console.log("before request......");

  const userInfo = getCookie("user");

  // 로그인 안 되어 있어도 허용할 공개 GET은 통과
  if (!userInfo) {
    const method = (config.method || "get").toLowerCase();

    // url 정규화: 절대/상대 모두 대응하고, /api 접두어는 제거해서 매칭
    const path = (() => {
      try {
        const u = new URL(config.url, config.baseURL || `${API_SERVER_HOST}/`);
        return u.pathname.replace(/^\/api(\/|$)/, "/");
      } catch {
        return String(config.url || "/").replace(/^\/api(\/|$)/, "/");
      }
    })();

    const isPublicGet =
      method === "get" && PUBLIC_GETS.some((rx) => rx.test(path));

    if (isPublicGet) return config;

    console.log("USER Not FOUND");
    return Promise.reject({
      response: { data: { error: "REQUIRE_LOGIN" } },
    });
  }

  // 로그인된 경우 Authorization 부착
  const { accessToken } = userInfo;
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
};

/** 요청 설정 단계에서의 실패 */
const requestFail = (err) => {
  console.log("request error.......");
  return Promise.reject(err);
};

/** 응답 직전 인터셉터 */
const beforeRes = async (res) => {
  console.log("before return response..........");
  console.log(res);

  const data = res?.data;

  // 서버가 바디로 토큰오류를 알리는 케이스 처리
  if (
    data &&
    (data.err === "ERROR_ACCESS_TOKEN" || data.error === "ERROR_ACCESS_TOKEN")
  ) {
    const userCookieValue = getCookie("user");
    const result = await refreshJWT(
      userCookieValue?.accessToken,
      userCookieValue?.refreshToken
    );

    // 쿠키 갱신 (CookieUtil이 문자열 저장을 기대한다고 가정)
    userCookieValue.accessToken = result.accessToken;
    userCookieValue.refreshToken = result.refreshToken;
    setCookie("user", JSON.stringify(userCookieValue));

    // 원래 요청 재시도
    const original = res.config;
    original.headers = original.headers ?? {};
    original.headers.Authorization = `Bearer ${result.accessToken}`;
    return await axios(original);
  }

  return res;
};

/** 응답 단계에서의 실패(HTTP 에러 등) */
const responseFail = (err) => {
  console.log("response fail error........");
  return Promise.reject(err);
};

// 인터셉터 장착
jwtAxios.interceptors.request.use(beforeReq, requestFail);
jwtAxios.interceptors.response.use(beforeRes, responseFail);

export default jwtAxios;
