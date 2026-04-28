import React from "react";

export default function PetCard({ pet, onRead, onModify, onRemove }) {
  const img = pet.photoUrl || pet.imageUrl || "";

  return (
    // ✅ 고정폭 제거하고 셀 가로폭에 맞춤
    <div className="card bg-base-100 border border-base-300/50 shadow-sm p-6 w-full h-full flex flex-col">
      {/* 아바타 */}
      <div className="w-28 h-28 mx-auto rounded-full overflow-hidden bg-base-100">
        {img ? (
          <img
            src={img}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-base-content/40">
            No Image
          </div>
        )}
      </div>

      {/* 기본 정보 */}
      <div className="mt-4 text-center">
        <div className="font-semibold text-lg truncate">{pet.name}</div>
        <div className="text-sm text-base-content/60 mt-1">
          {pet.typeName ?? pet.petTypeText ?? "-"} · {pet.bodyType ?? "-"} ·{" "}
          {pet.age ?? 0}살
        </div>
      </div>

      {/* 액션: 카드 하단으로 밀어넣기 */}
      <div className="mt-auto pt-4 flex justify-center gap-2">
        {onRead && (
          <button
            className="btn btn-sm btn-neutral"
            onClick={() => onRead(pet.id)}
          >
            보기
          </button>
        )}
        {onModify && (
          <button
            className="btn btn-sm btn-success"
            onClick={() => onModify(pet.id)}
          >
            수정
          </button>
        )}
        {onRemove && (
          <button
            className="btn btn-sm btn-error"
            onClick={() => onRemove(pet.id)}
          >
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
