import React, { useEffect, useState } from "react";
import { listMyPurchasedProducts } from "../../api/productApi";
import ProductCard from "../product/ProductCard";

export default function PurchasedHistoryList({ pageSize = 3 }) {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // 1-base

  useEffect(() => {
    setLoading(true);
    listMyPurchasedProducts({ page, size: pageSize })
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  if (loading) return <div className="text-sm text-gray-500">로딩중…</div>;

  const info = data?.pageInfo ?? {};
  const curPage = info.page ?? page;

  const totalPages =
    (Array.isArray(info.pageNumList) ? info.pageNumList.length : undefined) ??
    data?.totalPages ??
    0;

  const canPrev = !!info.prev;
  const canNext = !!info.next;

  if ((!data.items || data.items.length === 0) && totalPages === 0) {
    return <div className="text-sm text-gray-500">구매 내역이 없습니다.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((it) => (
          <ProductCard key={it.productId} item={it} />
        ))}
      </div>

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
