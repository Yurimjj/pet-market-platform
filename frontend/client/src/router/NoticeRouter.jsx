// src/router/NoticeRouter.jsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu"; // ✅ 정확한 경로

const Loading = <div>Loading...</div>;
const NoticeList = lazy(() => import("../pages/notice/NoticeListPage"));
const NoticeRead = lazy(() => import("../pages/notice/NoticeDetailPage"));
const NoticeModify = lazy(() => import("../pages/notice/NoticeModifyPage"));
const NoticeRegister = lazy(() => import("../pages/notice/NoticeRegisterPage"));

const noticeRouter = () => {
  return [
    {
      path: "",
      element: <Navigate to="list" />,
    },
    {
      path: "list",
      element: (
        <Suspense fallback={Loading}>
          <NoticeList />
        </Suspense>
      ),
    },
    {
      path: "read/:noticeId",
      element: (
        <Suspense fallback={Loading}>
          <NoticeRead />
        </Suspense>
      ),
    },
    {
      path: "modify/:noticeId",
      element: (
        <Suspense fallback={Loading}>
          <NoticeModify />
        </Suspense>
      ),
    },
    {
      path: "register",
      element: (
        <Suspense fallback={Loading}>
          <NoticeRegister />
        </Suspense>
      ),
    },
  ];
};

export default noticeRouter;
