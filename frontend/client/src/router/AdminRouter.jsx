import { lazy, Suspense } from "react";
import React from "react";

const Loading = <div>Loading...</div>;

const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const ReportForm = lazy(() => import("../pages/admin/ReportForm")); // 선택
const ReportList = lazy(() => import("../pages/admin/ReportList"));
const UserDetailsPage = lazy(() => import("../pages/admin/UserDetailsPage"));
const WarningHistory = lazy(() => import("../pages/admin/WarningHistory"));
const SignUpChart = lazy(() => import("../pages/admin/SignUpChart"));

/** 루트에서 path="/admin" 으로 마운트되며, 여기서는 상대 경로만 정의 */
const AdminRouter = () => [
  {
    path: "dashboard",
    element: (
      <Suspense fallback={Loading}>
        <DashboardPage />
      </Suspense>
    ),
  },
  {
    path: "reports",
    element: (
      <Suspense fallback={Loading}>
        <ReportList />
      </Suspense>
    ),
  },
  {
    path: "reports/new",
    element: (
      <Suspense fallback={Loading}>
        <ReportForm />
      </Suspense>
    ),
  },
  {
    path: "users/:userId",
    element: (
      <Suspense fallback={Loading}>
        <UserDetailsPage />
      </Suspense>
    ),
  },
  {
    path: "users/:userId/warnings",
    element: (
      <Suspense fallback={Loading}>
        <WarningHistory />
      </Suspense>
    ),
  },
  {
    path: "sign-up-chart",
    element: (
      <Suspense fallback={Loading}>
        <SignUpChart />
      </Suspense>
    ),
  },
];

export default AdminRouter;
