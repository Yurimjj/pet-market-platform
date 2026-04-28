import React from "react";
import ChatList from "../../components/chat/ChatList";
import BasicMenu from "../../components/menus/BasicMenu"; // ⬅ 상단 메뉴 추가

const ChatListPage = () => {
  return (
    <div className="fixed inset-0 flex flex-col">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-grow overflow-auto flex justify-center items-start bg-base-200">
        <div className="w-full max-w-[1000px] p-4">
          {/* 채팅방 목록 */}
          <ChatList />
        </div>
      </div>
    </div>
  );
};

export default ChatListPage;
