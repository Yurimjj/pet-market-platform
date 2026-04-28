// client/src/components/product/ProductListComponent.jsx
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listProducts } from "../../api/productApi";
import ProductCard from "./ProductCard";

export default function ProductListComponent() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get("page") || 1);
  const keyword = params.get("keyword") || "";
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [text, setText] = useState(keyword);

  useEffect(() => {
    listProducts({ page, keyword }).then((res) => {
      const raw = res?.data ?? res;
      const items =
        raw.items ??
        raw.dtoList ??
        raw.content ??
        raw.list ??
        (Array.isArray(raw) ? raw : []);
      const pageInfo = raw.pageInfo ?? {
        page,
        prev: raw.prev,
        next: raw.next,
        prevPage: raw.prevPage,
        nextPage: raw.nextPage,
        pageNumList: raw.pageNumList ?? [],
      };
      setData({ items, pageInfo });
    });
  }, [page, keyword]); // ★ keyword 변경 시에도 재조회

  // ★ 페이지 이동 시 현재 keyword 유지
  const movePage = (p) => {
    const q = { page: String(p) };
    if (keyword) q.keyword = keyword;
    setParams(q);
  };

  // ★ 검색 제출 핸들러: page를 1로 리셋, keyword 세팅
  const onSearch = (e) => {
    e.preventDefault();
    const q = { page: "1" };
    const k = text.trim();
    if (k) q.keyword = k;
    setParams(q);
  };

  // ★ 검색어 초기화
  const onReset = () => {
    setText("");
    setParams({ page: "1" }); // keyword 제거
  };

  return (
    <div className="w-full">
      {/* ▽▽ 검색/헤더 카드 ▽▽ */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50 mb-4">
        <div className="card-body p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="card-title text-xl lg:text-2xl text-secondary">
              상품 목록
            </h2>

            <div className="flex items-center gap-2">
              {/* ★ 검색 박스 (제목/태그 통합 검색) */}
              <form className="flex items-center gap-2" onSubmit={onSearch}>
                <input
                  type="text"
                  name="keyword"
                  placeholder="제목 또는 태그로 검색"
                  className="input input-bordered w-56
                             focus:outline-none focus:ring-2 focus:ring-secondary/40
                             focus:ring-offset-2 focus:ring-offset-base-100
                             focus:border-secondary
                             transition-[box-shadow,border-color] duration-150"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="btn btn-accent">
                  검색
                </button>
                {keyword && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={onReset}
                    aria-label="검색어 초기화"
                    title="검색어 초기화"
                  >
                    초기화
                  </button>
                )}
              </form>

              {/* 등록 버튼 */}
              <Link to="/product/add" className="btn btn-neutral">
                상품 등록
              </Link>
            </div>
          </div>

          {/* 검색어 배지 */}
          {keyword && (
            <div className="mt-2 text-sm text-base-content/60">
              검색어: <span className="text text-sm">“{keyword}”</span>
            </div>
          )}
        </div>
      </div>
      {/* △△ 검색/헤더 카드 △△ */}

      {/* ▽▽ 상품 리스트 카드 ▽▽ */}
      {data.items.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-300/50">
          <div className="card-body p-8 text-center text-base-content/70">
            등록된 상품이 없습니다.
          </div>
        </div>
      ) : (
        <div className="card bg-base-100 shadow-sm border border-base-300/50">
          <div className="card-body p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.items.map((item) => (
                <ProductCard key={item.productId} item={item} />
              ))}
            </div>
          </div>

          {/* 카드 풋터: 페이지네이션 (게시판 스타일과 동일) */}
          <div className="p-4 border-t border-base-300/50">
            <div className="my-4 flex justify-center items-center gap-3">
              {data.pageInfo.prev && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => movePage(data.pageInfo.prevPage ?? page - 1)}
                >
                  이전
                </button>
              )}

              {/* 페이지 번호 목록 (daisyUI join) */}
              <div className="join">
                {(data.pageInfo.pageNumList ?? []).map((n) => (
                  <button
                    key={n}
                    className={`join-item btn btn-sm ${
                      Number(n) === Number(page)
                        ? "btn-secondary"
                        : "btn-success"
                    }`}
                    onClick={() => movePage(n)}
                    aria-current={
                      Number(n) === Number(page) ? "page" : undefined
                    }
                  >
                    {n}
                  </button>
                ))}
              </div>

              {data.pageInfo.next && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => movePage(data.pageInfo.nextPage ?? page + 1)}
                >
                  다음
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* △△ 상품 리스트 카드 △△ */}
    </div>
  );
}
