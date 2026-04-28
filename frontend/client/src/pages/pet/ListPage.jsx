// [ADD] client/src/pages/pet/ListPage.jsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import BasicMenu from "../../components/menus/BasicMenu";
import PetListComponent from "../../components/pet/PetListComponent";

export default function ListPage() {
  const [sp] = useSearchParams();
  const ownerIdParam = sp.get("ownerId");
  const ownerId = ownerIdParam ? Number(ownerIdParam) : null;

  // ownerId가 있으면 공개보기(readOnly), 없으면 내 목록(기존과 동일)
  const readOnly = !!ownerId;
  const hideRegister = !!ownerId;

  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      <BasicMenu />
      <main className="flex-grow flex justify-center items-start py-8 px-4">
        <div className="w-full max-w-5xl space-y-4">
          <h1 className="text-xl font-semibold text-base-content">반려가족</h1>
          <PetListComponent
            embedded
            readOnly={readOnly}
            hideRegister={hideRegister}
            ownerId={ownerId}
            pageSize={12}
          />
        </div>
      </main>
    </div>
  );
}
