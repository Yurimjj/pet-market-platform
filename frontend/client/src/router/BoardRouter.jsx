import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import React from "react";

const Loading = <div>Loading...</div>;

// 페이지 lazy 로딩
const BoardList = lazy(() => import("../pages/board/ListPage"));
const BoardRead = lazy(() => import("../pages/board/ReadPage")); // 새로 만든 ReadPage
const BoardPost = lazy(() => import("../pages/board/PostPage"));
const BoardModify = lazy(() => import("../pages/board/ModifyPage"));

const BoardRouter = () => {
  return [
    {
      path: "list",
      element: (
        <Suspense fallback={Loading}>
          <BoardList />
        </Suspense>
      ),
    },
    {
      path: "read/:postId", // postId 파라미터 받기
      element: (
        <Suspense fallback={Loading}>
          <BoardRead />
        </Suspense>
      ),
    },
    {
      path: "",
      element: <Navigate replace to="/list" />,
    },
    {
      path: "post",
      element: (
        <Suspense fallback={Loading}>
          <BoardPost />
        </Suspense>
      ),
    },
    {
      path: "modify/:postId",
      element: (
        <Suspense fallback={Loading}>
          <BoardModify />
        </Suspense>
      ),
    },
  ];
};

export default BoardRouter;
