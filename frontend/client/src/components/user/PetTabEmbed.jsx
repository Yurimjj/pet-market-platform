// client/src/components/user/PetTabEmbed.jsx
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";

// 프로젝트 경로에 맞춰 주세요
const PetList = React.lazy(() => import("../pet/PetListComponent"));

export default function PetTabEmbed() {
  const navigate = useNavigate();

  // [CHG] 읽기 진입 시 state 전달 → PetRead에서 목록 버튼이 프로필 탭으로 복귀
  const onRead = (petId) =>
    navigate(`/pet/read/${petId}`, { state: { from: "profileTabPET" } });
  const onModify = (petId) => navigate(`/pet/modify/${petId}`);
  const onRegister = () => navigate(`/pet/register`);

  return (
    <div className="space-y-4">
      {/* ✅ 한 개만 유지: 펫 등록 */}
      <div>
        <button className="btn btn-success" onClick={onRegister}>
          반려가족 프로필 등록
        </button>
      </div>

      <Suspense
        fallback={
          <div className="text-center py-8 text-base-content/60">
            펫 목록 불러오는 중…
          </div>
        }
      >
        {/* ✅ 리스트 내부의 '등록' 버튼 숨김 */}
        <PetList embedded hideRegister onRead={onRead} onModify={onModify} />
      </Suspense>
    </div>
  );
}
