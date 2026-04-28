// client/src/pages/MainPages.jsx
import React from "react";
import BasicLayout from "../layouts/BasicLayout";
import HeroSection from "../components/main/HeroSection";
import MainProductSection from "../components/main/MainProductSection";
import OwnerIntro from "../components/main/OwnerIntro";
import MainBoardSection from "../components/main/MainBoardSection";

export default function MainPages() {
  return (
    <BasicLayout>
      <div
        data-theme="petcycle"
        className="space-y-8 p-4 sm:p-6 bg-base-200 min-h-screen"
      >
        <HeroSection />

        {/* 모바일: 프로필 → 상품 → 게시판
            데스크탑(lg↑): 3열 그리드, 상품이 2행을 span */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 프로필 (좌 상단) */}
          <div className="lg:col-span-1">
            <OwnerIntro />
          </div>

          {/* 상품 (우측, 두 행 span) */}
          <div className="lg:col-span-2 lg:row-span-2">
            {/* MainProductSection이 높이를 꽉 채우도록 하고 싶다면 fullHeight props 유지 */}
            <MainProductSection size={12} fullHeight />
          </div>

          {/* 게시판 (좌 하단) */}
          <div className="lg:col-span-1">
            <MainBoardSection
              size={5}
              title="최신 게시글"
              moreHref="/board/list?page=1"
            />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
}
