import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { withdrawalMember } from "../../api/UserApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import ResultModal from "../common/ResultModal";
import { logout } from "../../slices/LoginSlice";

const initState = {
  email: "",
  pw: "",
  confirmPw: "",
};

const WithdrawalComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loginInfo = useSelector((state) => state.LoginSlice);
  const { moveToLogin } = useCustomLogin();
  const [withdrawalState, setWithdrawalState] = useState(initState);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // 초기 로딩 시 로그인 정보가 없으면 로그인 페이지로 이동
    // moveToLogin 함수가 변하지 않는다는 것을 보증할 수 없으므로,
    // 의존성 배열에서 제거하고 ESLint 규칙을 무시하도록 설정합니다.
    if (!loginInfo.email) {
      moveToLogin();
    } else {
      // 로그인 정보가 있으면 email 상태 업데이트
      setWithdrawalState((prevState) => ({
        ...prevState,
        email: loginInfo.email,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginInfo]);

  const handleChange = (e) => {
    setWithdrawalState({ ...withdrawalState, [e.target.name]: e.target.value });
  };

  const handleWithdrawal = async () => {
    if (
      window.confirm(
        "정말로 회원 탈퇴하시겠습니까? 모든 정보가 영구적으로 삭제됩니다."
      )
    ) {
      const memberData = {
        userId: loginInfo.userId,
        email: loginInfo.email,
        password: withdrawalState.pw,
      };

      try {
        const res = await withdrawalMember(memberData);

        if (res && res.result === "withdrawal") {
          setResult({ title: "성공", message: "회원 탈퇴가 완료되었습니다." });

          // Redux 상태를 비동기적으로 업데이트
          await dispatch(logout()); // await를 사용하여 로그아웃 완료를 기다립니다.

          // 로그아웃 상태가 확실히 반영된 후 페이지 이동
          moveToLogin("/");
        } else {
          setResult({
            title: "오류",
            message: res.error || "회원 탈퇴에 실패했습니다.",
          });
        }
      } catch (error) {
        console.error("회원 탈퇴 API 호출 오류:", error);
        setResult({ title: "오류", message: "비밀번호가 일치하지 않습니다." });
      }
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  const closeModal = () => {
    setResult(null); // 결과창 닫기
  };

  return (
    <div className="px-4 mt-6 w-full max-w-3xl mx-auto card bg-base-100 shadow-sm border border-base-300/50 p-4">
      <h2 className="text-2xl lg:text-3xl text-secondary font-bold mb-4 text-center">
        회원 탈퇴
      </h2>

      {/* 안쪽 폭도 통일 */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <label className="block text-base-content/70 font-semibold mb-2">
            이메일
          </label>
          <input
            type="text"
            name="email"
            value={withdrawalState.email || ""}
            className="badge badge-accent w-full h-12 px-4 text-base cursor-not-allowed justify-start"
            readOnly
          />
        </div>

        {/* 첫 번째 비밀번호 입력란 */}
        <div className="mb-4">
          <label
            className="block text-base-content/70 font-semibold mb-2"
            htmlFor="pw"
          >
            비밀번호
          </label>
          <input
            type="password"
            id="pw"
            name="pw"
            value={withdrawalState.pw}
            onChange={handleChange}
            className="input input-bordered w-full h-12"
            placeholder="비밀번호를 입력해주세요"
            required
          />
        </div>

        {/* 두 번째 비밀번호 확인 입력란 */}
        <div className="mb-2">
          <label
            className="block text-base-content/70 font-semibold mb-2"
            htmlFor="confirmPw"
          >
            비밀번호 확인
          </label>
          <input
            type="password"
            id="confirmPw"
            name="confirmPw"
            value={withdrawalState.confirmPw}
            onChange={handleChange}
            className="input input-bordered w-full h-12"
            placeholder="비밀번호를 다시 입력해주세요"
            required
          />
          {/* 비밀번호 일치 여부 메시지 */}
          {withdrawalState.pw &&
            withdrawalState.confirmPw &&
            withdrawalState.pw === withdrawalState.confirmPw && (
              <p className="text-sm text-info mt-2">비밀번호가 일치합니다.</p>
            )}
          {withdrawalState.pw &&
            withdrawalState.confirmPw &&
            withdrawalState.pw !== withdrawalState.confirmPw && (
              <p className="text-sm text-error mt-2">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
        </div>

        {/* 버튼 영역: 중앙 정렬 + 통일된 버튼 톤 */}
        <div className="flex justify-center gap-2 pt-3 border-t border-base-300/50 mt-6">
          <button
            type="button"
            onClick={handleWithdrawal}
            className={`btn w-32 ${
              withdrawalState.pw &&
              withdrawalState.pw === withdrawalState.confirmPw
                ? "btn-error"
                : "btn-disabled"
            }`}
            disabled={
              !(
                withdrawalState.pw &&
                withdrawalState.pw === withdrawalState.confirmPw
              )
            }
          >
            탈퇴
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-success w-32"
          >
            취소
          </button>
        </div>
      </div>

      {result && (
        <ResultModal
          title={result.title}
          content={result.message}
          callback={closeModal}
        />
      )}
    </div>
  );
};

export default WithdrawalComponent;
