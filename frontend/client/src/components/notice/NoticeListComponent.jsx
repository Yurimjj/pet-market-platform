import { useEffect, useState } from "react";
import { getList } from "../../api/NoticeApi";
import useCustomMove from "../../hooks/useCustomMove";
import PageComponent from "../common/PageComponent";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const initState = {
  dtoList: [],
  pageNumList: [],
  pageRequestDTO: null,
  prev: false,
  next: false,
  totalCount: 0,
  prevPage: 0,
  nextPage: 0,
  totalPage: 0,
  current: 0,
};

const NoticeListComponent = () => {
  const { page, size, refresh, moveToList, moveToRead } = useCustomMove();
  const [serverData, setServerData] = useState(initState);

  const loginState = useSelector((state) => state.LoginSlice);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24시간 형식
    };
    return new Intl.DateTimeFormat("ko-KR", options).format(date);
  };

  useEffect(() => {
    getList({ page, size }).then((data) => {
      console.log(data);

      const currentPage = data.page;
      const totalPages = data.totalPages;

      // 페이지 그룹 계산 (10개 단위)
      const pageGroupSize = 10;
      const groupStart =
        Math.floor((currentPage - 1) / pageGroupSize) * pageGroupSize + 1;
      const groupEnd = Math.min(groupStart + pageGroupSize - 1, totalPages);

      // 현재 그룹의 페이지 번호 목록
      const pageNumList = Array.from(
        { length: groupEnd - groupStart + 1 },
        (_, i) => groupStart + i
      );

      setServerData({
        dtoList: data.content || [],
        totalCount: data.totalElements,
        totalPage: totalPages,
        current: currentPage,
        pageNumList,
        prev: groupStart > 1,
        prevPage: groupStart - 1,
        next: groupEnd < totalPages,
        nextPage: groupEnd + 1,
      });
    });
  }, [page, size, refresh]);

  const canWriteNotice =
    loginState?.roleNames?.includes("MANAGER") ||
    loginState?.roleNames?.includes("ADMIN");

  const handleClickRegister = () => {
    navigate("/notice/register"); // 절대경로
    // or navigate("register");          // 상대경로(추천)
  };

  const movePageWithSame = (next = {}) => {
    moveToList({
      page: next.page ?? page,
      size: next.size ?? size,
    });
  };

  return (
    <section>
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          {/* 상단: 제목 + 작성 버튼(권한자만) */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-title text-xl lg:text-2xl text-secondary">
              공지사항
            </h2>

            {/* '공지사항 작성' 버튼은 관리자 또는 관리자만 볼수 있다. */}
            {canWriteNotice && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleClickRegister}
              >
                공지사항 작성
              </button>
            )}
          </div>

          {/* 목록 */}
          {serverData.dtoList?.length === 0 ? (
            <div className="py-6 text-base-content/70 text-center">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300/50 shadow-sm">
              <ul className="divide-y divide-base-300/50">
                {/* [CHG] idx(행 인덱스) 추가 */}
                {serverData.dtoList.map((notice, idx) => (
                  <li
                    key={notice.noticeId}
                    className="p-3 rounded-lg cursor-pointer transition-colors transition-shadow duration-150 hover:bg-base-content/5 hover:shadow-sm"
                    onClick={() => moveToRead(notice.noticeId)}
                  >
                    <div className="flex items-start gap-3">
                      {/* [CHG] 번호: PK 대신 '연속 번호' 계산식으로 표시
                          전체개수 - (현재페이지-1)*페이지크기 - 현재행인덱스
                          (최신글이 위로 오는 내림차순 정렬 가정) */}
                      <div className="text-sm sm:text-base font-semibold text-base-content/70 min-w-10 text-center pt-1">
                        {(serverData?.totalCount ?? 0) -
                          ((serverData?.current ?? page) - 1) * Number(size) -
                          idx}
                      </div>

                      {/* 본문 */}
                      <div className="flex-1 min-w-0">
                        {/* 제목 */}
                        <div className="text-base sm:text-lg font-semibold text-base-content truncate">
                          {notice.title}
                        </div>

                        {/* 작성자 / 날짜 / 조회수 */}
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-base-content/60">
                          <span className="truncate">{notice.writerName}</span>
                          <span>•</span>
                          <span>{formatDate(notice.createdAt)}</span>
                          <span>•</span>
                          <span className="text-secondary">
                            조회 {notice.viewCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 페이지네이션: 중앙 정렬 */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <PageComponent
              serverData={serverData}
              movePage={movePageWithSame}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoticeListComponent;
