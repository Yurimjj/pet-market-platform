// client/src/components/user/ReservedAsSellerList.jsx
import React, { useEffect, useState } from "react";
import { listMyReservedAsSeller } from "../../api/orderApi";
import ProductCard from "../product/ProductCard";

export default function ReservedAsSellerList({ pageSize = 6 }) {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    listMyReservedAsSeller({ page, size: pageSize })
      .then((res) => setData(res))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <>
      {data.items.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          예약 처리된 내 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((it) => (
            <ProductCard key={it.productId} item={it} />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-2 mt-4">
        {data.pageInfo.prev && (
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage(page - 1)}
          >
            이전
          </button>
        )}
        <span className="px-2">{data.pageInfo.page}</span>
        {!data.pageInfo.last && (
          <button
            className="px-3 py-1 rounded border"
            onClick={() => setPage(page + 1)}
          >
            다음
          </button>
        )}
      </div>
    </>
  );
}
