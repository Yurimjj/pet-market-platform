// client/src/components/user/ProfileComponent.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getMyProfile } from "../../api/UserProfileApi";
import SellingNowList from "./SellingNowList";
import PetTabEmbed from "./PetTabEmbed";
import {
  listMyLikedProducts,
  listMySoldProducts,
  listMyPurchasedProducts,
} from "../../api/productApi";
import ProductCard from "../product/ProductCard";
import ReservedAsBuyerList from "./ReservedAsBuyerList";
import ReservedAsSellerList from "./ReservedAsSellerList";

const TABS = { INFO: "INFO", ACTIVITY: "ACTIVITY", PET: "PET", LIKES: "LIKES" };

/* ============================================================
   ✅ pageInfo 정규화: 다양한 응답 포맷을 안전하게 처리
   ============================================================ */
function normalizePageInfo(raw, fallbackPage = 1) {
  const pi = raw?.pageInfo ?? {};
  const page =
    typeof pi.page === "number" && pi.page > 0
      ? pi.page
      : typeof raw?.number === "number"
      ? raw.number + 1
      : fallbackPage;

  let totalPages =
    (Array.isArray(pi.pageNumList) ? pi.pageNumList.length : undefined) ??
    raw?.totalPages ??
    pi.totalPages ??
    0;

  if (!totalPages) {
    if (pi.prev === false && pi.next === false) totalPages = 1;
    else if (pi.next === false) totalPages = page;
    else if (pi.prev === false && pi.next === true)
      totalPages = Math.max(page + 1, 2);
    else totalPages = Math.max(page, 1);
  }

  const first =
    typeof pi.first === "boolean"
      ? pi.first
      : typeof raw?.first === "boolean"
      ? raw.first
      : typeof pi.prev === "boolean"
      ? !pi.prev
      : page <= 1;

  const last =
    typeof pi.last === "boolean"
      ? pi.last
      : typeof raw?.last === "boolean"
      ? raw.last
      : typeof pi.next === "boolean"
      ? !pi.next
      : page >= totalPages;

  return { ...pi, page, totalPages, first, last };
}

const ProfileComponent = () => {
  const [tab, setTab] = useState(TABS.INFO);
  const [searchParams] = useSearchParams();
  const nav = useNavigate();

  const goTab = (nextKey) => {
    if (TABS[nextKey]) setTab(TABS[nextKey]);
    const sp = new URLSearchParams(searchParams);
    if (nextKey === "INFO") sp.delete("tab");
    else sp.set("tab", nextKey);
    const qs = sp.toString();
    nav(`/user/profile${qs ? `?${qs}` : ""}`, { replace: true });
  };

  const [form, setForm] = useState({
    email: "",
    nickname: "",
    region: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myUserId, setMyUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyProfile();
        setForm({
          email: data.email || "",
          nickname: data.nickname || "",
          region: data.region || "",
          phoneNumber: data.phoneNumber || "",
        });
        setMyUserId(data.userId ?? null);
      } catch (e) {
        console.error(e);
        setError("내 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const t = (searchParams.get("tab") || "").toUpperCase();
    if (t && TABS[t] && tab !== TABS[t]) setTab(TABS[t]);
  }, [searchParams]);

  if (loading)
    return <div className="text-sm text-base-content/60">로딩중...</div>;

  return (
    // 🔁 기존: <div className="w-full max-w-6xl grid grid-cols-12 gap-6">
    <div className="card bg-base-100 shadow-sm border border-base-300/50 w-full max-w-6xl mx-auto">
      <div className="card-body p-4 md:p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* 좌측 탭 */}
          <aside className="col-span-12 md:col-span-3 md:sticky md:top-4 self-start">
            {/* 🔁 기존 스타일 톤 다운 */}
            <div className="rounded-box bg-base-200 text-base-content shadow-sm border border-base-300/50 p-2">
              <div className="overflow-hidden rounded-2xl">
                <div className="flex flex-col gap-0">
                  <TabBtn
                    active={tab === TABS.INFO}
                    onClick={() => goTab("INFO")}
                  >
                    내 정보 관리
                  </TabBtn>
                  <TabBtn
                    active={tab === TABS.ACTIVITY}
                    onClick={() => goTab("ACTIVITY")}
                  >
                    활동 내역
                  </TabBtn>
                  <TabBtn
                    active={tab === TABS.PET}
                    onClick={() => goTab("PET")}
                  >
                    반려동물 정보
                  </TabBtn>
                  <TabBtn
                    active={tab === TABS.LIKES}
                    onClick={() => goTab("LIKES")}
                  >
                    찜한 목록
                  </TabBtn>
                </div>
              </div>
            </div>
          </aside>

          {/* 우측 컨텐츠 */}
          <main className="col-span-12 md:col-span-9">
            {tab === TABS.INFO && (
              <InfoTabReadOnly
                form={form}
                error={error}
                onEdit={() => navigate("/user/profile/edit")}
              />
            )}
            {tab === TABS.ACTIVITY && <ActivityTab userId={myUserId} />}
            {tab === TABS.PET && <PetTabEmbed />}
            {tab === TABS.LIKES && <LikesTab />}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;

/* -------------------- 하위 컴포넌트 -------------------- */

const TabBtn = ({ active, onClick, children }) => (
  <button
    className={`btn w-full justify-start
                rounded-none first:rounded-t-2xl last:rounded-b-2xl
                focus:outline-none focus-visible:ring-2 focus-visible:ring-success-content/40
                ${
                  active
                    ? "btn-neutral btn-active"
                    : "btn-ghost text-info hover:bg-info-content/10"
                }`}
    onClick={onClick}
  >
    {children}
  </button>
);

/* ===================== 읽기 전용 Info 탭 ===================== */
const InfoTabReadOnly = ({ form, error, onEdit }) => (
  <div className="card bg-base-100 shadow-sm border border-base-300/50 w-full max-w-3xl md:max-w-4xl p-6 lg:p-8">
    <h2 className="card-title text-2xl lg:text-3xl text-secondary mb-6">
      내 정보 관리
    </h2>
    {error && (
      <div className="mb-4 p-4 rounded-box bg-error/10 text-error text-sm">
        {error}
      </div>
    )}

    {/* 필드 영역을 2열 그리드로 넓게 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="이메일">
        <input
          type="text"
          name="email"
          value={form.email}
          readOnly
          disabled
          className="badge badge-bordered badge-lg w-full bg-accent text-accent-content cursor-not-allowed h-12 md:h-14 px-4 text-base md:text-lg"
        />
      </Field>
      <Field label="닉네임">
        <input
          type="text"
          name="nickname"
          value={form.nickname}
          readOnly
          disabled
          className="badge badge-bordered badge-lg w-full bg-accent text-accent-content cursor-not-allowed h-12 md:h-14 px-4 text-base md:text-lg"
        />
      </Field>
      <Field label="지역">
        <input
          type="text"
          name="region"
          value={form.region}
          readOnly
          disabled
          className="badge badge-bordered badge-lg w-full bg-accent text-accent-content cursor-not-allowed h-12 md:h-14 px-4 text-base md:text-lg"
        />
      </Field>
      <Field label="핸드폰">
        <input
          type="text"
          name="phoneNumber"
          value={form.phoneNumber}
          readOnly
          disabled
          className="badge badge-bordered badge-lg w-full bg-accent text-accent-content cursor-not-allowed h-12 md:h-14 px-4 text-base md:text-lg"
        />
      </Field>

      <div className="pt-3 flex justify-end md:col-span-2">
        <button
          type="button"
          onClick={onEdit}
          className="btn btn-secondary btn-base"
        >
          수정하기
        </button>
      </div>
    </div>
  </div>
);

// ActivityTab: 병합 섹션 구성 + 기존 daisyUI className 그대로
const ActivityTab = ({ userId }) => {
  const boardMyListLink =
    userId != null
      ? `/board/list?type=u&keyword=${encodeURIComponent(userId)}`
      : null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">나의 활동</h2>

      <SectionCard title="판매 중">
        <div className="flex gap-2 mb-3">
          <Link className="btn btn-accent" to="/product/list">
            상품 전체 목록
          </Link>
          <Link className="btn btn-success" to="/product/add">
            상품 등록
          </Link>
        </div>
        <SellingNowList userId={userId} />
      </SectionCard>

      {/* ✅ 예약 중 (구매자) */}
      <SectionCard title="예약 중 (구매자)">
        <ReservedAsBuyerList pageSize={6} />
      </SectionCard>

      {/* ✅ 예약 처리된 내 상품 (판매자) */}
      <SectionCard title="예약 처리된 내 상품 (판매자)">
        <ReservedAsSellerList pageSize={6} />
      </SectionCard>

      {/* 판매 내역: status=SOLD & sellerId=me */}
      <SectionCard title="판매 내역">
        <SoldHistoryList userId={userId} pageSize={3} />
      </SectionCard>

      {/* 구매 내역: buyerId=me */}
      <SectionCard title="구매 내역">
        <PurchasedHistoryList pageSize={3} />
      </SectionCard>

      <SectionCard title="내 게시글">
        <p className="text-sm text-base-content/60 mb-3">
          내가 작성한 게시글만 모아봅니다.
        </p>
        {boardMyListLink ? (
          <Link className="btn btn-success" to={boardMyListLink}>
            내 글 보러가기
          </Link>
        ) : (
          <button className="btn btn-success btn-disabled" disabled>
            내 글 보러가기 (로그인/프로필 로딩 필요)
          </button>
        )}
      </SectionCard>
    </div>
  );
};

/* ===================== 판매 내역 리스트 ===================== */
const SoldHistoryList = ({ userId, pageSize = 3 }) => {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    listMySoldProducts({ userId, page, size: pageSize })
      .then((res) => {
        const raw = res?.data ?? res;
        const items = raw.items ?? raw.dtoList ?? raw.content ?? raw.list ?? [];
        const pageInfo = normalizePageInfo(raw, page); // ✅ 정규화 사용(병합 로직)
        setData({ items, pageInfo });
      })
      .finally(() => setLoading(false));
  }, [userId, page, pageSize]);

  if (!userId) {
    return (
      <div className="text-sm text-base-content/60">
        사용자 정보를 불러오는 중…
      </div>
    );
  }
  if (loading)
    return <div className="text-sm text-base-content/60">로딩중…</div>;
  if (!data.items.length && (data.pageInfo.totalPages ?? 0) === 0)
    return (
      <div className="text-sm text-base-content/60">판매 내역이 없습니다.</div>
    );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((it) => (
          <ProductCard key={it.productId} item={it} />
        ))}
      </div>

      <Pager
        pageInfo={data.pageInfo}
        onPrev={() =>
          setPage(
            data.pageInfo.prevPage
              ? data.pageInfo.prevPage
              : Math.max(1, (data.pageInfo.page ?? 1) - 1)
          )
        }
        onNext={() =>
          setPage(
            data.pageInfo.nextPage
              ? data.pageInfo.nextPage
              : data.pageInfo.totalPages
              ? Math.min(
                  data.pageInfo.totalPages,
                  (data.pageInfo.page ?? 1) + 1
                )
              : (data.pageInfo.page ?? 1) + 1
          )
        }
      />
    </>
  );
};

/* ===================== 구매 내역 리스트 ===================== */
const PurchasedHistoryList = ({ pageSize = 3 }) => {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    listMyPurchasedProducts({ page, size: pageSize })
      .then((res) => {
        const raw = res?.data ?? res;
        const items = raw.items ?? raw.dtoList ?? raw.content ?? raw.list ?? [];
        const pageInfo = normalizePageInfo(raw, page); // ✅ 정규화 사용(병합 로직)
        setData({ items, pageInfo });
      })
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  if (loading)
    return <div className="text-sm text-base-content/60">로딩중…</div>;
  if (!data.items.length && (data.pageInfo.totalPages ?? 0) === 0)
    return (
      <div className="text-sm text-base-content/60">구매 내역이 없습니다.</div>
    );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.items.map((it) => (
          <ProductCard key={it.productId} item={it} />
        ))}
      </div>

      <Pager
        pageInfo={data.pageInfo}
        onPrev={() =>
          setPage(
            data.pageInfo.prevPage
              ? data.pageInfo.prevPage
              : Math.max(1, (data.pageInfo.page ?? 1) - 1)
          )
        }
        onNext={() =>
          setPage(
            data.pageInfo.nextPage
              ? data.pageInfo.nextPage
              : data.pageInfo.totalPages
              ? Math.min(
                  data.pageInfo.totalPages,
                  (data.pageInfo.page ?? 1) + 1
                )
              : (data.pageInfo.page ?? 1) + 1
          )
        }
      />
    </>
  );
};

/* ===================== 공통 페이저(클래스는 기존 그대로) ===================== */
const Pager = ({ pageInfo = {}, onPrev, onNext }) => {
  // 👉 병합 로직의 안전한 prev/next 판단 유지
  const page = pageInfo.page ?? 1;
  const totalPages =
    (Array.isArray(pageInfo.pageNumList)
      ? pageInfo.pageNumList.length
      : undefined) ??
    pageInfo.totalPages ??
    0;

  const canPrev =
    typeof pageInfo.prev === "boolean"
      ? pageInfo.prev
      : !pageInfo.first && page > 1;
  const canNext =
    typeof pageInfo.next === "boolean"
      ? pageInfo.next
      : !pageInfo.last && (totalPages ? page < totalPages : true);

  return (
    <div className="flex justify-center items-center gap-3 mt-4">
      {canPrev && (
        <button className="btn btn-sm btn-base-200" onClick={onPrev}>
          이전
        </button>
      )}
      <span className="text-sm text-base-content/60">
        {page} / {totalPages > 0 ? totalPages : page}
      </span>
      {canNext && (
        <button className="btn btn-sm btn-base-200" onClick={onNext}>
          다음
        </button>
      )}
    </div>
  );
};

/* ===================== 찜 탭 ===================== */
const LikesTab = () => {
  const [data, setData] = useState({ items: [], pageInfo: {} });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetchPage = async (p = 1) => {
    setLoading(true);
    try {
      const res = await listMyLikedProducts({ page: p });
      const raw = res?.data ?? res;
      const items = raw.items ?? raw.dtoList ?? raw.content ?? raw.list ?? [];
      const pageInfo =
        raw.pageInfo ?? normalizePageInfo(raw, (raw.number ?? 0) + 1); // ✅ 병합 로직: 정규화
      setData({ items, pageInfo });
      setPage(pageInfo.page || p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const handleUnlike = (pid) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.productId !== pid),
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">찜한 목록</h2>

      {loading ? (
        <div className="text-center py-12 text-base-content/60">Loading...</div>
      ) : data.items.length === 0 ? (
        <div className="text-center text-base-content/60 py-12">
          찜한 상품이 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.items.map((item) => (
              <ProductCard
                key={item.productId}
                item={item}
                onUnlike={handleUnlike}
              />
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {!data.pageInfo.first && (
              <button
                className="btn btn-sm btn-base-200"
                onClick={() => fetchPage(page - 1)}
              >
                이전
              </button>
            )}
            <span className="px-3 py-1 text-base-content/60">
              {data.pageInfo.page} / {data.pageInfo.totalPages ?? "-"}
            </span>
            {!data.pageInfo.last && (
              <button
                className="btn btn-sm btn-base-200"
                onClick={() => fetchPage(page + 1)}
              >
                다음
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const SectionCard = ({ title, children }) => (
  <div className="card bg-base-100 shadow-sm border border-base-300/50 p-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold text-secondary">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    {children}
  </div>
);
