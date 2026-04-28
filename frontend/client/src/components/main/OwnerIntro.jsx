import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProfile, updateMyProfile } from "../../api/UserProfileApi";
import { getPetList } from "../../api/petApi";

const MAX_THUMBS = 5;

export default function OwnerIntro({
  manageHref = "/user/profile?tab=PET",
  profileHref = "/user/profile?tab=INFO",
  loginHref = "/user/login",
}) {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [pets, setPets] = useState([]);
  const [err, setErr] = useState("");

  // 대표 펫 선택 관련 상태
  const [prefPetId, setPrefPetId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [pRes, petRes] = await Promise.allSettled([
          getMyProfile(),
          getPetList({ page: 1, size: 10, mine: true }),
        ]);
        if (ignore) return;

        if (pRes.status === "fulfilled") setMe(pRes.value);
        if (petRes.status === "fulfilled") {
          const list = petRes.value?.content ?? petRes.value?.dtoList ?? [];
          setPets(list);
        }
        if (pRes.status === "rejected") setMe(null);
      } catch (e) {
        setErr(e?.message || "fetch error");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // 대표펫 id 초기값 결정: 서버 mainPetId -> localStorage -> 첫 번째 펫
  useEffect(() => {
    if (!pets || pets.length === 0) return;
    const fromApi = me?.mainPetId ?? null;
    const fromLS = (() => {
      try {
        const v = localStorage.getItem("mainPetId");
        return v != null ? Number(v) : null;
      } catch {
        return null;
      }
    })();

    const isValid = (id) =>
      id != null && pets.some((p) => String(p.id) === String(id));
    const resolved =
      (isValid(fromApi) ? fromApi : null) ??
      (isValid(fromLS) ? fromLS : null) ??
      pets[0]?.id ??
      null;

    setPrefPetId((prev) => (prev == null ? resolved : prev));
  }, [me, pets]);

  const isLoggedIn = !!me?.email || !!me?.userId;

  // 대표 펫 / 썸네일
  const preferredPet = useMemo(() => {
    if (!pets || pets.length === 0) return null;
    const found = pets.find((p) => String(p.id) === String(prefPetId));
    return found ?? pets[0];
  }, [pets, prefPetId]);

  const displayName =
    me?.nickname || (me?.email ? me.email.split("@")[0] : "회원님");

  const mainPetImg = preferredPet?.photoUrl || "";
  const initial = String(displayName || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  // 모달 열기
  const openPicker = () => {
    if (!pets || pets.length === 0) return;
    setTempSelected(preferredPet?.id ?? pets[0]?.id ?? null);
    setModalOpen(true);
  };

  // 저장: 서버 → 로컬 순서로 시도
  const savePreferred = async () => {
    if (tempSelected == null) return;
    setSaving(true);
    let serverSaved = false;

    try {
      await updateMyProfile({ mainPetId: tempSelected });
      serverSaved = true;
    } catch (e) {
      // 서버 미지원/실패시 로컬만 저장
    }

    try {
      localStorage.setItem("mainPetId", String(tempSelected));
    } catch {}

    setPrefPetId(tempSelected);
    setSaving(false);
    setModalOpen(false);

    if (!serverSaved) {
      setErr("대표 썸네일이 이 브라우저에만 저장되었어요. (서버 미지원)");
      setTimeout(() => setErr(""), 3000);
    }
  };

  return (
    // 카드 자체를 relative로 → 오른쪽 위 버튼 고정 가능
    <section className="card bg-base-100 shadow-sm border border-base-300/50 overflow-hidden relative">
      {/* 카드 오른쪽 위 모서리: 썸네일 변경 버튼 */}
      {!loading && isLoggedIn && pets.length > 0 && (
        <button
          type="button"
          onClick={openPicker}
          className="btn btn-accent btn-xs absolute top-2 right-2 z-[1]"
        >
          썸네일 변경
        </button>
      )}

      <div className="card-body px-4 py-4 sm:px-5 sm:py-5">
        {/* 로딩 */}
        {loading && (
          <div className="flex items-center gap-4 justify-center text-center">
            <div className="avatar">
              <div className="w-20 h-20 rounded-full">
                <div className="skeleton w-full h-full rounded-full" />
              </div>
            </div>
            <div className="flex-1 space-y-2 max-w-sm">
              <div className="skeleton h-5 w-44 mx-auto" />
              <div className="skeleton h-4 w-64 mx-auto" />
              <div className="skeleton h-4 w-40 mx-auto" />
            </div>
          </div>
        )}

        {/* 미로그인 */}
        {!loading && !isLoggedIn && (
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center justify-center">
            <div className="flex-1 min-w-0">
              <div className="text-lg font-semibold text-base-content">
                프로필을 소개해 보세요
              </div>
              <p className="text-sm text-base-content/70 mt-1">
                로그인하면 반려동물과 함께하는 나만의 프로필 카드가 메인에
                표시됩니다.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={loginHref} className="btn btn-secondary btn-sm">
                로그인
              </Link>
            </div>
          </div>
        )}

        {/* 로그인 상태 */}
        {!loading && isLoggedIn && (
          <>
            {/* md↑도 각 칼럼 내용/텍스트 모두 가운데 정렬 */}
            <div className="grid grid-cols-1 md:grid-cols-[88px,1fr,minmax(0,220px)] place-items-center gap-4 md:gap-6 max-w-full">
              {/* 아바타 */}
              <div className="text-center">
                <div className="avatar">
                  <div className="w-20 h-20 rounded-full border border-base-300/50 overflow-hidden bg-base-100">
                    {mainPetImg ? (
                      <img
                        src={mainPetImg}
                        alt="대표 펫"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        {initial}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 본문 */}
              <div className="min-w-0 text-center">
                <div className="text-lg sm:text-xl font-semibold text-base-content">
                  안녕하세요,{" "}
                  <span className="text-secondary">{displayName}</span>님
                </div>

                {/* 버튼: 항상 가운데 + 한 줄 유지, 넘치면 가로 스크롤 */}
                <div
                  className="
                    mt-3 w-full max-w-full flex gap-2 md:gap-3 flex-nowrap
                    justify-center
                    overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                  "
                >
                  <Link
                    to={profileHref}
                    className="btn btn-accent btn-xs flex-none"
                  >
                    프로필 관리
                  </Link>
                  <Link
                    to={manageHref}
                    className="btn btn-secondary btn-xs flex-none"
                  >
                    반려가족 관리
                  </Link>
                  <Link
                    to="/product/add"
                    className="btn btn-success btn-xs flex-none"
                  >
                    상품 등록
                  </Link>
                </div>
              </div>

              {/* 펫 썸네일 묶음 (최대 5장, +N 표시 제거) */}
              <div className="w-full md:w-[220px] min-w-0 text-center">
                {pets.length > 0 ? (
                  <div>
                    <div className="overflow-hidden px-1">
                      <div className="avatar-group -space-x-4 rtl:space-x-reverse justify-center">
                        {pets.slice(0, MAX_THUMBS).map((p) => (
                          <div key={p.id} className="avatar">
                            <div className="w-12 rounded-full border border-base-300/70">
                              <img src={p.photoUrl} alt={p.name} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-base-content/60 mt-1">
                      내 반려동물
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-base-content/60">
                    등록된 반려동물이 없어요
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 에러 */}
        {err && !loading && (
          <div className="alert alert-error text-sm rounded-box mt-3 text-center">
            <span>{err}</span>
          </div>
        )}
      </div>

      {/* === 대표 썸네일 선택 모달 === */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-2 text-center">
              대표 썸네일 선택
            </h3>
            {pets.length === 0 ? (
              <p className="text-sm text-base-content/70 text-center">
                등록된 반려동물이 없어요.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                {pets.map((p) => (
                  <label
                    key={p.id}
                    className={`cursor-pointer rounded-box border p-3 flex flex-col items-center gap-2
                                ${
                                  String(tempSelected) === String(p.id)
                                    ? "border-secondary"
                                    : "border-base-300/50"
                                }`}
                  >
                    <div className="avatar">
                      <div className="w-16 h-16 rounded-full overflow-hidden border border-base-300/60">
                        <img
                          src={p.photoUrl}
                          alt={p.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium truncate max-w-[8rem]">
                      {p.name}
                    </div>
                    <input
                      type="radio"
                      name="prefPet"
                      className="radio radio-secondary"
                      checked={String(tempSelected) === String(p.id)}
                      onChange={() => setTempSelected(p.id)}
                    />
                  </label>
                ))}
              </div>
            )}
            <div className="modal-action">
              <button
                className="btn btn-accent"
                onClick={() => setModalOpen(false)}
              >
                취소
              </button>
              <button
                className={`btn btn-secondary ${saving ? "btn-disabled" : ""}`}
                onClick={savePreferred}
              >
                {saving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setModalOpen(false)} />
        </div>
      )}
    </section>
  );
}
