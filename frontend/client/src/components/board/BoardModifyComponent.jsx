import React, { useEffect, useRef, useState } from "react";
import {
  getPostOne,
  modifyPost,
  removePost,
  removeAttachment,
  getFile,
} from "../../api/board/PostApi";
import { useNavigate } from "react-router-dom";

const MAX_FILE_COUNT = 5;

const initState = {
  postId: 0,
  title: "",
  content: "",
  categoryName: "",
  nickname: "",
  fileList: [],
};

const BoardModifyComponent = ({ postId }) => {
  const navigate = useNavigate();
  const [post, setPost] = useState(initState);
  const [newFiles, setNewFiles] = useState([]);
  const [busyId, setBusyId] = useState(null);

  // 모달 상태
  const [modalMessage, setModalMessage] = useState("");
  const [modalAction, setModalAction] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ▼▼▼ 카테고리 드롭다운(선택 시 닫히도록 제어)
  const [isCatOpen, setIsCatOpen] = useState(false);
  const catWrapRef = useRef(null);
  const catBtnRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (catWrapRef.current && !catWrapRef.current.contains(e.target)) {
        setIsCatOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsCatOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  // ▲▲▲

  // ----- 데이터 불러오기 -----
  useEffect(() => {
    if (!postId) return;
    (async () => {
      try {
        const data = await getPostOne(postId);

        const normalizedFileList =
          Array.isArray(data.attachmentList) && data.attachmentList.length
            ? data.attachmentList.map((f) => ({
                attachmentId: f.attachmentId ?? null,
                fileName: f.fileName,
              }))
            : Array.isArray(data.uploadFileNames) && data.uploadFileNames.length
              ? data.uploadFileNames.map((name) => ({
                  attachmentId: null,
                  fileName: name,
                }))
              : [];

        setPost({
          postId: data.postId,
          title: data.title || "",
          content: data.content || "",
          categoryName: data.categoryName || "자유게시판",
          nickname: data.nickname || "",
          fileList: normalizedFileList,
        });
        setNewFiles([]);
      } catch (err) {
        console.error("getPostOne error:", err);
        showModal("게시글 정보를 불러오지 못했습니다.");
      }
    })();
  }, [postId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost((prev) => ({ ...prev, [name]: value }));
  };

  // ----- 새 파일 추가 -----
  const handleNewFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    const total = post.fileList.length + newFiles.length + selected.length;

    if (total > MAX_FILE_COUNT) {
      alert(`파일은 최대 ${MAX_FILE_COUNT}개까지 첨부할 수 있습니다.`);
      e.target.value = null;
      return;
    }
    setNewFiles((prev) => [...prev, ...selected]);
  };

  const handleNewFileRemove = (fileToRemove) => {
    setNewFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  const handleExistingFileRemove = async (attachmentId, fileName) => {
    if (!attachmentId) {
      alert(
        "이 파일은 개별 삭제 ID(attachmentId)가 없어 수정 저장으로만 변경 가능합니다.",
      );
      return;
    }
    if (!window.confirm(`${fileName} 파일을 삭제하시겠습니까?`)) return;

    try {
      setBusyId(attachmentId);
      await removeAttachment(post.postId, attachmentId);
      // 상태 동기화
      setPost((prev) => ({
        ...prev,
        fileList: prev.fileList.filter((f) => f.attachmentId !== attachmentId),
      }));
      showModal("파일이 삭제되었습니다.");
    } catch (err) {
      console.error(err);
      showModal("파일 삭제 중 오류가 발생했습니다.");
    } finally {
      setBusyId(null);
    }
  };

  // ----- 수정 저장 -----
  const handleModify = async () => {
    try {
      const keepFileNames = post.fileList.map((f) => f.fileName);

      const payload = {
        boardPostDTO: {
          postId: post.postId,
          title: post.title,
          content: post.content,
          categoryName: post.categoryName,
          uploadFileNames: keepFileNames,
        },
        files: newFiles, // 새로 추가할 파일
      };

      await modifyPost(post.postId, payload);
      showModal("게시글이 수정되었습니다.", "modify");
    } catch (err) {
      console.error(err);
      showModal("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  // ----- 삭제 -----
  const handleDelete = async () => {
    if (!window.confirm("게시글을 정말 삭제하시겠습니까?")) return;
    try {
      await removePost(post.postId);
      showModal("게시글이 삭제되었습니다.", "delete");
    } catch (err) {
      console.error(err);
      showModal("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  // ----- 목록 -----
  const handleList = () => navigate("/board/list");

  // ----- 모달 -----
  const showModal = (message, action = null) => {
    setModalMessage(message);
    setModalAction(action);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    if (modalAction === "modify") navigate(`/board/read/${post.postId}`);
    else if (modalAction === "delete") navigate("/board/list");
  };

  const imageFileRegex = /\.(png|jpe?g|gif|webp|bmp|svg)$/i;
  const imageFiles = post.fileList.filter((f) =>
    imageFileRegex.test(f.fileName),
  );
  const otherFiles = post.fileList.filter(
    (f) => !imageFileRegex.test(f.fileName),
  );
  const totalAttached = post.fileList.length + newFiles.length;

  const selectCategory = (value, e) => {
    setPost((prev) => ({ ...prev, categoryName: value }));
    setIsCatOpen(false);
    if (e && e.currentTarget) e.currentTarget.blur();
    if (catBtnRef.current) catBtnRef.current.blur();
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  };

  return (
    <section>
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            게시글 수정
          </h2>

          <div className="space-y-4 mt-2">
            {/* 게시글 번호 */}
            <div>
              <label className="block mb-1 font-medium">게시글 번호</label>
              <div className="w-full">
                <span className="badge badge-accent badge-lg w-full justify-center rounded-box">
                  {post.postId}
                </span>
              </div>
            </div>

            {/* 카테고리 */}
            <div>
              <label className="block mb-1 font-medium">카테고리</label>

              {/* Post와 동일 톤의 드롭다운 */}
              <div
                ref={catWrapRef}
                className={`dropdown w-full ${
                  isCatOpen ? "dropdown-open" : ""
                }`}
              >
                <div
                  ref={catBtnRef}
                  tabIndex={0}
                  role="button"
                  className="btn btn-success w-full justify-between"
                  onClick={() => setIsCatOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={isCatOpen}
                >
                  <span className="truncate">
                    {post.categoryName || "전체"}
                  </span>
                </div>

                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box border border-base-300/50 w-full"
                  role="listbox"
                >
                  <li>
                    <button
                      type="button"
                      onClick={(e) => selectCategory("자유게시판", e)}
                      role="option"
                      aria-selected={post.categoryName === "자유게시판"}
                    >
                      자유게시판
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => selectCategory("Q&A", e)}
                      role="option"
                      aria-selected={post.categoryName === "Q&A"}
                    >
                      Q&amp;A
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => selectCategory("정보공유게시판", e)}
                      role="option"
                      aria-selected={post.categoryName === "정보공유게시판"}
                    >
                      정보공유게시판
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* 제목 */}
            <div>
              <label className="block mb-1 font-medium">제목</label>
              <input
                type="text"
                name="title"
                value={post.title}
                onChange={handleChange}
                className="input input-bordered w-full
                focus:outline-none focus:ring-2 focus:ring-secondary/40
                focus:ring-offset-2 focus:ring-offset-base-100
                focus:border-secondary
                transition-[box-shadow,border-color] duration-150"
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block mb-1 font-medium">내용</label>
              <textarea
                name="content"
                rows="20"
                value={post.content}
                onChange={handleChange}
                className="textarea textarea-bordered w-full
                focus:outline-none focus:ring-2 focus:ring-secondary/40
                focus:ring-offset-2 focus:ring-offset-base-100
                focus:border-secondary
                transition-[box-shadow,border-color] duration-150"
              />
            </div>

            {/* 작성자 */}
            {post.nickname && (
              <div>
                <label className="block mb-1 font-medium">작성자</label>
                <div className="badge badge-accent badge-lg w-full justify-center rounded-box">
                  {post.nickname}
                </div>
              </div>
            )}

            {/* 첨부파일 */}
            <div>
              <label className="block mb-1 font-medium">첨부파일</label>
              <div className="rounded-box border border-base-300/50 p-4 bg-base-100">
                {/* 이미지 */}
                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {imageFiles.map((f) => (
                      <div
                        key={f.fileName}
                        className="rounded-box border border-base-300/50 p-2"
                      >
                        <img
                          src={getFile("s_" + f.fileName)}
                          alt={f.fileName}
                          className="w-full h-32 object-contain cursor-pointer bg-base-100"
                          onClick={() =>
                            window.open(getFile(f.fileName), "_blank")
                          }
                        />
                        <div className="mt-2 flex items-center justify-between text-sm">
                          <span className="truncate mr-2">{f.fileName}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleExistingFileRemove(
                                f.attachmentId,
                                f.fileName,
                              )
                            }
                            disabled={
                              !f.attachmentId || busyId === f.attachmentId
                            }
                            className={`ml-2 font-bold ${
                              !f.attachmentId || busyId === f.attachmentId
                                ? "text-base-content/20 cursor-not-allowed"
                                : "text-error hover:text-error/80"
                            }`}
                            title={
                              !f.attachmentId
                                ? "삭제 ID가 없어 개별 삭제 불가"
                                : "삭제"
                            }
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 기타 파일 */}
                {otherFiles.length > 0 && (
                  <ul className="space-y-1 mb-4">
                    {otherFiles.map((f) => (
                      <li
                        key={f.fileName}
                        className="flex items-center justify-between bg-base-200/60 p-2 rounded-box"
                      >
                        <a
                          href={getFile(f.fileName)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-secondary truncate"
                        >
                          {f.fileName}
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            handleExistingFileRemove(f.attachmentId, f.fileName)
                          }
                          disabled={
                            !f.attachmentId || busyId === f.attachmentId
                          }
                          className={`ml-2 font-bold ${
                            !f.attachmentId || busyId === f.attachmentId
                              ? "text-base-content/20 cursor-not-allowed"
                              : "text-error hover:text-error/80"
                          }`}
                          title={
                            !f.attachmentId
                              ? "삭제 ID가 없어 개별 삭제 불가"
                              : "삭제"
                          }
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* 새 파일 추가 */}
                <div className="mb-2">
                  <input
                    id="newFileInput"
                    type="file"
                    multiple
                    onChange={handleNewFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="newFileInput"
                    className="cursor-pointer flex items-center justify-center p-3 rounded-box border-2 border-dashed border-base-300/70 text-base-content/70 hover:border-secondary transition"
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      ></path>
                    </svg>
                    <span>파일 추가</span>
                  </label>
                </div>

                {/* 새로 추가된 파일 목록 */}
                {newFiles.length > 0 && (
                  <ul className="space-y-1 text-sm text-base-content/70">
                    {newFiles.map((file, i) => (
                      <li key={i} className="flex justify-between items-center">
                        <span className="truncate">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleNewFileRemove(file)}
                          className="ml-2 text-error hover:text-error/80 font-bold cursor-pointer"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="text-xs text-base-content/60 mt-2 text-center">
                  총 {totalAttached} / 최대 {MAX_FILE_COUNT}개까지 첨부
                  가능합니다.
                </p>
              </div>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex justify-end gap-2 pt-2 border-t border-base-300/50">
              <button
                type="button"
                onClick={handleModify}
                className="btn btn-secondary"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-error"
              >
                삭제
              </button>
              <button
                type="button"
                onClick={handleList}
                className="btn btn-accent"
              >
                목록
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card w-96 bg-base-100 shadow-xl border border-base-300/50">
            <div className="card-body">
              <h3 className="card-title text-lg">알림</h3>
              <p className="py-2">{modalMessage}</p>
              <div className="card-actions justify-end">
                <button onClick={closeModal} className="btn btn-primary">
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BoardModifyComponent;
