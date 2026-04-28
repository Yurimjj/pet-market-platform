// src/layouts/BasicLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import BasicMenu from "../components/menus/BasicMenu";

const BasicLayout = ({ children }) => {
  return (
    <>
      <BasicMenu />
      {/* 페이지 전체를 petcycle 테마 + 테마 배경으로 */}
      <div data-theme="petcycle" className="min-h-screen bg-base-200">
        <div className="container mx-auto py-6 px-4">
          {/* 가운데 정렬 + 최대 너비만 주고 배경색은 제거 */}
          <main className="w-full max-w-[1000px] mx-auto">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </>
  );
};

export default BasicLayout;
