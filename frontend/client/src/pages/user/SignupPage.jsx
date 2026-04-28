// 회원가입
import React from "react";
import BasicMenu from "../../components/menus/BasicMenu";
import SignupComponent from "../../components/user/SignupComponent";

const SignupPage = () => {
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 메인 컨텐츠 영역: 중앙 정렬 (로그인 페이지와 동일) */}
      <div className="flex-grow overflow-auto bg-base-200 grid place-items-center">
        <div className="w-full max-w-[1000px] p-4">
          <SignupComponent />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
