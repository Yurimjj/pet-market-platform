// 공지사항 상세 페이지
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOne, deleteOne } from "../../api/NoticeApi";
import useCustomMove from "../../hooks/useCustomMove";
import { useSelector } from "react-redux";

const initState = {
  notice: {
    noticeId: null,
    writerName: "",
    writerId: null,
    title: "",
    content: "",
    isPublished: false,
    viewCount: 0,
    createdAt: null,
    updatedAt: null,
  },
  loading: true,
  error: null,
};

const NoticeDetailComponent = ({ noticeId }) => {
  const [state, setState] = useState(initState);
  const { notice, loading, error } = state;
  const { moveToList } = useCustomMove();

  const loginState = useSelector((state) => state.LoginSlice);

  const isManagerOrAdmin =
    loginState?.roleNames &&
    (loginState.roleNames.includes("MANAGER") ||
      loginState.roleNames.includes("ADMIN"));

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const data = await getOne(noticeId);
        setState((prev) => ({
          ...prev,
          notice: data,
          loading: false,
        }));
      } catch (err) {
        console.error("공지사항 상세 조회 실패:", err);
        setState((prev) => ({
          ...prev,
          error: "공지사항을 불러오지 못했습니다.",
          loading: false,
        }));
      }
    };

    if (noticeId) fetchNotice();
  }, [noticeId]);

  const handleDelete = async () => {
    if (window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      try {
        await deleteOne(noticeId);
        alert("공지사항이 삭제되었습니다.");
        moveToList();
      } catch (err) {
        console.error("공지사항 삭제 실패:", err);
        alert("삭제 권한이 없거나 삭제에 실패했습니다.");
      }
    }
  };

  if (loading)
    return (
      <div className="text-center p-4 text-base-content/60">Loading...</div>
    );
  if (error) return <div className="text-center p-4 text-error">{error}</div>;
  if (!notice)
    return (
      <div className="text-center p-4 text-base-content/60">
        공지사항이 없습니다.
      </div>
    );

  // yyyy-MM-dd HH:mm
  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    const d = new Date(dateTimeStr);
    const yyyy = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
  };

  return (
    <section>
      {/* BoardReadComponent와 동일 톤의 카드 레이아웃 */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          {/* 제목 */}
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            {notice.title || "제목 없음"}
          </h2>

          {/* 작성자/작성일/조회수 */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-base-content/60">
            <span className="font-medium text-base-content">
              ✍ {notice.writerName || "관리자"}
            </span>
            <span>•</span>
            <span>{formatDateTime(notice.createdAt)}</span>
            <span>•</span>
            <span className="badge badge-accent badge-sm">
              👁 {notice.viewCount}
            </span>
            {notice.isPublished === false && (
              <span className="badge badge-ghost badge-sm">비공개</span>
            )}
          </div>

          {/* 본문 */}
          <div className="mt-4">
            {notice.content?.trim() ? (
              <p className="whitespace-pre-wrap text-base-content text-base">
                {notice.content}
              </p>
            ) : (
              <p className="text-base-content/70">내용이 없습니다.</p>
            )}
          </div>

          {/* 하단 버튼: BoardReadComponent와 동일한 톤 */}
          <div className="mt-6 flex justify-end gap-2 border-t border-base-300/50 pt-4">
            <button
              type="button"
              className="btn btn-accent btn-sm"
              onClick={() => moveToList()}
            >
              목록
            </button>

            {isManagerOrAdmin && (
              <>
                <Link
                  to={`/notice/modify/${noticeId}`}
                  className="btn btn-secondary btn-sm"
                >
                  수정
                </Link>
                <button
                  type="button"
                  className="btn btn-error btn-sm"
                  onClick={handleDelete}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NoticeDetailComponent;
