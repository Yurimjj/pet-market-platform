// src/pages/board/ReadPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import BoardReadComponent from "../../components/board/BoardReadComponent";
import BasicMenu from "../../components/menus/BasicMenu";
import BoardCommentListComponent from "../../components/board/comment/BoardCommentListComponent";

const ReadPage = () => {
  const { postId } = useParams();

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 메인 컨텐츠 영역 (ListPage와 동일한 구조/클래스) */}
      <main className="flex-grow overflow-auto">
        <div className="w-full max-w-[1000px] p-4 mx-auto">
          {/* 게시글 본문 */}
          <BoardReadComponent postId={postId} />

          {/* 본문과 댓글 구분 */}
          <div className="mt-8 border-t border-base-300/50 pt-6">
            <BoardCommentListComponent postId={Number(postId)} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReadPage;
