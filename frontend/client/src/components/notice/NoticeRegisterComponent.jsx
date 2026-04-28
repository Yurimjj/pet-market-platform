// 공지사항 등록
import { useState } from "react";
import { postNotice } from "../../api/NoticeApi.jsx";
import ResultModal from "../common/ResultModal";
import useCustomMove from "../../hooks/useCustomMove";

const initState = {
  title: "",
  content: "", // 내용 필드 추가
  isPublished: true,
};

const NoticeRegisterComponent = () => {
  const [notice, setNotice] = useState({ ...initState });
  const [result, setResult] = useState(null);
  const { moveToList } = useCustomMove();

  const handleChangeNotice = (e) => {
    const { name, value, type } = e.target;
    if (name === "isPublished") {
      setNotice((prevNotice) => ({
        ...prevNotice,
        [name]: value === "true" ? true : false,
      }));
    } else {
      setNotice((prevNotice) => ({
        ...prevNotice,
        [name]: value,
      }));
    }
  };

  const handleClickAdd = () => {
    console.log("전송할 공지사항 데이터:", notice);
    console.log("API 호출 경로:", "http://localhost:8080/notices/");

    postNotice(notice)
      .then((result) => {
        console.log("API 호출 결과:", result);
        setResult("공지사항 등록이 완료되었습니다.");
        setNotice({ ...initState });
      })
      .catch((e) => {
        console.error("API 호출 중 오류 발생:", e.message);
        console.error("전체 에러 객체:", e); // 전체 에러 객체를 로그로 출력
      });
  };

  const closeModal = () => {
    setResult(null);
    moveToList();
  };

  return (
    <section>
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            공지사항 작성
          </h2>

          <div className="space-y-4 mt-2">
            {/* 제목 */}
            <div>
              <label className="block mb-1 font-medium">제목</label>
              <input
                className="input input-bordered w-full
                  focus:outline-none focus:ring-2 focus:ring-secondary/40
                  focus:ring-offset-2 focus:ring-offset-base-100
                  focus:border-secondary
                  transition-[box-shadow,border-color] duration-150"
                name="title"
                type="text"
                value={notice.title}
                onChange={handleChangeNotice}
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block mb-1 font-medium">내용</label>
              <textarea
                className="textarea textarea-bordered w-full
                  focus:outline-none focus:ring-2 focus:ring-secondary/40
                  focus:ring-offset-2 focus:ring-offset-base-100
                  focus:border-secondary
                  transition-[box-shadow,border-color] duration-150"
                name="content"
                rows={16}
                value={notice.content}
                onChange={handleChangeNotice}
              />
            </div>

            {/* 게시여부 */}
            <div>
              <label className="block mb-1 font-medium">게시여부</label>
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2">
                  <input
                    className="radio radio-secondary"
                    type="radio"
                    name="isPublished"
                    value="true"
                    checked={notice.isPublished === true}
                    onChange={handleChangeNotice}
                  />
                  <span>게시</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    className="radio radio-error"
                    type="radio"
                    name="isPublished"
                    value="false"
                    checked={notice.isPublished === false}
                    onChange={handleChangeNotice}
                  />
                  <span>미게시</span>
                </label>
              </div>
            </div>

            {/* 버튼 그룹 (Modify와 동일 정렬/톤) */}
            <div className="flex justify-end gap-2 pt-2 border-t border-base-300/50">
              <button
                type="button"
                className="btn btn-accent"
                onClick={moveToList}
              >
                목록
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClickAdd}
              >
                작성
              </button>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <ResultModal title={"알림"} content={result} callbackFn={closeModal} />
      )}
    </section>
  );
};

export default NoticeRegisterComponent;
