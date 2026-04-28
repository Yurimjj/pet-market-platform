import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const [q, setQ] = useState("");
  const nav = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    const keyword = q.trim();
    nav(
      keyword
        ? `/product/list?page=1&keyword=${encodeURIComponent(keyword)}`
        : `/product/list?page=1`
    );
  };

  return (
    <section className="card bg-base-100 shadow-sm border border-base-300/50">
      <div className="card-body p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary">
              지금 가장 핫한 중고 반려용품
            </h1>
            <p className="text-base-content/70 mt-1">
              최근 등록된 상품을 메인에서 바로 확인하세요.
            </p>
          </div>

          {/* 검색 폼 */}
          <form onSubmit={onSubmit} className="w-full sm:w-auto">
            <div className="join w-full sm:w-auto">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                type="text"
                placeholder="제목·태그로 검색"
                className="input input-bordered input-secondary join-item w-full sm:w-80
                focus:outline-none focus:ring-2 focus:ring-secondary/40
                focus:ring-offset-2 focus:ring-offset-base-100
                transition-[box-shadow,border-color] duration-150"
              />
              <button type="submit" className="btn btn-secondary join-item">
                검색
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
