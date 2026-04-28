// 공지사항 수정
import React, { useEffect, useState } from "react";
import { deleteOne, getOne, putOne } from "../../api/NoticeApi";
import useCustomMove from "../../hooks/useCustomMove";
import ResultModal from "../common/ResultModal";

const initState = {
  noticeId: 0,
  title: "",
  content: "",
  writerName: "",
  isPublished: false,
};

const NoticeModifyComponent = ({ nno }) => {
  const [notice, setNotice] = useState({ ...initState });

  //모달 창을 위한 상태
  const [result, setResult] = useState(null);

  //이동을 위한 기능
  const { moveToList, moveToRead } = useCustomMove();

  useEffect(() => {
    if (nno) {
      getOne(nno)
        .then((data) => setNotice(data))
        .catch((error) => console.error("데이터 로딩 중 오류 발생:", error));
    }
  }, [nno]);

  const handleClickedModify = () => {
    // 수정 버튼 클릭시
    console.log("putOne 호출 전 nno 값:", notice.nno);

    putOne(notice)
      .then((data) => {
        console.log("modify result: " + data);
        setResult("수정 완료!");
      })
      .catch((error) => {
        console.error("수정 실패:", error);
        setResult("수정 실패");
      });
  };

  const handleClickDelete = () => {
    // 삭제 버튼 클릭시
    deleteOne(nno)
      .then((data) => {
        console.log("delete result: " + data);
        setResult("Deleted");
      })
      .catch((error) => {
        console.error("삭제 실패:", error);
        setResult("삭제 실패");
      });
  };

  //모달 창이 close될때
  const closeModal = () => {
    if (result === "Deleted") {
      moveToList();
    } else {
      moveToRead(nno);
    }
  };

  // title, content 값 변경 핸들러
  const handleChangeNotice = (e) => {
    setNotice({ ...notice, [e.target.name]: e.target.value });
  };

  // isPublished 상태 변경 핸들러 (라디오 버튼용)
  const handleChangePublished = (e) => {
    setNotice((prevNotice) => ({
      ...prevNotice,
      isPublished: e.target.value === "true",
    }));
  };

  return (
    <section>
      {/* 카드 톤: BoardModifyComponent와 동일 */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            공지사항 수정
          </h2>

          <div className="space-y-4 mt-2">
            {/* 공지사항 번호 */}
            <div>
              <label className="block mb-1 font-medium">공지사항 번호</label>
              <div className="w-full">
                <span className="badge badge-accent badge-lg w-full justify-center rounded-box">
                  {notice.noticeId}
                </span>
              </div>
            </div>

            {/* 작성자 */}
            <div>
              <label className="block mb-1 font-medium">작성자</label>
              <div className="w-full">
                <span className="badge badge-accent badge-lg w-full justify-center rounded-box">
                  {notice.writerName}
                </span>
              </div>
            </div>

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
                rows={16}
                name="content"
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
                    onChange={handleChangePublished}
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
                    onChange={handleChangePublished}
                  />
                  <span>미게시</span>
                </label>
              </div>
            </div>

            {/* 버튼 그룹: BoardModify와 동일 톤/정렬 */}
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
                onClick={handleClickedModify}
              >
                수정
              </button>
              <button
                type="button"
                className="btn btn-error"
                onClick={handleClickDelete}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 모달 */}
      {result ? (
        <ResultModal
          title={"처리결과"}
          content={result}
          callbackFn={closeModal}
        />
      ) : null}
    </section>
  );
};

export default NoticeModifyComponent;
