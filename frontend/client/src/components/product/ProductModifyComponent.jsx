// client/src/components/product/ProductModifyComponent.jsx
// ------------------------------------------------------------------
// 상품 수정 컴포넌트 (게시판 UI 톤으로 통일)
// [변경 요약]
// - BoardModifyComponent와 동일한 DaisyUI 톤 적용
// - 카드(card) / 입력(input input-bordered) / 버튼(btn ...) / 배지(badge ...)
// - 업로드 영역: rounded-box + dashed border + bg-base-100
// - 지도 영역: rounded-box + border + 고정 높이(컨테이너만 스타일)
//   ※ 로직/핸들러/구조는 변경 없음 (스타일만 변경)
// ------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, updateProduct, getImageUrl } from "../../api/productApi";
import MapComponent from "./MapComponent";

const MAX_IMAGES = 5;
const STATUS_OPTIONS = [
  { value: "SELLING", label: "판매 중" },
  { value: "RESERVED", label: "예약 중" },
  { value: "SOLD", label: "거래 완료" },
];

// ✅ 등록 화면과 동일한 '상품 상태' 옵션
const CONDITION_OPTIONS = [
  "중고A (사용감 없음)",
  "중고B (사용감 있음)",
  "미개봉",
];

// URL 또는 파일명 문자열 → "파일명"만 추출
function fileNameFromUrl(u) {
  if (!u) return u;
  const s = String(u);
  if (!s.includes("/")) return s;
  try {
    return decodeURIComponent(s.split("/").pop());
  } catch {
    return s.split("/").pop();
  }
}

export default function ProductModifyComponent(props) {
  const { productId: paramId } = useParams();
  const productId = Number(props?.productId ?? paramId); // ✅ 프롭 우선, 없으면 라우트
  const nav = useNavigate();
  const MAX_TAGS = 3;

  // ✅ 필수 파라미터 가드
  if (!Number.isFinite(productId)) {
    return (
      <div className="p-4 text-error">잘못된 접근입니다. (productId 없음)</div>
    );
  }

  // 폼(텍스트) 상태
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    status: "SELLING",
    conditionStatus: "중고A", // ✅ 상품 상태
    addr: "",
    tagNames: [],
  });

  // 서버에 이미 저장돼있는 이미지들: [{name, url}]
  const [existing, setExisting] = useState([]);
  // 기존 이미지 중 삭제로 표시한 파일명 집합
  const [removeSet, setRemoveSet] = useState(() => new Set());
  // 새로 추가한 파일들
  const [newFiles, setNewFiles] = useState([]);

  const [loading, setLoading] = useState(true);

  const [tagInput, setTagInput] = useState("");

  // 초기 로드: 단건 조회 → 폼/이미지 세팅
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const d = await getProduct(productId);
        setForm({
          title: d.title ?? "",
          description: d.description ?? "",
          price: d.price ?? "",
          status: d.status || "SELLING",
          conditionStatus: d.conditionStatus || "중고A", // ✅ 서버 상세값 반영
          addr: d.addr ?? "",
          tagNames: Array.isArray(d.tags) ? d.tags : [],
        });

        // 상세의 images[].imageUrl 은 이미 절대 URL(ToViewUrl) 상태
        const ex = Array.isArray(d.images)
          ? d.images.map((img) => ({
              url: img.imageUrl,
              name: fileNameFromUrl(img.imageUrl), // 삭제/유지 계산용 파일명
            }))
          : [];
        setExisting(ex);
        setRemoveSet(new Set());
        setNewFiles([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  // 입력 변경
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 태그 핸들러
  const addTag = () => {
    const t = (tagInput || "").trim();
    if (!t) return;
    if (form.tagNames.includes(t)) return; // 중복 방지
    if (form.tagNames.length >= MAX_TAGS) return; // 최대 3개
    setForm((f) => ({ ...f, tagNames: [...f.tagNames, t] }));
    setTagInput("");
  };
  const removeTag = (t) => {
    setForm((f) => ({ ...f, tagNames: f.tagNames.filter((x) => x !== t) }));
  };

  // 기존 이미지 삭제 토글
  const toggleRemove = (name) => {
    setRemoveSet((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  // 새 파일 추가
  const onAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 총합(기존-삭제표시 + 새파일)이 MAX_IMAGES를 넘지 않도록 제한
    const currentCnt = existing.filter((x) => !removeSet.has(x.name)).length;
    const remainSlots = Math.max(0, MAX_IMAGES - currentCnt);
    const picked = files.slice(0, remainSlots);

    setNewFiles((prev) => [...prev, ...picked]);
    e.target.value = ""; // 같은 파일 재선택 가능
  };

  // 새 파일 제거
  const removeNewFileAt = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // 새 파일 미리보기 URL
  const previews = useMemo(
    () => newFiles.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [newFiles]
  );
  useEffect(() => {
    // 메모리 해제
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  // 제출
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.title?.trim()) return alert("제목을 입력하세요.");
    if (!String(form.price).trim()) return alert("가격을 입력하세요.");

    const removeFileNames = Array.from(removeSet);
    try {
      // form.tagNames 배열은 buildFormData에서 tagNames=A&tagNames=B... 형태로 전송됨
      await updateProduct(productId, form, newFiles, { removeFileNames });
      alert("수정되었습니다.");
      nav(`/product/read/${productId}`);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  if (loading)
    return <div className="p-4 text-sm text-base-content/60">로딩중…</div>;

  const keptCount = existing.filter((x) => !removeSet.has(x.name)).length;
  const remainSlots = Math.max(0, MAX_IMAGES - keptCount);

  return (
    <section>
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            상품 수정
          </h2>

          <form onSubmit={onSubmit} className="space-y-4 mt-2">
            {/* 제목 */}
            <div>
              <label className="block mb-1 font-medium">제목</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="상품 제목"
                className="input input-bordered w-full
                           focus:outline-none focus:ring-2 focus:ring-secondary/40
                           focus:ring-offset-2 focus:ring-offset-base-100
                           focus:border-secondary
                           transition-[box-shadow,border-color] duration-150"
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block mb-1 font-medium">내용</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={10}
                placeholder="상품 설명"
                className="textarea textarea-bordered w-full
                           focus:outline-none focus:ring-2 focus:ring-secondary/40
                           focus:ring-offset-2 focus:ring-offset-base-100
                           focus:border-secondary
                           transition-[box-shadow,border-color] duration-150"
              />
            </div>

            {/* 가격 / 상태 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">가격</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={onChange}
                  placeholder="가격(원)"
                  className="input input-bordered w-full
                             focus:outline-none focus:ring-2 focus:ring-secondary/40
                             focus:ring-offset-2 focus:ring-offset-base-100
                             focus:border-secondary
                             transition-[box-shadow,border-color] duration-150"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">상품 상태</label>
                <select
                  name="conditionStatus"
                  value={form.conditionStatus}
                  onChange={onChange}
                  className="select select-bordered w-full
               focus:outline-none focus:ring-2 focus:ring-secondary/40
               focus:ring-offset-2 focus:ring-offset-base-100
               focus:border-secondary
               transition-[box-shadow,border-color] duration-150"
                >
                  {CONDITION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">판매 상태</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  className="select select-bordered w-full
                             focus:outline-none focus:ring-2 focus:ring-secondary/40
                             focus:ring-offset-2 focus:ring-offset-base-100
                             focus:border-secondary
                             transition-[box-shadow,border-color] duration-150"
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 태그 */}
            <div>
              <label className="block mb-1 font-medium">
                태그{" "}
                <span className="text-xs text-base-content/60">
                  (최대 {MAX_TAGS})
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="엔터로 추가"
                  className="input input-bordered w-full
                             focus:outline-none focus:ring-2 focus:ring-secondary/40
                             focus:ring-offset-2 focus:ring-offset-base-100
                             focus:border-secondary
                             transition-[box-shadow,border-color] duration-150"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="btn btn-secondary"
                >
                  추가
                </button>
              </div>
              {!!form.tagNames.length && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.tagNames.map((t) => (
                    <span key={t} className="badge badge-ghost gap-1">
                      #{t}
                      <button
                        type="button"
                        onClick={() => removeTag(t)}
                        className="btn btn-ghost btn-xs"
                        title="태그 삭제"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 거래 주소 + 지도 */}
            <div>
              <label className="block mb-1 font-medium">거래 주소</label>
              <input
                name="addr"
                value={form.addr}
                readOnly
                placeholder="지도를 클릭해 주소를 선택하세요"
                className="input input-bordered w-full mb-2
                           bg-accent text-accent-content cursor-not-allowed"
              />
              <div className="rounded-box border border-base-300/50 overflow-hidden bg-base-100 h-64 md:h-72">
                <MapComponent
                  addr={form.addr}
                  setAddr={(addr) => setForm((prev) => ({ ...prev, addr }))}
                />
              </div>
            </div>

            {/* 기존 이미지 */}
            <div>
              <div className="text-sm font-medium mb-2">
                기존 이미지 ({keptCount}/{MAX_IMAGES})
              </div>

              {!existing.length ? (
                <div className="text-sm text-base-content/60">
                  등록된 이미지가 없습니다.
                </div>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {existing.map(({ name, url }) => {
                    const marked = removeSet.has(name);
                    return (
                      <li
                        key={name}
                        className="relative rounded-box border border-base-300/50 p-2"
                      >
                        <img
                          src={url || getImageUrl(name)}
                          alt={name}
                          className={`w-full h-28 object-contain bg-base-100 rounded ${
                            marked ? "opacity-40" : ""
                          }`}
                          title={name}
                        />
                        <button
                          type="button"
                          onClick={() => toggleRemove(name)}
                          className="btn btn-xs btn-circle btn-ghost absolute -top-2 -right-2"
                          title={marked ? "삭제 취소" : "삭제 표시"}
                        >
                          {marked ? "↺" : "✕"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {removeSet.size > 0 && (
                <div className="mt-2 text-xs text-error">
                  {removeSet.size}개의 기존 이미지가 삭제 대상입니다.
                </div>
              )}
            </div>

            {/* 새 이미지 추가 */}
            <div>
              <div className="text-sm font-medium mb-2">
                새 이미지 추가 (남은 슬롯: {remainSlots})
              </div>

              <div className="rounded-box border-2 border-dashed border-base-300/70 p-4 bg-base-100">
                <label
                  htmlFor="newProductImages"
                  className="cursor-pointer flex items-center justify-center h-28 rounded-box border border-base-300/50 text-base-content/70 hover:border-secondary transition"
                >
                  <svg
                    className="w-6 h-6 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                  <span>파일 선택</span>
                </label>
                <input
                  id="newProductImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onAddFiles}
                  disabled={remainSlots <= 0}
                  className="hidden"
                />

                {!!previews.length && (
                  <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previews.map((p, idx) => (
                      <li
                        key={idx}
                        className="relative rounded-box border border-base-300/50 p-2"
                      >
                        <img
                          src={p.url}
                          alt={p.file.name}
                          className="w-full h-28 object-contain bg-base-100 rounded"
                        />
                        <div className="px-1.5 pt-1 text-[11px] truncate">
                          {p.file.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewFileAt(idx)}
                          className="btn btn-xs btn-circle btn-ghost absolute -top-2 -right-2"
                          title="새 이미지 제거"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 제출 */}
            <div className="flex justify-end gap-2 pt-2 border-t border-base-300/50">
              <button type="submit" className="btn btn-secondary">
                수정
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
