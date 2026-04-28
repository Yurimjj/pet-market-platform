import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPostList } from "../../api/board/PostApi";

export default function MainBoardSection({
  size = 5,
  title = "최신 게시글",
  moreHref = "/board/list?page=1",
}) {
  const [items, setItems] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const data = await getPostList({ page: 1, size });
        if (ignore) return;
        const list = data?.dtoList ?? data?.content ?? data?.list ?? [];
        setItems(list);
      } catch (e) {
        console.error("[MainBoardSection] fetch error:", e);
        setErr(e?.message || "fetch error");
        setItems([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [size]);

  return (
    <section className="card bg-base-100 shadow-sm border border-base-300/50">
      <div className="card-body p-5 sm:p-6">
        {/* 헤더 */}
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-secondary">
            {title}
          </h2>
          <Link to={moreHref} className="btn btn-success btn-sm sm:btn-sm">
            더보기 →
          </Link>
        </div>

        {err && (
          <div className="alert alert-error text-sm rounded-box">
            <span>게시글을 불러오지 못했어요: {err}</span>
          </div>
        )}

        {/* 로딩 스켈레톤 */}
        {items === null && (
          <ul className="divide-y divide-base-300/50">
            {Array.from({ length: size }).map((_, i) => (
              <li key={i} className="py-3">
                <div className="flex items-start gap-3">
                  <div className="skeleton h-4 w-10 rounded" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="skeleton h-4 w-2/3 rounded" />
                    <div className="skeleton h-3 w-40 rounded" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* 비어있음 */}
        {items && items.length === 0 && !err && (
          <div className="card bg-base-100 border border-base-300/40 rounded-box shadow-sm p-8 text-center">
            <span className="text-base-content/70">아직 게시글이 없어요.</span>
          </div>
        )}

        {/* 목록 (컴팩트) */}
        {items && items.length > 0 && (
          <ul className="divide-y divide-base-300/50">
            {items.map((it) => (
              <li key={it.postId} className="py-3">
                <Link
                  to={`/board/read/${it.postId}`}
                  className="group flex items-start gap-3 min-w-0"
                >
                  {/* ID */}
                  <div className="text-sm font-semibold text-base-content/60 min-w-10 text-center pt-0.5">
                    {it.postId}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* 제목 + 카테고리 배지: 제목은 줄임표, 배지는 고정 */}
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <div className="text-base font-semibold text-base-content truncate group-hover:text-secondary">
                        {it.title}
                      </div>
                      {it.categoryName && (
                        <span className="badge badge-success badge-sm whitespace-nowrap flex-none">
                          {it.categoryName}
                        </span>
                      )}
                    </div>

                    {/* 메타: 작성자 · 날짜 · 조회수 */}
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-base-content/60">
                      {it.nickname && (
                        <span className="truncate">{it.nickname}</span>
                      )}
                      {it.createdAt && (
                        <>
                          <span>•</span>
                          <span>{String(it.createdAt).substring(0, 10)}</span>
                        </>
                      )}
                      {typeof it.viewCount === "number" && (
                        <>
                          <span>•</span>
                          <span className="text-secondary">
                            조회 {it.viewCount}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
