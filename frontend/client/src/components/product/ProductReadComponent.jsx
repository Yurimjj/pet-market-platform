// client/src/components/products/ProductReadComponent.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  getProduct,
  deleteProduct,
  toggleLike,
  markProductSold,
  confirmPurchase,
  cancelMarkProductSold,
  cancelConfirmPurchase,
} from "../../api/productApi";
import { registerTransaction, hasActiveTransaction } from "../../api/orderApi";
import { getCookie } from "../../util/CookieUtil";
import StatusBadge from "./StatusBadge";
import ReadMapComponent from "./ReadMapComponent";

/* ===================== JWT에서 사용자/권한 보완적으로 꺼내는 유틸 ===================== */
function parseJwt(token) {
  try {
    const base64 = token?.split(".")?.[1] || "";
    const padded = base64
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return JSON.parse(atob(padded)) || {};
  } catch {
    return {};
  }
}
function getAuthFromCookie() {
  const raw = getCookie("user");
  if (!raw) return null;

  let obj = raw;
  try {
    if (typeof raw === "string") obj = JSON.parse(raw);
  } catch {}

  const payload = parseJwt(obj?.accessToken);

  const userId =
    obj?.userId ??
    obj?.id ??
    payload?.userId ??
    payload?.uid ??
    payload?.sub ??
    null;

  const roles = obj?.roles ?? payload?.roles ?? payload?.authorities ?? [];

  return userId ? { userId: String(userId), roles } : null;
}
/* ===================================================================================== */

const DEFAULT_IMG = "/no_image.png";

export default function ProductReadComponent({ productId }) {
  if (!Number.isFinite(Number(productId))) {
    return (
      <div className="p-4 text-red-600">
        잘못된 접근입니다. (productId 없음)
      </div>
    );
  }

  const nav = useNavigate();
  const { pathname, search: currentSearch } = useLocation();
  const fromHere = encodeURIComponent(`${pathname}${currentSearch || ""}`);

  const [data, setData] = useState(null);
  const [liked, setLiked] = useState(false);
  const [hasActiveTx, setHasActiveTx] = useState(false); // [ADD] 활성 거래 여부

  // 현재 로그인 유저
  const cookieAuth = getAuthFromCookie();
  const currentUserId = String(cookieAuth?.userId ?? "");

  useEffect(() => {
    getProduct(productId).then((res) => {
      setData(res);
      if (typeof res?.isLiked === "boolean") {
        setLiked(!!res.isLiked);
      }
    });

    // ===== [ADD] 활성 거래 여부 조회 =====
    if (currentUserId) {
      hasActiveTransaction(Number(productId))
        .then((active) => setHasActiveTx(!!active))
        .catch(() => setHasActiveTx(false));
    } else {
      setHasActiveTx(false);
    }
    // ====================================
  }, [productId]); // [NOTE] productId 변경 시 재조회 (로그인 변경은 보통 페이지 리로드로 처리)

  if (!data) return null;

  // 판매자 정보
  const sellerId =
    data?.sellerId ?? data?.seller?.userId ?? data?.seller?.id ?? null;
  const sellerNickname =
    data?.seller?.nickname ?? data?.sellerNickname ?? data?.seller?.name ?? "";

  // 권한 분기
  const isOwner =
    currentUserId && sellerId && String(currentUserId) === String(sellerId);
  const isAdmin = (cookieAuth?.roles || []).some((r) =>
    String(r).toUpperCase().includes("ADMIN")
  );
  const canManage = isOwner || isAdmin;

  const status = data.status;
  const isSold = status === "SOLD";

  // ===================== [ADD] 거래 확인 상태 (서버 DTO 보강 사용) =====================
  const buyerId = data?.buyerId ?? null;
  const sellerConfirmed = !!data?.sellerConfirmedAt; // [ADD]
  const buyerConfirmed = !!data?.buyerConfirmedAt; // [ADD]
  const bothConfirmed = sellerConfirmed && buyerConfirmed; // [ADD]
  // =============================================================================

  const onDelete = async () => {
    if (!canManage) return alert("본인(또는 관리자)만 삭제할 수 있어요.");
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteProduct(productId);
    nav("/product/list");
  };

  // [CHG] 이름만 유지하고 로직 변경: 거래 생성 제거, pid만 넘겨서 채팅으로 이동
  const onChatAndDealStart = async () => {
    if (!currentUserId) return alert("로그인이 필요합니다.");

    const qs =
      `/chat?peer=${encodeURIComponent(String(sellerId))}` +
      `${
        sellerNickname ? `&peerNick=${encodeURIComponent(sellerNickname)}` : ""
      }` +
      `&pid=${encodeURIComponent(String(productId))}` + // [ADD] 방 컨텍스트로 사용할 상품ID
      `&from=${fromHere}`;

    nav(qs);
  };

  const onToggleLike = async () => {
    try {
      if (!currentUserId) {
        alert("로그인이 필요합니다.");
        return;
      }
      setLiked((prev) => !prev); // 낙관적 업데이트
      const res = await toggleLike(Number(productId));
      if (typeof res?.liked === "boolean") {
        setLiked(!!res.liked);
      }
    } catch (e) {
      console.error(e);
      alert("찜 처리에 실패했습니다.");
      setLiked((prev) => !prev); // 실패 롤백
    }
  };

  // ============================ [CHG] 판매자: '판매완료' ============================
  // 프롬프트/구매자 식별 입력 절차 제거 → 클릭만 하면 판매자 확인 기록
  const onMarkSold = async () => {
    if (!canManage) return alert("권한이 없습니다.");
    if (isSold) return alert("이미 거래 완료된 상품입니다.");

    try {
      await markProductSold({ productId: Number(productId) }); // [CHG] 바디 없이 호출
      alert("판매자 확인이 처리되었습니다.");
      const res = await getProduct(productId);
      setData(res);
      // SOLD가 되면 서버가 찜을 삭제하므로, 안전하게 해제
      if (res?.status === "SOLD") setLiked(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "판매 완료 처리 실패");
    }
  };
  // ==============================================================================

  // ============================ [CHG] 구매자: '구매완료' ============================
  // 클릭만 하면 현재 로그인 사용자를 구매자로 확정 + 구매자 확인 기록
  const onConfirmPurchase = async () => {
    try {
      await confirmPurchase(Number(productId));
      alert("구매자 확인이 처리되었습니다.");
      const res = await getProduct(productId);
      setData(res);
      if (res?.status === "SOLD") setLiked(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "구매 완료 처리 실패");
    }
  };
  // ==============================================================================

  // ============================ [ADD] 취소 핸들러 2종 ============================
  // 판매자: '판매완료'를 눌러 대기 중인 상태를 되돌리기
  const onCancelSellerConfirm = async () => {
    if (!canManage) return alert("권한이 없습니다.");
    if (isSold) return alert("이미 거래 완료된 상품입니다.");
    if (!(sellerConfirmed && !buyerConfirmed)) {
      return alert("판매자만 확인한 대기 상태에서만 취소할 수 있습니다.");
    }
    try {
      await cancelMarkProductSold({ productId: Number(productId) });
      const res = await getProduct(productId);
      setData(res);
      alert("판매자 확인을 취소했습니다.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "판매완료 취소 실패");
    }
  };

  // 구매자: '구매완료'를 눌러 대기 중인 상태를 되돌리기
  const onCancelBuyerConfirm = async () => {
    if (isOwner) return alert("판매자는 구매완료 취소를 할 수 없습니다.");
    if (isSold) return alert("이미 거래 완료된 상품입니다.");
    if (!(buyerConfirmed && !sellerConfirmed)) {
      return alert("구매자만 확인한 대기 상태에서만 취소할 수 있습니다.");
    }
    // 활성 거래 & 구매자 본인 조건을 UI에서 이미 제한했지만, 방어적으로 체크
    const isMyTurn =
      hasActiveTx &&
      (buyerId == null || String(buyerId) === String(currentUserId));
    if (!isMyTurn) return alert("해당 거래에 대한 권한이 없습니다.");

    try {
      await cancelConfirmPurchase(Number(productId));
      const res = await getProduct(productId);
      setData(res);
      alert("구매자 확인을 취소했습니다.");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e?.message || "구매완료 취소 실패");
    }
  };
  // ============================================================================

  // ============================== [CHG] 버튼 노출/상태 ==============================
  // 판매자 버튼: 판매자(또는 관리자)만 보이게 + 양측 미완료일 때만 표시
  const showSellerBtn = canManage && !bothConfirmed;

  // [CHG] 구매자 버튼: 채팅/거래를 시작한 사용자에게만 보이도록 hasActiveTx 추가
  // - 판매자가 아니고
  // - 양측 미완료이며
  // - 활성 거래가 나에게 존재하고
  // - (buyerId가 아직 없거나) buyerId가 나와 동일
  const showBuyerBtn =
    !isOwner &&
    !bothConfirmed &&
    hasActiveTx && // [ADD] 핵심: 채팅/거래 시작 사용자만
    (buyerId == null || String(buyerId) === String(currentUserId));

  // 라벨/비활성: 한쪽만 누른 상태 → "대기 중"(회색, disabled)
  const sellerBtnDisabled = sellerConfirmed && !buyerConfirmed;
  const buyerBtnDisabled = buyerConfirmed && !sellerConfirmed;
  const sellerBtnLabel =
    sellerConfirmed && !buyerConfirmed ? "대기 중" : "판매완료";
  const buyerBtnLabel =
    buyerConfirmed && !sellerConfirmed ? "대기 중" : "구매완료";

  // === [ADD] 취소 버튼 노출 조건 ===
  const showSellerCancelBtn =
    canManage && !isSold && sellerConfirmed && !buyerConfirmed;
  const showBuyerCancelBtn =
    !isOwner &&
    !isSold &&
    buyerConfirmed &&
    !sellerConfirmed &&
    hasActiveTx &&
    (buyerId == null || String(buyerId) === String(currentUserId));
  // ==============================================================================

  return (
    <div className="container mx-auto mt-10 px-4">
      {/* 바깥 카드 톤 */}
      <div className="card bg-base-100 shadow-sm border border-base-300/50 rounded-box p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 메인 이미지 */}
          <div className="md:w-1/2">
            <div className="relative aspect-square bg-base-100 rounded-box overflow-hidden">
              {status && (
                <StatusBadge
                  status={status}
                  className="absolute top-2 left-2"
                />
              )}
              <img
                src={data.images?.[0]?.imageUrl || DEFAULT_IMG}
                className={`w-full h-full object-cover ${
                  isSold ? "grayscale" : ""
                }`}
                alt=""
                onError={(e) => {
                  if (
                    e.currentTarget.src !==
                    window.location.origin + DEFAULT_IMG
                  ) {
                    e.currentTarget.src = DEFAULT_IMG;
                    e.currentTarget.onerror = null;
                  }
                }}
              />
              {isSold && (
                <div className="absolute inset-0 bg-base-100/40 pointer-events-none" />
              )}
            </div>

            {/* 썸네일 */}
            {Array.isArray(data.images) && data.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {data.images.slice(0, 10).map((img, i) => (
                  <img
                    key={img.imageId ?? i}
                    className="w-full h-20 object-cover rounded-box border border-base-300/50 bg-base-100"
                    src={img.imageUrl || DEFAULT_IMG}
                    alt=""
                    onError={(e) => {
                      if (
                        e.currentTarget.src !==
                        window.location.origin + DEFAULT_IMG
                      ) {
                        e.currentTarget.src = DEFAULT_IMG;
                        e.currentTarget.onerror = null;
                      }
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 상세 우측 */}
          <div className="flex-1 space-y-2 md:self-center md:border-l-2 md:border-accent md:pl-7">
            <div className="flex items-start gap-2">
              <h1 className="text-2xl font-bold flex-1 text-base-content">
                {data.title}
              </h1>
              {status && <StatusBadge status={status} />}
            </div>

            {/* 판매자 닉네임 */}
            {sellerNickname && (
              <div className="text-sm text-base-content/60">
                판매자{" "}
                {sellerId ? (
                  <Link
                    to={`/pet/list?ownerId=${sellerId}`} // [ADD] 목록으로 이동
                    className="font-medium text-secondary hover:underline"
                    title="펫 프로필 보기"
                  >
                    {sellerNickname}
                  </Link>
                ) : (
                  <span className="font-medium text-base-content">
                    {sellerNickname}
                  </span>
                )}
              </div>
            )}

            <div className="text-xl font-semibold text-secondary">
              {data.price?.toLocaleString?.()}원
            </div>
            <div className="text-sm text-base-content/60">
              {data.addr} · {data.conditionStatus}
            </div>

            {/* 태그 */}
            {data.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.tags.map((t) => (
                  <span
                    key={t}
                    className="badge badge-accent text-base-content/80"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* 액션 버튼 (상단): 찜/채팅/판매완료/구매완료/취소만 유지 */}
            <div className="pt-3 flex flex-wrap gap-2">
              {/* 🔻 목록/수정/삭제는 아래(상세설명 밑)로 이동 */}

              {/* 찜 버튼 (판매자 본인이 아니고, SOLD가 아닐 때) */}
              {!isOwner && !isSold && (
                <button
                  onClick={onToggleLike}
                  className={`btn font-semibold ${
                    liked ? "btn-error" : "btn-outline btn-error"
                  }`}
                  title={liked ? "찜 해제" : "찜하기"}
                >
                  {liked ? "♥ 찜해제" : "♡ 찜하기"}
                </button>
              )}

              {canManage ? (
                <>
                  {/* =================== [CHG] 판매자: 판매완료 버튼 =================== */}
                  {!bothConfirmed && ( // 양측 완료 전까지만 표시
                    <div className="flex items-center gap-2">
                      <button
                        onClick={!sellerConfirmed ? onMarkSold : undefined} // 이미 눌렀으면 클릭 막기
                        disabled={sellerBtnDisabled}
                        className={`btn font-semibold ${
                          sellerBtnDisabled ? "btn-disabled" : "btn-success"
                        }`}
                        title={
                          sellerBtnDisabled
                            ? "구매자 확인 대기 중"
                            : "판매 완료(판매자 확인)"
                        }
                      >
                        {sellerBtnLabel}
                      </button>

                      {/* [ADD] 판매자만 누른 상태 → 취소 버튼 */}
                      {showSellerCancelBtn && (
                        <button
                          onClick={onCancelSellerConfirm}
                          className="btn btn-warning"
                          title="판매자 확인 취소"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  )}
                  {/* ================================================================== */}
                </>
              ) : (
                <>
                  {/* 이미 최종 SOLD면 채팅 숨김 */}
                  {!isSold && (
                    <button
                      onClick={onChatAndDealStart}
                      className="btn btn-secondary"
                    >
                      채팅하기(바로 거래)
                    </button>
                  )}

                  {/* =================== [CHG] 구매자: 구매완료/취소 =================== */}
                  {showBuyerBtn && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={
                          !buyerConfirmed ? onConfirmPurchase : undefined
                        }
                        disabled={buyerBtnDisabled}
                        className={`btn font-semibold ${
                          buyerBtnDisabled ? "btn-disabled" : "btn-success"
                        }`}
                        title={
                          buyerBtnDisabled
                            ? "판매자 확인 대기 중"
                            : "구매 완료(구매자 확인)"
                        }
                      >
                        {buyerBtnLabel}
                      </button>

                      {/* [ADD] 구매자만 누른 상태 → 취소 버튼 */}
                      {showBuyerCancelBtn && (
                        <button
                          onClick={onCancelBuyerConfirm}
                          className="btn btn-warning"
                          title="구매자 확인 취소"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  )}
                  {/* ================================================================== */}
                </>
              )}
            </div>
          </div>
        </div>

        {data.addr && (
          <div className="mt-6">
            {/* 지도 래퍼: 높이만 줄이고 테두리/둥근모서리/오버플로우 처리 */}
            <div className="relative h-64 md:h-72 rounded-box border border-base-300/50 overflow-hidden bg-base-100">
              <ReadMapComponent addr={data.addr} />
            </div>
          </div>
        )}

        <div className="card bg-base-100 shadow-sm border border-base-300/50 mt-6">
          <div className="card-body p-4">
            <div className="max-w-none">
              <h3 className="text-xl lg:text-2xl font-bold text-secondary mb-2">
                제품 상세 설명
              </h3>
              <p className="text-base lg:text-base font-medium leading-relaxed text-base-content/80 whitespace-pre-line">
                {data.description}
              </p>
            </div>
          </div>
        </div>

        {/* ====================== 하단 기본 액션: 목록/수정/삭제 ====================== */}
        <div className="flex justify-end gap-2 mt-4">
          <Link to="/product/list" className="btn btn-accent">
            목록
          </Link>

          {canManage && (
            <>
              <Link
                to={`/product/modify/${productId}`}
                className="btn btn-secondary"
              >
                수정
              </Link>
              <button onClick={onDelete} className="btn btn-error">
                삭제
              </button>
            </>
          )}
        </div>
        {/* ======================================================================== */}
      </div>
    </div>
  );
}
