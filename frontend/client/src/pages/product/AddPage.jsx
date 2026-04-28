// client/src/pages/product/AddPage.jsx
import ProductAddComponent from "../../components/product/ProductAddComponent";
// import useCustomLogin from "../../hooks/useCustomLogin";                // ★★★ 제거: 커스텀 훅 미사용
import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCookie } from "../../util/CookieUtil"; // ★★★ 추가: 쿠키로 로그인 확인

export default function AddPage() {
  // const { isLogin, moveToLogin } = useCustomLogin();                   // ★★★ 제거: Board 스타일로 교체
  const nav = useNavigate();
  const loc = useLocation();
  const warnedRef = useRef(false);

  const isLogin = !!getCookie("user"); // ★★★ 추가: 쿠키 존재 여부로 로그인 판단

  // 비로그인: 알림 -> 확인 후 로그인 이동 (복귀 경로 유지)
  useEffect(() => {
    if (!isLogin && !warnedRef.current) {
      warnedRef.current = true;
      alert("로그인이 필요합니다.");
      // ★★★ 변경: 커스텀 훅 대신 직접 라우팅 (Board와 동일한 패턴)
      nav("/user/login", {
        replace: true,
        state: { from: loc.pathname + loc.search },
      });
    }
  }, [isLogin, nav, loc]); // ★★★ 의존성 정리

  if (!isLogin) return null; // 이동 중 깜빡임 방지

  return (
    <main className="min-h-screen bg-base-200 p-4 sm:p-6 flex justify-center items-start">
      <div className="w-full max-w-3xl">
        <ProductAddComponent />
      </div>
    </main>
  );
}
