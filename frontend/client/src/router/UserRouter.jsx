// src/router/UserRouter.jsx
import { lazy, Suspense } from "react";

const Loading = <div>Loading...</div>;

const Login = lazy(() => import("../pages/user/LoginPage"));
const Logout = lazy(() => import("../pages/user/LogoutPage"));
const SignupPage = lazy(() => import("../pages/user/SignupPage"));
const Profile = lazy(() => import("../pages/user/ProfilePage"));
// [추가] 프로필 수정 페이지 lazy import
const ProfileEdit = lazy(() => import("../pages/user/ProfileEditPage"));
const KakaoRedirect = lazy(() => import("../pages/user/KaKaoredirectPage"));
const WithdrawalPage = lazy(() => import("../pages/user/WithdrawalPage"));

const UserRouter = () => [
  {
    path: "login", // 부모 라우트가 /user 라면 최종 경로는 /user/login
    element: (
      <Suspense fallback={Loading}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "logout", // 최종 경로: /user/logout
    element: (
      <Suspense fallback={Loading}>
        <Logout />
      </Suspense>
    ),
  },
  {
    path: "signup", // 회원가입
    element: (
      <Suspense fallback={Loading}>
        <SignupPage />
      </Suspense>
    ),
  },
  {
    path: "profile", // ✅ 최종 경로: /user/profile
    element: (
      <Suspense fallback={Loading}>
        <Profile />
      </Suspense>
    ),
  },
  // [추가] /user/profile/edit → 수정 전용 페이지
  {
    path: "profile/edit",
    element: (
      <Suspense fallback={Loading}>
        <ProfileEdit />
      </Suspense>
    ),
  },
  {
    path: "kakao",
    element: (
      <Suspense fallback={Loading}>
        <KakaoRedirect />
      </Suspense>
    ),
  },
  {
    path: "withdrawal", // 회원탈퇴
    element: (
      <Suspense fallback={Loading}>
        <WithdrawalPage />
      </Suspense>
    ),
  },
];

export default UserRouter;
