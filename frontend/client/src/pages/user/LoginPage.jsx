import React from "react";
import BasicMenu from "../../components/menus/BasicMenu";
import LoginComponent from "../../components/user/LoginComponent";

const LoginPage = () => {
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 메인 컨텐츠 영역: 중앙 정렬 */}
      <div className="flex-grow overflow-auto bg-base-200 grid place-items-center">
        <div className="w-full max-w-[1000px] p-4">
          <LoginComponent />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
