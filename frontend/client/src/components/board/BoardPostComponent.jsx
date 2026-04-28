import React, { useEffect, useRef, useState } from "react";
import { registerPost } from "../../api/board/PostApi";
import { useNavigate } from "react-router-dom";

const BoardPostComponent = () => {
  const navigate = useNavigate();
  const MAX_FILE_COUNT = 5;

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryName: "자유게시판",
  });

  const [files, setFiles] = useState([]);

  // ▼▼▼ 카테고리 드롭다운 열림 상태 제어 (선택 시 닫히도록)
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles = files.length + selectedFiles.length;

    if (totalFiles > MAX_FILE_COUNT) {
      alert(`파일은 최대 ${MAX_FILE_COUNT}개까지 첨부할 수 있습니다.`);
      e.target.value = null;
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
  };

  const handleFileRemove = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove));
  };

  const handleList = () => navigate("/board/list");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const postData = {
      boardPostDTO: {
        title: formData.title,
        content: formData.content,
        categoryName: formData.categoryName,
      },
      files,
    };

    try {
      const result = await registerPost(postData);
      console.log("등록 완료:", result);

      const postId = result?.postId;
      if (!postId) {
        alert("등록된 게시글 ID를 가져오지 못했습니다.");
        return;
      }

      navigate(`/board/read/${postId}`);
    } catch (err) {
      console.error("게시글 등록 오류:", err);
      alert("게시글 등록 중 오류가 발생했습니다.");
    }
  };

  const selectCategory = (value, e) => {
    setFormData((prev) => ({ ...prev, categoryName: value }));
    setIsCatOpen(false);

    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
    if (catBtnRef.current) {
      catBtnRef.current.blur();
    }
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  };

  return (
    <section>
      {/* 댓글/읽기 카드와 동일한 톤 */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            게시글 작성
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* 카테고리 선택 */}
            <div>
              <label className="block mb-1 font-medium">카테고리</label>

              {/* 리스트와 동일 톤의 드롭다운 스타일 */}
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
                    {formData.categoryName || "전체"}
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
                      aria-selected={formData.categoryName === "자유게시판"}
                    >
                      자유게시판
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => selectCategory("Q&A", e)}
                      role="option"
                      aria-selected={formData.categoryName === "Q&A"}
                    >
                      Q&amp;A
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={(e) => selectCategory("정보공유게시판", e)}
                      role="option"
                      aria-selected={formData.categoryName === "정보공유게시판"}
                    >
                      정보공유게시판
                    </button>
                  </li>
                </ul>
              </div>

              <p className="mt-1 text-xs text-base-content/60">
                분류를 선택하면 목록에 표시돼요.
              </p>
            </div>

            {/* 제목 입력 */}
            <div>
              <label className="block mb-1 font-medium">제목</label>
              <input
                type="text"
                name="title"
                className="input input-bordered w-full
                focus:outline-none focus:ring-2 focus:ring-secondary/40
                focus:ring-offset-2 focus:ring-offset-base-100
                focus:border-secondary
                transition-[box-shadow,border-color] duration-150"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* 내용 입력 */}
            <div>
              <label className="block mb-1 font-medium">내용</label>
              <textarea
                name="content"
                rows="20"
                className="textarea textarea-bordered w-full
                focus:outline-none focus:ring-2 focus:ring-secondary/40
                focus:ring-offset-2 focus:ring-offset-base-100
                focus:border-secondary
                transition-[box-shadow,border-color] duration-150"
                value={formData.content}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* 첨부파일 업로드 */}
            <div>
              <label className="block mb-1 font-medium">첨부파일</label>
              <div className="rounded-box border border-base-300/50 p-4 bg-base-100">
                <div className="relative mb-2">
                  <label
                    htmlFor="fileInput"
                    className="cursor-pointer flex items-center justify-center p-3 rounded-box border-2 border-dashed border-base-300/70 text-base-content/70 hover:border-secondary transition"
                  >
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      ></path>
                    </svg>
                    <span>파일 선택</span>
                  </label>
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>

                {files.length > 0 && (
                  <div className="mt-2 text-sm text-base-content/70">
                    <p className="font-medium mb-1">선택된 파일:</p>
                    <ul className="space-y-1">
                      {files.map((file, index) => (
                        <li
                          key={index}
                          className="flex justify-between items-center"
                        >
                          <span className="break-all">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleFileRemove(file)}
                            className="ml-2 text-error hover:text-error/80 font-bold"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="text-xs text-base-content/60 mt-2 text-center">
                  최대 {MAX_FILE_COUNT}개까지 첨부 가능합니다.
                </p>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-2 pt-2 border-t border-base-300/50">
              <button
                type="button"
                onClick={handleList}
                className="btn btn-accent"
              >
                목록
              </button>
              <button type="submit" className="btn btn-secondary">
                등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BoardPostComponent;
