import React from "react";
import { useParams } from "react-router-dom"; // useParams 훅을 가져옵니다.
import BasicMenu from "../../components/menus/BasicMenu";
import BoardModifyComponent from "../../components/board/BoardModifyComponent";

const ModifyPage = () => {
  const { postId } = useParams();

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 본문 영역 */}
      <main className="flex-grow flex justify-center items-start py-8 px-4">
        <div className="w-full max-w-3xl">
          {/* 2. BoardModifyComponent에 postId를 props로 전달합니다. */}
          <BoardModifyComponent postId={postId} />
        </div>
      </main>
    </div>
  );
};

export default ModifyPage;
