// src/components/common/PageComponent.jsx
import React from "react";

/**
 * 페이지네이션 컴포넌트
 * @param {object} props
 * @param {object} props.serverData - 서버 데이터 (예: { prev: true, prevPage: 9, pageNumList: [10, 11, 12], current: 10, next: true, nextPage: 11 })
 * @param {function} props.movePage - 페이지 이동 함수
 */
const PageComponent = ({ serverData, movePage }) => {
  return (
    // 전체 컨테이너: 가로 중앙 정렬 및 상하 마진
    <div className="my-4 flex justify-center items-center gap-3">
      {/* '이전' 버튼 */}
      {serverData.prev && (
        <button
          className="btn btn-base-200 btn-sm"
          onClick={() => movePage({ page: serverData.prevPage })}
        >
          이전
        </button>
      )}

      {/* 페이지 번호 목록 (daisyUI join으로 한 덩어리) */}
      <div className="join">
        {serverData.pageNumList.map((pageNum) => (
          <button
            key={pageNum}
            className={`join-item btn btn-sm ${
              serverData.current === pageNum ? "btn-secondary" : "btn-success"
            }`}
            onClick={() => movePage({ page: pageNum })}
          >
            {pageNum}
          </button>
        ))}
      </div>

      {/* '다음' 버튼 */}
      {serverData.next && (
        <button
          className="btn btn-base-200 btn-sm"
          onClick={() => movePage({ page: serverData.nextPage })}
        >
          다음
        </button>
      )}
    </div>
  );
};

export default PageComponent;
