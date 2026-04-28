import axios from "axios";
import { API_SERVER_HOST } from "./UserApi";

const rest_api_key = `your_rest_key`; //REST 키값
const redirect_uri = `http://localhost:5173/user/kakao`;

const auth_code_path = `https://kauth.kakao.com/oauth/authorize`;

const access_token_url = `https://kauth.kakao.com/oauth/token`;

export const getKakaoLoginLink = () => {
  const kakaoURL = `${auth_code_path}?client_id=${rest_api_key}&redirect_uri=${redirect_uri}&response_type=code`;

  return kakaoURL;
};

export const getAccessToken = async (authCode) => {
  // authCode : 카카오 에서 전송해준 '인가 코드'

  const header = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const params = {
    grant_type: "authorization_code",
    client_id: rest_api_key,
    redirect_uri: redirect_uri,
    code: authCode,
  };

  const res = await axios.post(access_token_url, params, header);

  const accessToken = res.data.access_token;

  return accessToken;
};

export const getuserWithAccessToken = async (accessToken) => {
  const res = await axios.get(
    `${API_SERVER_HOST}/api/user/kakao?accessToken=${accessToken}`,
  );
  return res.data;
};
