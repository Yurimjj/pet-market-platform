// src/router/ProductRouter.jsx
import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";

const Loading = <div className="p-6">Loading...</div>;

const List   = lazy(() => import("../pages/product/ListPage"));
const Read   = lazy(() => import("../pages/product/ReadPage"));
const Add    = lazy(() => import("../pages/product/AddPage"));
const Modify = lazy(() => import("../pages/product/ModifyPage"));

const ProductRouter = () => [
  // NoticeRouter와 동일: 베이스(/product) 진입 시 list로 리다이렉트
  { path: "", element: <Navigate to="list" /> },

  {
    path: "list",
    element: (
      <>
        <BasicMenu />
        <Suspense fallback={Loading}>
          <List />
        </Suspense>
      </>
    ),
  },
  {
    path: "read/:productId",
    element: (
      <>
        <BasicMenu />
        <Suspense fallback={Loading}>
          <Read />
        </Suspense>
      </>
    ),
  },
  {
    path: "add",
    element: (
      <>
        <BasicMenu />
        <Suspense fallback={Loading}>
          <Add />
        </Suspense>
      </>
    ),
  },
  {
    path: "modify/:productId",
    element: (
      <>
        <BasicMenu />
        <Suspense fallback={Loading}>
          <Modify />
        </Suspense>
      </>
    ),
  },
];

export default ProductRouter;
