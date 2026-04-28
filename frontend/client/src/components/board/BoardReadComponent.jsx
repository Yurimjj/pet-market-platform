import React, { useEffect, useState } from "react";
import { getPostOne, getFile } from "../../api/board/PostApi";
import useCustomMove from "../../hooks/useCustomMove";
import { getCookie } from "../../util/CookieUtil";
import { Link } from "react-router-dom";

const initState = {
  postId: 0,
  userInfo: null,
  title: "",
  nickname: "",
  content: "",
  viewCount: 0,
  isDeleted: false,
  categoryName: "",
  uploadFileNames: [],
  createdAt: null,
  updatedAt: null,
};

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

const BoardReadComponent = ({ postId }) => {
  const [post, setPost] = useState(initState);
  const [modalImage, setModalImage] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const { moveToList, moveToModify } = useCustomMove();

  useEffect(() => {
    getPostOne(postId)
      .then((data) => setPost(data))
      .catch((e) => console.error("getPostOne error:", e));

    const userObj = getCookie("user");
    setCurrentUserId(userObj?.userId ?? null);
  }, [postId]);

  const imageFileRegex = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
  const imageFiles = (post.uploadFileNames || []).filter((n) =>
    imageFileRegex.test(n),
  );
  const otherFiles = (post.uploadFileNames || []).filter(
    (n) => !imageFileRegex.test(n),
  );
  const paragraphs = (post.content || "").split(/\n{2,}/);

  const canEdit =
    post.userInfo != null &&
    currentUserId != null &&
    post.userInfo === currentUserId;

  return (
    <section>
      {/* 댓글 카드와 완전 동일한 톤/사이즈 */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          {/* 제목 */}
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            {post.title || "제목 없음"}
          </h2>

          {/* 작성자/작성일/조회수 */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-base-content/60">
            <span className="font-medium text-base-content">
              ✍{" "}
              {post.userInfo ? (
                <Link
                  to={`/pet/list?ownerId=${post.userInfo}`} // [ADD] 목록으로 이동
                  className="text-secondary hover:underline"
                  title="펫 프로필 보기"
                >
                  {post.nickname || "익명"}
                </Link>
              ) : (
                post.nickname || "익명"
              )}
            </span>
            <span>•</span>
            <span>{formatDateTime(post.createdAt)}</span>
            <span>•</span>
            <span className="badge badge-accent badge-sm">
              👁 {post.viewCount}
            </span>
            {post.categoryName && (
              <span className="badge badge-secondary badge-sm">
                {post.categoryName}
              </span>
            )}
          </div>

          {/* 썸네일: 안 잘리고 전체 보이게 */}
          {imageFiles.length > 0 && (
            <div className="mt-4 mb-2 flex flex-wrap gap-4">
              {imageFiles.map((file, idx) => (
                <img
                  key={idx}
                  src={getFile("s_" + file)}
                  alt={`thumbnail-${idx + 1}`}
                  className="rounded-box border border-base-300/50 cursor-zoom-in
                             object-contain w-auto h-auto max-w-[220px] max-h-[160px]
                             md:max-w-[260px] md:max-h-[200px] bg-base-100"
                  onClick={() => setModalImage(getFile(file))}
                />
              ))}
            </div>
          )}

          {/* 본문 */}
          {paragraphs.length === 1 && paragraphs[0] === "" ? (
            <p className="text-base-content/70">내용이 없습니다.</p>
          ) : (
            paragraphs.map((p, i) => (
              <div
                key={i}
                className="mb-3 whitespace-pre-wrap text-base-content text-base"
              >
                {p}
              </div>
            ))
          )}

          {/* 첨부파일 */}
          {otherFiles.length > 0 && (
            <div className="mt-4 border-t border-base-300/50 pt-3">
              <h6 className="card-title text-sm text-base-content/80 mb-2">
                📎 첨부파일
              </h6>
              <ul className="space-y-2">
                {otherFiles.map((file, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="badge badge-ghost badge-sm">FILE</span>
                    <a
                      href={getFile(file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-secondary break-all"
                    >
                      {file}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 이미지 모달: 원본 전체 보이게 */}
          {modalImage && (
            <div
              onClick={() => setModalImage(null)}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-[95vw] max-h-[95vh] overflow-y-auto"
              >
                <img
                  src={modalImage}
                  alt="원본 이미지"
                  className="w-full h-auto object-contain rounded-box shadow-lg"
                />
                <button
                  type="button"
                  className="btn btn-circle btn-sm absolute top-2 right-2"
                  onClick={() => setModalImage(null)}
                  aria-label="close"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* 하단 버튼: 댓글과 동일 톤 */}
          <div className="mt-4 flex justify-end gap-2 border-t border-base-300/50 pt-4">
            <button
              type="button"
              className="btn btn-accent btn-sm"
              onClick={() => moveToList()}
            >
              목록
            </button>
            {canEdit && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => moveToModify(post.postId)}
              >
                수정
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BoardReadComponent;
