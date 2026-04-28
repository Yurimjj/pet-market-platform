// [CHG] client/src/components/pet/PetListComponent.jsx
import React, { useEffect, useState } from "react";
import { getPetList, removePet } from "../../api/petApi";
import PetCard from "./PetCard";
import { useNavigate } from "react-router-dom";

export default function PetListComponent({
  embedded = false,
  hideRegister = false,
  onRead,
  onModify,
  onRegister,
  pageSize = 10,
  // [ADD] 공개 보기 지원
  ownerId = null, // 특정 유저의 펫 목록 보기
  readOnly = false, // 공개 보기에서 수정/삭제 숨김
}) {
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [fetching, setFetching] = useState(false);

  // ⬇️ 기존 goRead 교체
  const goRead =
    onRead ||
    ((id) => {
      const from = ownerId ? "publicPetList" : "myPetList";
      nav(`/pet/read/${id}`, { state: { from, ownerId } });
    });
  const goModify = onModify || ((id) => nav(`/pet/modify/${id}`));
  const goRegister = onRegister || (() => nav("/pet/register"));

  const load = async () => {
    try {
      setFetching(true);
      // [CHG] ownerId가 있으면 mine=false로 타 유저 목록 조회
      const data = await getPetList({
        page: 1,
        size: pageSize,
        ownerId: ownerId ?? null,
        mine: ownerId ? false : true,
      });
      const list =
        data?.content || data?.dtoList || data?.list || data?.items || [];
      const mapped = list.map((p) => ({
        id: p.petId ?? p.id ?? p.pet_id,
        name: p.name,
        age: p.age,
        bodyType: p.bodyType ?? p.body_type,
        typeName: p.typeName ?? p.petTypeText,
        photoUrl: p.photoUrl,
      }));
      setItems(mapped);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    load();
  }, [pageSize, ownerId]);

  const handleRemove = async (id) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    await removePet(id);
    await load();
  };

  const showActions = !readOnly;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">나의 반려가족</h2>
        {!(embedded || hideRegister || readOnly) && (
          <button className="btn btn-secondary btn-sm" onClick={goRegister}>
            등록
          </button>
        )}
      </div>

      {fetching ? (
        <div className="py-12 text-center text-base-content/60">Loading...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center text-base-content/60">
          등록된 프로필이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {items.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              onRead={goRead}
              onModify={showActions ? goModify : undefined}
              onRemove={showActions ? handleRemove : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
