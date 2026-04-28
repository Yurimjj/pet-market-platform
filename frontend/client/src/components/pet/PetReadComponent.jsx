// client/src/components/pet/PetReadComponent.jsx
import React, { useEffect, useState } from "react";
import { getPet, removePet } from "../../api/petApi";
// [CHG] 목록 되돌림을 위해 useLocation 추가
import { useNavigate, useParams, useLocation } from "react-router-dom";
// [ADD] 소유자 판별을 위해 로그인 정보 사용
import { useSelector } from "react-redux";

const DEFAULT_IMG = "/no_image.png";

export default function PetReadComponent() {
  const nav = useNavigate();
  const location = useLocation(); // [ADD]
  const { petId } = useParams();
  const loginState = useSelector((s) => s.LoginSlice); // [ADD]

  const [pet, setPet] = useState(null);
  const [fetching, setFetching] = useState(false);

  // [ADD] 어디서 왔는지(state) 파악 → 목록 버튼 목적지 결정에 사용
  // - publicPetList: /pet/list?ownerId=...
  // - profileTabPET: /user/profile?tab=PET
  // - myPetList:     /pet/list
  const from = location.state?.from;
  const ownerIdFromState = location.state?.ownerId;

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const data = await getPet(petId);
        const normalized = {
          id: data.petId ?? data.id ?? data.pet_id,
          name: data.name ?? "",
          petTypeId:
            Number(data.petTypeId ?? data.pet_type_id ?? data.typeId) || 3,
          bodyType: data.bodyType ?? data.body_type ?? "MEDIUM",
          age: Number(data.age ?? 0) || 0,
          gender: data.gender ?? "MALE",
          neutered: Boolean(data.neutered),
          description: data.description ?? data.content ?? "",
          photoUrl: data.photoUrl ?? "",
          // [ADD] 소유자 판별용 ownerId 보강 (응답 내 존재 가능한 여러 키 대응)
          ownerId:
            data.ownerId ??
            data.userId ??
            data.user?.userId ??
            data.userInfo ??
            data.owner?.id ??
            null,
        };
        setPet(normalized);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [petId]);

  // [ADD] 로그인한 사용자 ID 안전 추출(구조 차이 대응)
  const loggedUserId =
    loginState?.userId ??
    loginState?.id ??
    loginState?.user?.userId ??
    loginState?.user?.id ??
    null;

  // [ADD] 소유자 여부 판단
  const isOwner =
    loggedUserId && pet?.ownerId
      ? String(loggedUserId) === String(pet.ownerId)
      : false;

  // [ADD] 목록 버튼이 돌아갈 경로 결정
  const backTo =
    from === "publicPetList" && ownerIdFromState
      ? `/pet/list?ownerId=${ownerIdFromState}`
      : from === "profileTabPET"
      ? `/user/profile?tab=PET`
      : from === "myPetList"
      ? `/pet/list`
      : `/pet/list`; // 직진입 등 기타 경우 기본값

  const onRemove = async () => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await removePet(petId);
    alert("삭제되었습니다.");
    // [CHG] 삭제 후에도 사용자가 오던 곳으로 되돌림
    nav(backTo);
  };

  if (fetching)
    return (
      <div className="py-12 text-center text-base-content/60">Loading...</div>
    );
  if (!pet)
    return (
      <div className="py-12 text-center text-base-content/60">
        데이터가 없습니다.
      </div>
    );

  return (
    <div className="max-w-3xl">
      <div className="card bg-base-100 border border-base-300/50 shadow-sm">
        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="mx-auto md:mx-0">
              <div className="w-36 h-36 md:w-48 md:h-48 bg-base-100 rounded-full overflow-hidden">
                <img
                  src={pet.photoUrl || DEFAULT_IMG}
                  alt={pet.name || "펫 이미지"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const fallback = window.location.origin + DEFAULT_IMG;
                    if (e.currentTarget.src !== fallback) {
                      e.currentTarget.src = DEFAULT_IMG;
                      e.currentTarget.onerror = null;
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0 space-y-4">
              <h2 className="text-2xl font-bold text-base-content">
                {pet.name}
              </h2>

              {/* 정보 블록 */}
              <div className="rounded-box border-2 border-success/60 p-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="badge badge-accent badge-sm">유형</span>
                    <span className="font-semibold truncate text-success-content">
                      {Number(pet.petTypeId) === 1
                        ? "강아지"
                        : Number(pet.petTypeId) === 2
                        ? "고양이"
                        : "기타"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="badge badge-accent badge-sm">체형</span>
                    <span className="font-semibold truncate text-success-content">
                      {pet.bodyType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="badge badge-accent badge-sm">나이</span>
                    <span className="font-semibold truncate text-success-content">
                      {pet.age}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="badge badge-accent badge-sm">성별</span>
                    <span className="font-semibold truncate text-success-content">
                      {pet.gender === "FEMALE" ? "암" : "수"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="badge badge-accent badge-sm">중성화</span>
                    <span className="font-semibold truncate text-success-content">
                      {pet.neutered ? "예" : "아니오"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 나의 가족 소개 */}
              <div className="rounded-box border-2 border-success/60 p-4">
                <div className="mb-2">
                  <span className="badge badge-accent badge-sm">
                    나의 가족 소개
                  </span>
                </div>
                {pet.description && (
                  <p className="text-base text-success-content whitespace-pre-wrap leading-relaxed font-semibold">
                    {pet.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="card-actions justify-end p-4 border-t border-base-200">
          {/* [CHG] 목록: 출처에 맞춰 되돌아가기 */}
          <button className="btn btn-accent" onClick={() => nav(backTo)}>
            목록
          </button>

          {/* [ADD] 소유자에게만 수정/삭제 노출 */}
          {isOwner && (
            <>
              <button
                className="btn btn-secondary"
                onClick={() => nav(`/pet/modify/${pet.id}`)}
              >
                수정
              </button>
              <button className="btn btn-error" onClick={onRemove}>
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
