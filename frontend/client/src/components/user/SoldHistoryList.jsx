import React, { useEffect, useState } from "react";
import { listMySoldProducts } from "../../api/productApi";
import ProductCard from "../product/ProductCard";

export default function SoldHistoryList({ userId, pageSize = 3 }) {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // 1-base

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    listMySoldProducts({ userId, page, size: pageSize })
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [userId, page, pageSize]);

  if (!userId)
    return <div className="text-sm text-gray-500">사용자 정보를 불러오는 중…</div>;
  if (loading) return <div className="text-sm text-gray-500">로딩중…</div>;

  const info = data?.pageInfo ?? {};
  const curPage = info.page ?? page;

  // ✅ 이 프로젝트의 페이징 규격에 맞춰 버튼/페이지수 파생값 계산
  const totalPages =
    (Array.isArray(info.pageNumList) ? info.pageNumList.length : undefined) ??
    data?.totalPages ??
    0;

  const canPrev = !!info.prev; // 첫 페이지면 false
  const canNext = !!info.next; // 마지막이면 false

  // 아무 것도 없으면 안내 문구
  if ((!data.items || data.items.length === 0) && totalPages === 0) {
    return <div className="text-sm text-gray-500">판매 내역이 없습니다.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((it) => (
          <ProductCard key={it.productId} item={it} />
        ))}
      </div>

      {/* 페이지 네비게이션 */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {canPrev && (
          <button
            className="px-3 py-1 rounded border"
            onClick={() =>
              setPage(info.prevPage ? info.prevPage : Math.max(1, curPage - 1))
            }
          >
            이전
          </button>
        )}

        {/* ✅ 중앙 표시는 항상 "현재 / 총" 형태로. 총 페이지가 없으면 현재 페이지로 대체 */}
        <span className="text-sm">
          {curPage} / {totalPages > 0 ? totalPages : curPage}
        </span>

        {canNext && (
          <button
            className="px-3 py-1 rounded border"
            onClick={() =>
              setPage(
                info.nextPage
                  ? info.nextPage
                  : totalPages
                    ? Math.min(totalPages, curPage + 1)
                    : curPage + 1
              )
            }
          >
            다음
          </button>
        )}
      </div>
    </>
  );
}
