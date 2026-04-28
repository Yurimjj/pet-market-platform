import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import {
  getCommentsPage,
  getCommentsCount,
  addComment,
  modifyComment,
  removeComment,
} from "../../../api/board/CommentApi";
import { getCookie } from "../../../util/CookieUtil";

// 날짜 포맷
const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd} ${hh}:${mi}`;
};

const DEFAULT_PAGE_SIZE = 10;

const flattenComment = (c) => ({
  ...c,
  userId: c?.userId ?? c?.user?.id ?? null,
  nickname: c?.nickname ?? c?.user?.nickname ?? null,
  children: Array.isArray(c?.children) ? c.children.map(flattenComment) : [],
});

const BoardCommentListComponent = ({
  postId,
  pageSize = DEFAULT_PAGE_SIZE,
  className = "",
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const cpageQS = Number(searchParams.get("cpage") || 1); // 1-base
  const csizeQS = Number(searchParams.get("csize") || pageSize);
  const [page, setPage] = useState(Math.max(0, cpageQS - 1)); // 0-base
  const [size, setSize] = useState(csizeQS > 0 ? csizeQS : pageSize);

  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [meta, setMeta] = useState({ totalPages: 0, size });

  const [newContent, setNewContent] = useState("");
  const [posting, setPosting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const [myUserId, setMyUserId] = useState(null);
  const [myNickname, setMyNickname] = useState(null);

  const [openReplies, setOpenReplies] = useState({});
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const topRef = useRef(null);

  useEffect(() => {
    const userCookie = getCookie("user");
    if (userCookie) {
      try {
        const parsed =
          typeof userCookie === "string" ? JSON.parse(userCookie) : userCookie;
        if (parsed?.userId != null) setMyUserId(parsed.userId);
        if (parsed?.nickname) setMyNickname(parsed.nickname);
      } catch {}
    }
  }, []);

  useEffect(() => {
    setPage(0);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("cpage", "1");
        next.set("csize", String(size));
        return next;
      },
      { replace: true },
    );
  }, [postId]);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const [pageRes, count] = await Promise.all([
        getCommentsPage(postId, page, size),
        getCommentsCount(postId),
      ]);
      const parents = (pageRes?.parentComments ?? []).map(flattenComment);
      setList(parents);
      setMeta({
        totalPages: pageRes?.totalPages ?? 0,
        size: pageRes?.size ?? size,
      });
      setTotal(count ?? 0);
    } catch (e) {
      console.error("댓글 불러오기 실패:", e);
    } finally {
      setLoading(false);
    }
  }, [postId, page, size]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const canPrev = useMemo(() => page > 0, [page]);
  const canNext = useMemo(
    () => page + 1 < (meta.totalPages || 0),
    [page, meta.totalPages],
  );

  const goPage = (nextPage0) => {
    const bounded = Math.max(0, nextPage0);
    setPage(bounded);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("cpage", String(bounded + 1));
      next.set("csize", String(size));
      return next;
    });
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const submitNewComment = async () => {
    const content = newContent.trim();
    if (!content) return;
    try {
      setPosting(true);
      await addComment({ postId, content });
      setNewContent("");
      setPage(0);
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("cpage", "1");
        next.set("csize", String(size));
        return next;
      });
      await fetchComments();
    } catch (e) {
      console.error("댓글 등록 실패:", e);
      alert("로그인이 필요합니다.");
    } finally {
      setPosting(false);
    }
  };

  const submitReply = async (parentId) => {
    const content = replyContent.trim();
    if (!content) return;
    try {
      setPosting(true);
      await addComment({ postId, content, parentId });
      setReplyContent("");
      setReplyOpenId(null);
      await fetchComments();
    } catch (e) {
      console.error("대댓글 등록 실패:", e);
      alert("로그인이 필요합니다.");
    } finally {
      setPosting(false);
    }
  };

  const toggleReplySection = (commentId) => {
    setOpenReplies((prev) => {
      const nextOpen = !prev[commentId];
      const next = { ...prev, [commentId]: nextOpen };
      if (nextOpen) {
        setReplyOpenId(commentId);
      } else if (replyOpenId === commentId) {
        setReplyOpenId(null);
        setReplyContent("");
      }
      return next;
    });
  };

  const startEdit = (comment) => {
    setEditingId(comment.commentId);
    setEditingContent(comment.content || "");
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingContent("");
  };
  const saveEdit = async () => {
    const content = editingContent.trim();
    if (!editingId || !content) return;
    try {
      setPosting(true);
      await modifyComment(editingId, content);
      setEditingId(null);
      setEditingContent("");
      await fetchComments();
    } catch (e) {
      console.error("댓글 수정 실패:", e);
      alert("댓글 수정 실패");
    } finally {
      setPosting(false);
    }
  };

  const doDelete = async (commentId) => {
    if (!window.confirm("댓글을 삭제할까요?")) return;
    try {
      setPosting(true);
      await removeComment(commentId);
      await fetchComments();
    } catch (e) {
      console.error("댓글 삭제 실패:", e);
      alert("댓글 삭제 실패");
    } finally {
      setPosting(false);
    }
  };

  const renderOne = (c, isChild = false) => {
    const byId =
      myUserId != null &&
      c?.userId != null &&
      Number(myUserId) === Number(c.userId);
    const byNick =
      myNickname && c?.nickname && String(myNickname) === String(c.nickname);
    const isMine = byId || byNick;

    const isEditing = editingId === c.commentId;

    return (
      <div>
        <div className="flex items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-base-content/60">
              <span className="font-medium text-base-content">
                ✍ {c.nickname ?? "익명"}
              </span>
              <span>•</span>
              <span>{fmt(c.createdAt)}</span>
            </div>

            {!isEditing ? (
              <div className="mt-1 whitespace-pre-wrap text-base-content">
                {c.content}
              </div>
            ) : (
              <div className="mt-2">
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={posting || !editingContent.trim()}
                    onClick={saveEdit}
                    className={`btn btn-secondary btn-sm ${
                      posting || !editingContent.trim() ? "btn-disabled" : ""
                    }`}
                  >
                    저장
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn btn-accent btn-sm"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {!isChild && (
                <button
                  type="button"
                  onClick={() => toggleReplySection(c.commentId)}
                  className="btn btn-link btn-xs text-secondary no-underline"
                >
                  {openReplies[c.commentId]
                    ? "답글 숨기기"
                    : `답글 달기/보기${
                        Array.isArray(c.children) && c.children.length
                          ? ` (${c.children.length})`
                          : ""
                      }`}
                </button>
              )}

              {isMine && !isEditing && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="btn btn-secondary btn-xs"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => doDelete(c.commentId)}
                    className="btn btn-warning btn-xs"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {!isChild && openReplies[c.commentId] && (
              <div className="mt-3 pl-4 border-l border-base-300/50">
                <div className="mb-3">
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={2}
                    placeholder="대댓글을 입력하세요"
                    value={replyOpenId === c.commentId ? replyContent : ""}
                    onChange={(e) => {
                      if (replyOpenId !== c.commentId) {
                        setReplyOpenId(c.commentId);
                        setReplyContent(e.target.value);
                      } else {
                        setReplyContent(e.target.value);
                      }
                    }}
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyContent("");
                        setReplyOpenId(null);
                      }}
                      className="btn btn-accent btn-sm"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      disabled={
                        posting ||
                        !replyContent.trim() ||
                        replyOpenId !== c.commentId
                      }
                      onClick={() => submitReply(c.commentId)}
                      className={`btn btn-secondary btn-sm ${
                        posting ||
                        !replyContent.trim() ||
                        replyOpenId !== c.commentId
                          ? "btn-disabled"
                          : ""
                      }`}
                    >
                      등록
                    </button>
                  </div>
                </div>

                {Array.isArray(c.children) && c.children.length > 0 && (
                  <ul className="space-y-3">
                    {c.children.map((ch) => (
                      <li key={ch.commentId} className="flex items-start">
                        <div className="flex-1">{renderOne(ch, true)}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={className}>
      <div ref={topRef} />
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-lg font-semibold text-secondary">댓글</h3>
        <span className="badge badge-ghost badge-sm">총 {total}개</span>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          <div className="mb-4">
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              placeholder="댓글을 입력하세요"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                disabled={posting || !newContent.trim()}
                onClick={submitNewComment}
                className={`btn btn-secondary btn-sm ${
                  posting || !newContent.trim() ? "btn-disabled" : ""
                }`}
              >
                등록
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-6 text-base-content/50 text-center">
              불러오는 중…
            </div>
          ) : list.length === 0 ? (
            <div className="py-6 text-base-content/60 text-center">
              첫 댓글을 남겨보세요 ✍️
            </div>
          ) : (
            <ul className="divide-y divide-base-300/50">
              {list.map((c) => (
                <li key={c.commentId} className="py-3">
                  {renderOne(c, false)}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={!canPrev}
              onClick={() => goPage(page - 1)}
              className={`btn btn-base-200 btn-sm ${
                !canPrev ? "btn-disabled" : ""
              }`}
            >
              이전
            </button>
            <span className="text-sm text-base-content/70">
              {meta.totalPages === 0 ? 0 : page + 1} / {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={!canNext}
              onClick={() => goPage(page + 1)}
              className={`btn btn-base-200 btn-sm ${
                !canNext ? "btn-disabled" : ""
              }`}
            >
              다음
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardCommentListComponent;
