import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAccessToken, getuserWithAccessToken } from "../../api/kakaoApi";
import { useDispatch } from "react-redux";
import { login } from "../../slices/LoginSlice";
import useCustomLogin from "../../hooks/useCustomLogin";
import { setCookie } from "../../util/CookieUtil";

const KakaoRedirectPage = () => {
  const { moveToPath } = useCustomLogin();

  const [searchParams] = useSearchParams();

  const authCode = searchParams.get("code");

  const dispatch = useDispatch();

  useEffect(() => {
    getAccessToken(authCode).then((accessToken) => {
      console.log("accessToken 값 체크");
      console.log(accessToken);

      getuserWithAccessToken(accessToken).then((userInfo) => {
        console.log("-----------------");
        console.log(userInfo);

        try {
          setCookie(
            "user",
            JSON.stringify({
              accessToken: userInfo.accessToken,
              refreshToken: userInfo.refreshToken,
              userId: userInfo.userId,
              email: userInfo.email,
              social: userInfo.social,
            }),
            7, // 7일 유지
          );
        } catch (e) {
          console.error("setCookie 실패:", e);
        }

        dispatch(login(userInfo));

        if (userInfo && !userInfo.social) {
          moveToPath("/");
        } else {
          // DB에 없는 사용자 이거나  소셜 로그인만 했던 사용자 라면
          moveToPath("/user/profile/edit");
        }
      });
    });
  }, [authCode]);

  return (
    <div>
      <div>Kakao Login Redirect</div>
      <div>{authCode}</div> {/* 카카오에서 전송해준 '인가코드'  */}
    </div>
  );
};

export default KakaoRedirectPage;
