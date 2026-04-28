import React from "react";
import BasicMenu from "../../components/menus/BasicMenu";
import BoardPostComponent from "../../components/board/BoardPostComponent";

const PostPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 메인 컨텐츠 영역 (ReadPage와 동일한 구조/클래스) */}
      <main className="flex-grow overflow-auto">
        <div className="w-full max-w-[1000px] p-4 mx-auto">
          <BoardPostComponent />
        </div>
      </main>
    </div>
  );
};

export default PostPage;
