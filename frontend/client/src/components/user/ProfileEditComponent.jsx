import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { modifyMember } from "../../api/UserApi";
import useCustomLogin from "../../hooks/useCustomLogin";
import ResultModal from "../common/ResultModal";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../util/CookieUtil"; // ✅ [수정] 쿠키에서 userId/토큰 가져오기 추가
import { getMyProfile } from "../../api/UserProfileApi"; // ★ added: 현재 프로필 불러오기

// ✅ [추가] 회원가입과 동일한 휴대폰 형식(010-1234-5678)
const phoneNumberRegExp = /^010-\d{4}-\d{4}$/;

const initState = {
  userId: null,
  email: "",
  pw: "",
  nickname: "",
  phoneNumber: "",
  region: "",
};

const UnifiedModifyComponent = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(initState);
  const [pwCheck, setPwCheck] = useState("");
  const [pwMatch, setPwMatch] = useState(true);
  const loginInfo = useSelector((state) => state.LoginSlice);
  const { moveToLogin } = useCustomLogin();
  const [result, setResult] = useState(null);

  // ✅ [추가] 휴대폰 유효성 상태(회원가입과 동일 메시지 표시용)
  const [phoneNumberValidity, setPhoneNumberValidity] = useState(false);

  // ★ added: 안전 병합 유틸(비어있는 값은 initState로 보강)
  const mergeMember = (base = {}, extra = {}) => {
    return {
      ...initState,
      ...base,
      ...extra,
      pw: "", // 비밀번호 입력은 항상 공란에서 시작
    };
  };

  useEffect(() => {
    // ★ changed: 기존 "Redux+쿠키만" 세팅 → 서버 프로필(getMyProfile)까지 불러와 병합
    (async () => {
      // 쿠키에서도 userId 보정 (Redux에 없을 수 있으므로)
      const cookieUser = getCookie("user");
      let uid = loginInfo?.userId ?? null;
      try {
        if (!uid && cookieUser) {
          const parsed =
            typeof cookieUser === "string"
              ? JSON.parse(cookieUser)
              : cookieUser;
          uid = parsed?.userId ?? uid;
        }
      } catch {
        /* 무시 */
      }

      // 1차: 로그인 정보 기반
      let base = {
        ...loginInfo,
        userId: uid ?? null,
      };

      // 2차: 서버 프로필로 값 보강(이메일/닉네임/휴대폰/지역 등)
      try {
        const p = await getMyProfile(); // ← 서버에서 최신 프로필 조회
        base = {
          ...base,
          userId: p?.userId ?? base.userId,
          email: p?.email ?? base.email ?? "",
          nickname: p?.nickname ?? base.nickname ?? "",
          phoneNumber: p?.phoneNumber ?? base.phoneNumber ?? "",
          region: p?.region ?? base.region ?? "",
        };
      } catch {
        // 프로필 로드 실패 시에도 기본 값으로 진행
      }

      setMember(mergeMember(base));
      setPwCheck("");
      setPwMatch(true);
    })();
  }, [loginInfo]);

  // ✅ [추가] 휴대폰 형식 실시간 검증
  useEffect(() => {
    setPhoneNumberValidity(phoneNumberRegExp.test(member.phoneNumber || ""));
  }, [member.phoneNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ [추가] 회원가입과 동일한 휴대폰 자동 하이픈 로직
    if (name === "phoneNumber") {
      let digits = value.replace(/[^0-9]/g, "");
      if (digits.length > 11) digits = digits.slice(0, 11);

      let formatted = digits;
      if (digits.length > 3 && digits.length <= 7) {
        formatted = digits.substring(0, 3) + "-" + digits.substring(3);
      } else if (digits.length > 7) {
        formatted =
          digits.substring(0, 3) +
          "-" +
          digits.substring(3, 7) +
          "-" +
          digits.substring(7, 11);
      }
      setMember({ ...member, phoneNumber: formatted });
      return;
    }

    if (name === "pw") {
      setMember({ ...member, [name]: value });
      setPwMatch(value === pwCheck);
    } else if (name === "pwCheck") {
      setPwCheck(value);
      setPwMatch(member.pw === value);
    } else {
      setMember({ ...member, [name]: value });
    }
  };

  const handleClickModify = () => {
    // ✅ [수정] 로그인/쿠키 체크 추가
    const cookieUser = getCookie("user");
    if (!cookieUser) {
      alert("로그인이 필요합니다. 다시 로그인해주세요.");
      moveToLogin("/");
      return;
    }
    if (!member.userId) {
      alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
      moveToLogin("/");
      return;
    }

    if (member.pw !== pwCheck) {
      setPwMatch(false);
      return;
    }

    // ✅ [추가] 휴대폰 형식 검증(회원가입과 동일)
    if (!phoneNumberRegExp.test(member.phoneNumber || "")) {
      alert("휴대폰 번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return;
    }

    const modifyData = {
      userId: member.userId,
      email: member.email,
      password: member.pw,
      nickname: member.nickname,
      phoneNumber: member.phoneNumber,
      region: member.region,
    };

    // ✅ [수정] 에러 처리 보강
    modifyMember(modifyData)
      .then(() => setResult("Modified"))
      .catch((err) => {
        console.error(
          "modify error:",
          err?.response?.status,
          err?.response?.data,
          err
        );
        const msg =
          err?.response?.data ??
          (err?.response?.status === 401
            ? "인증이 만료되었습니다. 다시 로그인해주세요."
            : "수정에 실패했습니다.");
        alert(msg);
        if (err?.response?.status === 401) moveToLogin("/");
      });
  };

  const closeModal = () => {
    setResult(null);
    moveToLogin("/");
  };

  const handleClickWithdrawal = () => {
    navigate("/user/withdrawal");
  };

  // ...상단 import/상태/함수들은 그대로...

  return (
    <div className="px-4 mt-6 w-full max-w-3xl mx-auto card bg-base-100 shadow-sm border border-base-300/50 p-4">
      {result && (
        <ResultModal
          title={"회원정보"}
          content={"정보수정완료"}
          callbackFn={closeModal}
        />
      )}

      {/* 비밀번호 수정 섹션 */}
      <h3 className="text-2xl lg:text-3xl text-secondary font-bold mb-4 text-center">
        비밀번호 변경
      </h3>

      <div className="w-full max-w-2xl mx-auto">
        {/* 이메일 */}
        <div className="relative mb-3 grid grid-cols-1 md:grid-cols-12 items-center gap-3">
          <div className="md:col-span-3 text-left md:text-right font-semibold text-base-content/70 px-1">
            이메일
          </div>
          <input
            className="badge badge-accent h-12 px-4 text-base cursor-not-allowed justify-start md:col-span-9 w-full"
            name="email"
            type="text"
            value={member.email}
            readOnly
          />
        </div>

        {/* 새 비밀번호 */}
        <div className="relative mb-3 grid grid-cols-1 md:grid-cols-12 items-center gap-3">
          <div className="md:col-span-3 text-left md:text-right font-semibold text-base-content/70 px-1">
            새 비밀번호
          </div>
          <input
            className="input input-bordered h-12 md:col-span-9 w-full"
            name="pw"
            type="password"
            value={member.pw}
            onChange={handleChange}
          />
        </div>

        {/* 새 비밀번호 확인 */}
        <div className="relative mb-3 grid grid-cols-1 md:grid-cols-12 items-center gap-3">
          <div className="md:col-span-3 text-left md:text-right font-semibold text-base-content/70 px-1">
            새 비밀번호 확인
          </div>
          <input
            className="input input-bordered h-12 md:col-span-9 w-full"
            name="pwCheck"
            type="password"
            value={pwCheck}
            onChange={handleChange}
          />
        </div>

        {!pwMatch && (
          <div className="grid grid-cols-1 md:grid-cols-12 mb-2">
            <p className="md:col-span-9 md:col-start-4 text-error font-semibold text-sm">
              비밀번호가 일치하지 않습니다.
            </p>
          </div>
        )}
      </div>

      <hr className="my-6 border-base-300/50" />

      {/* 프로필 정보 수정 섹션 */}
      <h3 className="text-2xl lg:text-3xl text-secondary font-bold mb-4 text-center">
        프로필 정보 수정
      </h3>

      <div className="w-full max-w-2xl mx-auto">
        {/* 닉네임 */}
        <div className="relative mb-3 grid grid-cols-1 md:grid-cols-12 items-center gap-3">
          <div className="md:col-span-3 text-left md:text-right font-semibold text-base-content/70 px-1">
            닉네임
          </div>
          <input
            className="input input-bordered h-12 md:col-span-9 w-full"
            name="nickname"
            type="text"
            value={member.nickname}
            onChange={handleChange}
          />
        </div>

        {/* 휴대폰 번호 */}
        <div className="relative mb-1 grid grid-cols-1 md:grid-cols-12 items-center gap-3">
          <div className="md:col-span-3 text-left md:text-right font-semibold text-base-content/70 px-1">
            휴대폰 번호
          </div>
          <input
            className="input input-bordered h-12 md:col-span-9 w-full"
            name="phoneNumber"
            type="text"
            value={member.phoneNumber}
            onChange={handleChange}
            inputMode="numeric"
          />
        </div>

        {/* 휴대폰 안내문 – 인풋 열에 정렬 */}
        {member.phoneNumber?.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 mb-2">
            <p
              className={`md:col-span-9 md:col-start-4 text-sm ${
                phoneNumberValidity ? "text-info" : "text-error"
              }`}
            >
              {phoneNumberValidity
                ? "사용 가능한 휴대폰 번호 형식입니다."
                : "올바르지 않은 휴대폰 번호 형식입니다. (예: 010-1234-5678)"}
            </p>
          </div>
        )}

        {/* 지역 */}
        <div className="relative mb-4 grid grid-cols-1 md:grid-cols-12 items-center gap-3">
          <div className="md:col-span-3 text-left md:text-right font-semibold text-base-content/70 px-1">
            지역
          </div>
          <select
            id="region"
            name="region"
            value={member.region}
            onChange={handleChange}
            className="select select-bordered h-12 md:col-span-9 w-full appearance-none"
            required
          >
            <option value="">지역을 선택하세요</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
            <option value="인천">인천</option>
            <option value="강원">강원</option>
            <option value="충북">충북</option>
            <option value="세종">세종</option>
            <option value="대전">대전</option>
            <option value="경북">경북</option>
            <option value="경남">경남</option>
            <option value="대구">대구</option>
            <option value="울산">울산</option>
            <option value="부산">부산</option>
            <option value="전북">전북</option>
            <option value="광주">광주</option>
            <option value="제주">제주</option>
          </select>
        </div>
      </div>

      {/* 하단 버튼 중앙 정렬 */}
      <div className="flex justify-center">
        <div className="relative mt-2 flex w-full max-w-2xl mx-auto flex-wrap justify-center gap-2 border-t border-base-300/50 pt-3">
          <button
            type="button"
            className="btn btn-secondary w-32"
            onClick={handleClickModify}
          >
            회원 정보 수정
          </button>
          <button
            type="button"
            className="btn btn-error w-32"
            onClick={handleClickWithdrawal}
          >
            탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedModifyComponent;
