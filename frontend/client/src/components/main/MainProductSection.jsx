// client/src/components/main/MainProductSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listProducts } from "../../api/productApi";
import ProductCard from "../product/ProductCard";

/** 현재 Tailwind 브레이크포인트와 동일하게 그리드 열 수 계산 */
function useGridCols() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const mq = {
      sm: window.matchMedia("(min-width: 640px)"),
      md: window.matchMedia("(min-width: 768px)"),
      xl: window.matchMedia("(min-width: 1280px)"),
      // 필요하면 2xl도 추가 가능: (min-width: 1536px)
    };

    const update = () => {
      if (mq.xl.matches) setCols(4); // xl:grid-cols-4
      else if (mq.md.matches) setCols(3); // md:grid-cols-3
      else if (mq.sm.matches) setCols(2); // sm:grid-cols-2
      else setCols(1);
    };

    update();
    Object.values(mq).forEach((m) => m.addEventListener?.("change", update));
    return () =>
      Object.values(mq).forEach((m) =>
        m.removeEventListener?.("change", update)
      );
  }, []);

  return cols;
}

export default function MainProductSection({
  size = 6, // 최소 보장 개수
  title = "지금 올라온 상품",
  rows = 2, // 한 화면에 채울 줄 수
}) {
  const cols = useGridCols();
  const targetCount = useMemo(
    () => Math.max(size, cols * rows),
    [size, cols, rows]
  );

  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    listProducts({ page: 1, size: targetCount })
      .then((res) => {
        if (cancelled) return;
        const raw = res?.data ?? res;
        const list =
          raw.items ??
          raw.dtoList ??
          raw.content ??
          raw.list ??
          (Array.isArray(raw) ? raw : []);
        setItems(list);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error("[MainProductSection] fetch error:", e);
        setErr(e?.message || "fetch error");
        setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [targetCount]);

  // 화면에서 보기 좋게 “마지막 줄을 꽉 채우기” 위해 부족분을 계산
  const padCount = useMemo(() => {
    if (!items || items.length === 0) return 0;
    const remain = items.length % cols;
    return remain === 0 ? 0 : cols - remain;
  }, [items, cols]);

  return (
    <section className="card bg-base-100 shadow-sm border border-base-300/50">
      <div className="card-body p-5 sm:p-6">
        {/* 섹션 헤더 */}
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-secondary">
            {title}
          </h2>
          <Link
            to="/product/list?page=1"
            className="btn btn-success btn-sm sm:btn-md"
          >
            상품 전체 보기 →
          </Link>
        </div>

        {err && (
          <div className="alert alert-error text-sm rounded-box">
            <span>메인 상품 불러오기 에러: {err}</span>
          </div>
        )}

        {/* 로딩 스켈레톤 */}
        {items === null && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 auto-rows-fr">
            {Array.from({ length: targetCount }).map((_, i) => (
              <div
                key={i}
                className="card bg-base-100 border border-base-300/40 rounded-box shadow-sm p-4 h-full"
              >
                <div className="skeleton aspect-[4/3] rounded-box" />
                <div className="mt-3 skeleton h-4 rounded-full" />
                <div className="mt-2 skeleton h-4 w-1/2 rounded-full" />
                <div className="mt-auto skeleton h-4 w-24 rounded-full" />
              </div>
            ))}
          </div>
        )}

        {/* 빈 결과 */}
        {items && items.length === 0 && !err && (
          <div className="card bg-base-100 border border-base-300/40 rounded-box shadow-sm p-8 text-center">
            <span className="text-base-content/70">
              아직 등록된 상품이 없습니다.
            </span>
          </div>
        )}

        {/* 실제 목록 */}
        {items && items.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 auto-rows-fr">
            {items.slice(0, targetCount).map((it) => (
              <div key={it.productId ?? it.id} className="h-full">
                <ProductCard item={it} />
              </div>
            ))}

            {/* 데이터가 부족할 때 “더 보기” 카드로 마지막 줄 채우기 */}
            {padCount > 0 &&
              Array.from({ length: padCount }).map((_, i) => (
                <Link
                  key={`pad-${i}`}
                  to="/product/list?page=1"
                  className="card bg-base-100 border border-dashed border-base-300/70 rounded-box shadow-sm p-4 h-full
                             hover:border-secondary/60 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center h-full text-base-content/60">
                    <div className="text-3xl mb-2">＋</div>
                    <div className="font-medium">더 많은 상품 보기</div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
