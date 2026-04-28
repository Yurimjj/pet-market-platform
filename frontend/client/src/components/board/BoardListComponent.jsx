import React, { useEffect, useRef, useState } from "react";
import { getPostList } from "../../api/board/PostApi";
import useCustomMove from "../../hooks/useCustomMove";
import PageComponent from "../common/PageComponent";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../util/CookieUtil";
import { getCommentsCount } from "../../api/board/CommentApi";
import { Link } from "react-router-dom";

const initState = {
  boardList: [],
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

const BoardListComponent = () => {
  const navigate = useNavigate();
  const { page, size, refresh, moveToList, moveToRead, type, keyword } =
    useCustomMove();
  const [serverData, setServerData] = useState(initState);

  const [commentCounts, setCommentCounts] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 선택된 카테고리명 (없으면 "전체")
  const selectedCategory = keyword || "카테고리 선택";

  const movePageWithFilter = (next = {}) => {
    moveToList({
      page: next.page ?? page,
      size: next.size ?? size,
      type,
      keyword,
    });
  };

  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const data = await getPostList({ page, size, type, keyword });
        if (ignore) return;

        setServerData({ ...data, boardList: data.dtoList });

        const list = data?.dtoList ?? [];
        if (list.length === 0) {
          setCommentCounts({});
          return;
        }

        // 댓글 개수 병렬
        const tasks = list.map(async (item) => {
          try {
            const count = await getCommentsCount(item.postId);
            return [item.postId, count];
          } catch {
            return [item.postId, 0];
          }
        });

        const entries = await Promise.all(tasks);
        if (ignore) return;

        const map = {};
        entries.forEach(([id, cnt]) => (map[id] = cnt));
        setCommentCounts(map);
      } catch (error) {
        console.error("게시글 목록/댓글 불러오기 실패:", error);
      }
    };

    fetchData();
    return () => {
      ignore = true;
    };
  }, [page, size, refresh, type, keyword]);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);
  const closeDropdown = () => setDropdownOpen(false);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryChange = (newCategory) => {
    moveToList({
      page: 1,
      size: 10,
      type: newCategory ? "c" : "",
      keyword: newCategory,
    });
    closeDropdown();
  };

  const handleWriteClick = () => {
    const userCookie = getCookie("user");
    if (userCookie) {
      navigate("/board/post");
    } else {
      alert("로그인이 필요합니다!");
      navigate("/user/login");
    }
  };

  const curPage = Number(page) || 1;
  const pageSize = Number(size) || 10;
  const totalCount = Number(
    serverData?.totalCount ??
      serverData?.pageInfo?.totalCount ??
      serverData?.totalElements ??
      0,
  );

  return (
    <section>
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          {/* 상단: 제목 + 선택된 카테고리 배지 */}
          <div className="flex items-center gap-2 mb-4">
            <h2 className="card-title text-xl lg:text-2xl text-secondary">
              게시판
            </h2>
          </div>

          {/* 카테고리 드롭다운 + 글쓰기 버튼 */}
          <div className="flex items-center justify-between mb-4">
            <div ref={dropdownRef} className="relative inline-block text-left">
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={toggleDropdown}
              >
                {selectedCategory} {/* 기본은 "전체" */}
              </button>

              {dropdownOpen && (
                <div className="absolute mt-2 w-56 rounded-box bg-base-100 border border-base-300/50 shadow z-10">
                  <ul className="menu p-2">
                    <li>
                      <button onClick={() => handleCategoryChange("")}>
                        All
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleCategoryChange("자유게시판")}
                      >
                        자유게시판
                      </button>
                    </li>
                    <li>
                      <button onClick={() => handleCategoryChange("Q&A")}>
                        Q&amp;A
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => handleCategoryChange("정보공유게시판")}
                      >
                        정보공유게시판
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleWriteClick}
            >
              게시글 작성
            </button>
          </div>

          {/* 게시글 목록 */}
          {serverData.boardList.length === 0 ? (
            <div className="py-6 text-base-content/70 text-center">
              첫 게시글을 작성해 보세요 ✍️
            </div>
          ) : (
            <div className="card bg-base-100 border border-base-300/50 shadow-sm">
              <ul className="divide-y divide-base-300/50">
                {serverData.boardList.map((board, idx) => {
                  const cmt = commentCounts[board.postId] ?? 0;
                  return (
                    <li
                      key={board.postId}
                      className="p-3 rounded-lg cursor-pointer
                      transition-colors transition-shadow duration-150
                      hover:bg-base-content/5 hover:shadow-sm"
                      onClick={() => moveToRead(board.postId)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-sm sm:text-base font-semibold text-base-content/70 min-w-10 text-center pt-1">
                          {totalCount - (curPage - 1) * pageSize - idx}
                        </div>

                        {/* 본문 */}
                        <div className="flex-1 min-w-0">
                          {/* 제목 + 배지들 */}
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-base sm:text-lg font-semibold text-base-content truncate">
                              {board.title}
                            </div>

                            {/* 카테고리 배지 */}
                            {board.categoryName && (
                              <span className="badge badge-success badge-sm">
                                {board.categoryName}
                              </span>
                            )}

                            {/* 댓글 개수 배지 */}
                            <span className="badge badge-accent badge-sm">
                              💬 {cmt}
                            </span>
                          </div>

                          {/* 작성자 / 날짜 / 조회수 */}
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-base-content/60">
                            {board.userInfo ? (
                              <Link
                                to={`/pet/list?ownerId=${board.userInfo}`}
                                className="truncate text-secondary hover:underline"
                                title="펫 프로필 보기"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                {board.nickname}
                              </Link>
                            ) : (
                              <span className="truncate">{board.nickname}</span>
                            )}
                            <span>•</span>
                            <span>
                              {board.createdAt
                                ? board.createdAt.substring(0, 10)
                                : ""}
                            </span>
                            <span>•</span>
                            <span className="text-secondary">
                              조회 {board.viewCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* 페이지네이션: 카드 제거 (구분감 없앰) */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <PageComponent
              serverData={serverData}
              movePage={movePageWithFilter}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardListComponent;
