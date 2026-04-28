// src/pages/pet/RegisterPage.jsx
import React from "react";
import BasicMenu from "../../components/menus/BasicMenu";
import PetRegisterComponent from "../../components/pet/PetRegisterComponent";

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen bg-base-200">
      {/* 상단 메뉴 */}
      <BasicMenu />

      {/* 본문 영역 */}
      <main className="flex-grow flex justify-center items-start py-8 px-4">
        <div className="w-full max-w-3xl">
          <PetRegisterComponent />
        </div>
      </main>
    </div>
  );
}
