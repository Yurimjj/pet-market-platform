import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import BasicLayout from "../layouts/BasicLayout";

const Tab = ({ to, label }) => {
  const { pathname } = useLocation();
  const active = pathname.startsWith(to);
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm ${
        active ? "bg-sky-200" : "hover:bg-sky-100"
      }`}
    >
      {label}
    </Link>
  );
};

const AdminComponent = () => {
  return (
    <BasicLayout>
      <div className="flex items-center justify-between bg-sky-400 text-white px-4 py-3 rounded-md">
        <div className="font-semibold">관리자</div>
        <nav className="space-x-2">
          <Tab to="/admin/dashboard" label="대시보드" />
          <Tab to="/admin/reports" label="신고" />
          <Tab to="/admin/sign-up-chart" label="가입 추이" />
        </nav>
      </div>

      <div className="mt-4 bg-white rounded-md p-4 shadow">
        <Outlet />
      </div>
    </BasicLayout>
  );
};

export default AdminComponent;
