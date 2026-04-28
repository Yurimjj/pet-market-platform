// client/src/components/product/ProductAddComponent.jsx
// ------------------------------------------------------------------
// 상품 등록 (ProductModifyComponent와 동일 DaisyUI 톤 + 동일 입력 순서)
// - 순서: 가격 → 상품 상태 → 판매 상태 → 태그 → 거래 주소 → (기타: 거래 방식/카테고리)
// - 지도 컨테이너 높이: h-64 md:h-72 (Modify와 동일)
// - 로직은 기존 유지, 스타일 및 배치만 변경
// ------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import { addProduct, listCategories } from "../../api/productApi";
import MapComponent from "./MapComponent";

const MAX_TITLE = 30;
const MAX_DESC = 2000;
const MAX_TAGS = 3;
const MAX_IMAGES = 5;

// Modify와 동일한 옵션
const STATUS_OPTIONS = [
  { value: "SELLING", label: "판매 중" },
  { value: "RESERVED", label: "예약 중" },
  { value: "SOLD", label: "거래 완료" },
];

const CONDITION_OPTIONS = [
  "중고A (사용감 없음)",
  "중고B (사용감 있음)",
  "미개봉",
];

export default function ProductAddComponent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    status: "SELLING", // [ADD] 판매 상태 (Modify와 동일 필드)
    conditionStatus: "중고A", // NOTE: 서버가 "중고A (사용감 없음)"을 기대한다면 이 값을 그걸로 통일
    tradeMethod: "직거래",
    addr: "",
    categoryId: "",
    tagNames: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]); // 새 이미지들
  const [categories, setCategories] = useState([]);

  // 카테고리 로드(응답 형태 방어)
  useEffect(() => {
    listCategories()
      .then((raw) => {
        const arr = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.content)
          ? raw.content
          : Array.isArray(raw?.dtoList)
          ? raw.dtoList
          : Array.isArray(raw?.list)
          ? raw.list
          : [];
        setCategories(arr);
      })
      .catch(() => setCategories([]));
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // 파일 추가: 총합이 MAX_IMAGES를 넘지 않도록 제한
  const onImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remainSlots = Math.max(0, MAX_IMAGES - images.length);
    const picked = files.slice(0, remainSlots);
    setImages((prev) => [...prev, ...picked]);
    e.target.value = ""; // 같은 파일 재선택 가능
  };

  // 선택한 파일 개별 제거
  const removeImageAt = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // 미리보기 URL 생성/해제
  const previews = useMemo(
    () => images.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [images]
  );
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.tagNames.includes(t) || form.tagNames.length >= MAX_TAGS)
      return;
    setForm((f) => ({ ...f, tagNames: [...f.tagNames, t] }));
    setTagInput("");
  };
  const removeTag = (t) =>
    setForm((f) => ({ ...f, tagNames: f.tagNames.filter((x) => x !== t) }));

  const validate = () => {
    if (!form.title || form.title.length > MAX_TITLE) {
      alert(`제목은 1~${MAX_TITLE}자`);
      return false;
    }
    if (!form.description || form.description.length > MAX_DESC) {
      alert(`설명은 1~${MAX_DESC}자`);
      return false;
    }
    if (!form.price || Number.isNaN(Number(form.price))) {
      alert("가격을 숫자로 입력하세요");
      return false;
    }
    if (!form.categoryId) {
      alert("카테고리를 선택하세요");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    await addProduct(form, images); // status/conditionStatus/tagNames/addr 등 포함
    window.location.href = "/product/list";
  };

  const remainSlots = Math.max(0, MAX_IMAGES - images.length);

  return (
    <section>
      <div className="card bg-base-100 shadow-sm border border-base-300/50">
        <div className="card-body p-4">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            상품 등록
          </h2>

          <form className="space-y-5 mt-2" onSubmit={handleSubmit}>
            {/* 제목 */}
            <div>
              <label className="block mb-1 font-medium">제목</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                maxLength={MAX_TITLE}
                required
                placeholder="상품 제목"
                className="input input-bordered w-full
                           focus:outline-none focus:ring-2 focus:ring-secondary/40
                           focus:ring-offset-2 focus:ring-offset-base-100
                           focus:border-secondary
                           transition-[box-shadow,border-color] duration-150"
              />
            </div>

            {/* 설명 */}
            <div>
              <label className="block mb-1 font-medium">설명</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={8}
                maxLength={MAX_DESC}
                required
                placeholder="상품 설명을 입력하세요"
                className="textarea textarea-bordered w-full
                           focus:outline-none focus:ring-2 focus:ring-secondary/40
                           focus:ring-offset-2 focus:ring-offset-base-100
                           focus:border-secondary
                           transition-[box-shadow,border-color] duration-150"
              />
            </div>

            {/* 가격 / 상품 상태 / 판매 상태  (Modify와 동일 배치) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">가격</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={onChange}
                  placeholder="숫자만 입력"
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

              {form.tagNames.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
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

            {/* 거래 주소 + 지도 (Modify와 동일 컨테이너/높이) */}
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

            {/* (기타) 거래 방식 / 카테고리 - 프로젝트 요구사항 유지 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">거래 방식</label>
                <select
                  name="tradeMethod"
                  value={form.tradeMethod}
                  onChange={onChange}
                  className="select select-bordered w-full
                             focus:outline-none focus:ring-2 focus:ring-secondary/40
                             focus:ring-offset-2 focus:ring-offset-base-100
                             focus:border-secondary
                             transition-[box-shadow,border-color] duration-150"
                >
                  <option>직거래</option>
                  <option>택배</option>
                  <option>나눔</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">카테고리</label>
                <select
                  name="categoryId"
                  value={String(form.categoryId ?? "")}
                  onChange={onChange}
                  required
                  className="select select-bordered w-full
                             focus:outline-none focus:ring-2 focus:ring-secondary/40
                             focus:ring-offset-2 focus:ring-offset-base-100
                             focus:border-secondary
                             transition-[box-shadow,border-color] duration-150"
                >
                  <option value="">선택</option>
                  {categories.map((c) => (
                    <option
                      key={c.categoryId ?? c.id}
                      value={c.categoryId ?? c.id}
                    >
                      {c.name ?? c.categoryName ?? c.title ?? "카테고리"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 이미지 (Modify와 동일 UI) */}
            <div>
              <div className="text-sm font-medium mb-2">
                이미지 (최대 {MAX_IMAGES})
                <span className="ml-1 text-base-content/60">
                  (남은 슬롯: {remainSlots})
                </span>
              </div>

              <div className="rounded-box border-2 border-dashed border-base-300/70 p-4 bg-base-100">
                <label
                  htmlFor="productImages"
                  className={`cursor-pointer flex items-center justify-center h-28 rounded-box border border-base-300/50 text-base-content/70 hover:border-secondary transition ${
                    remainSlots <= 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
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
                  id="productImages"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onImagesChange}
                  disabled={remainSlots <= 0}
                  className="hidden"
                />

                {previews.length > 0 && (
                  <ul className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {previews.map((p, idx) => (
                      <li
                        key={idx}
                        className="relative rounded-box border border-base-300/50 p-2"
                      >
                        <img
                          src={p.url}
                          alt=""
                          className="w-full h-28 object-contain bg-base-100 rounded"
                        />
                        <div className="px-1.5 pt-1 text-[11px] truncate">
                          {p.file.name}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImageAt(idx)}
                          className="btn btn-xs btn-circle btn-ghost absolute -top-2 -right-2"
                          title="이미지 제거"
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
              <button className="btn btn-secondary">등록</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
