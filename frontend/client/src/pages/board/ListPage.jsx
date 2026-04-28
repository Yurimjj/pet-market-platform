import React from "react";
import { useSearchParams } from "react-router-dom";
import BoardListComponent from "../../components/board/BoardListComponent";
import BasicMenu from "../../components/menus/BasicMenu";

const ListPage = () => {
  const [queryParams] = useSearchParams();
  // 필요하면 page/size/keyword 읽어서 BoardListComponent에 전달하도록 남겨둠
  const page = queryParams.get("page") ? parseInt(queryParams.get("page")) : 1;
  const size = queryParams.get("size") ? parseInt(queryParams.get("size")) : 10;
  const keyword = queryParams.get("keyword") || "";
  const categoryBase = keyword ? keyword : "전체";

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-grow overflow-auto">
        <div className="w-full max-w-[1000px] p-4 mx-auto">
          <BoardListComponent />
        </div>
      </main>
    </div>
  );
};

export default ListPage;
