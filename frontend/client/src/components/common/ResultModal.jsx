// 등록/수정/삭제의 처리 결과를 보여준다.
const ResultModal = ({ title, content, callbackFn }) => {
  // callbackFn 에 는 closeModal() 함수가 넘어온다.
  return (
    // 책 예제 코드에서는 투명도가 적용이 안되어서 , 아래 코드(4번라인)로 수정함
    <div
      className={`fixed inset-0 z-[1055] flex h-full w-full items-center justify-center bg-base-content/30 backdrop-blur-sm`}
      onClick={() => {
        if (callbackFn) {
          //div 영역과 아래쪽에 버튼 부분에 callbackFn 을 설정해서 종료 되도록 하고 있다.
          callbackFn();
        }
      }}
    >
      {/* 모달 본문 - 클릭 이벤트 버블링 차단! 책 예제대로 하면 모달창 이 안닫힘*/}
      <div className="relative card bg-base-100 shadow-xl border border-base-300/50 w-full max-w-lg mx-4 rounded-2xl">
        <div className="px-5 py-4 text-lg lg:text-xl font-semibold text-secondary border-b border-base-300/50">
          {title}
        </div>
        <div className="px-5 py-6 text-2xl font-bold text-success-content text-center">
          {content}
        </div>
        <div className="px-5 py-4 border-t border-base-300/50 justify-end flex">
          <button
            className="btn btn-secondary"
            onClick={() => {
              if (callbackFn) {
                callbackFn();
              }
            }}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
