import React, { useState } from "react";
import { registerPet } from "../../api/petApi";
import { useNavigate } from "react-router-dom";

export default function PetRegisterComponent() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    petTypeId: "1",
    bodyType: "MEDIUM",
    age: 0,
    gender: "MALE",
    neutered: false,
    content: "", // ← description 대신 content로 통일
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onChangeFile = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : "");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // API는 객체를 받아 내부에서 FormData로 변환함
    await registerPet({
      name: form.name,
      petTypeId: Number(form.petTypeId),
      bodyType: form.bodyType,
      age: Number(form.age ?? 0),
      // [ADD] 성별/중성화 전송
      gender: form.gender, // "MALE" | "FEMALE"
      neutered: !!form.neutered, // true | false
      content: form.content, // ← content로 전송
      image: imageFile || undefined, // 선택 시에만 업로드
    });

    alert("등록되었습니다.");
    nav("/user/profile?tab=PET");
  };

  return (
    <section className="px-4">
      <div className="card bg-base-100 shadow-sm border border-base-300/50 w-full max-w-3xl mx-auto">
        <div className="card-body p-4">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            반려가족 프로필 등록
          </h2>

          <form
            onSubmit={onSubmit}
            className="space-y-4 mt-2 max-w-2xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <label className="flex flex-col gap-1 md:col-span-12">
                <span className="text-sm text-base-content/70">이름</span>
                <input
                  className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                />
              </label>

              <label className="flex flex-col gap-1 md:col-span-6">
                <span className="text-sm text-base-content/70">유형</span>
                <select
                  className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  name="petTypeId"
                  value={form.petTypeId}
                  onChange={onChange}
                >
                  <option value="1">강아지</option>
                  <option value="2">고양이</option>
                  <option value="3">기타</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 md:col-span-6">
                <span className="text-sm text-base-content/70">체형</span>
                <select
                  className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  name="bodyType"
                  value={form.bodyType}
                  onChange={onChange}
                >
                  <option value="SMALL">소형</option>
                  <option value="MEDIUM">중형</option>
                  <option value="LARGE">대형</option>
                </select>
              </label>

              <label className="flex flex-col gap-1 md:col-span-4">
                <span className="text-sm text-base-content/70">나이</span>
                <input
                  className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  type="number"
                  min="0"
                  name="age"
                  value={form.age}
                  onChange={onChange}
                />
              </label>

              <label className="flex flex-col gap-1 md:col-span-4">
                <span className="text-sm text-base-content/70">성별</span>
                <select
                  className="select select-bordered w-full focus:outline-none focus:ring-2 focus:ring-secondary/40"
                  name="gender"
                  value={form.gender}
                  onChange={onChange}
                >
                  <option value="MALE">수</option>
                  <option value="FEMALE">암</option>
                </select>
              </label>

              <label className="flex items-center gap-2 mt-1 md:mt-0 md:col-span-4">
                <input
                  type="checkbox"
                  name="neutered"
                  checked={form.neutered}
                  onChange={onChange}
                  className="checkbox checkbox-success"
                />
                <span className="text-sm text-base-content/80">
                  중성화 여부
                </span>
              </label>
            </div>

            {/* ▼ 파일 업로드: BoardPostComponent 톤과 동일한 드롭존/점선박스 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block mb-1 text-sm text-base-content/70">
                  이미지 업로드
                </span>
                <div className="rounded-box border border-base-300/50 p-4 bg-base-100">
                  <div className="relative">
                    <label
                      htmlFor="petFileInput"
                      className="cursor-pointer flex items-center justify-center p-3 rounded-box border-2 border-dashed border-base-300/70 text-base-content/70 hover:border-secondary transition"
                    >
                      <svg
                        className="w-6 h-6 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        ></path>
                      </svg>
                      <span>파일 선택</span>
                    </label>
                    <input
                      id="petFileInput"
                      type="file"
                      accept="image/*"
                      onChange={onChangeFile}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>

                  {imageFile && (
                    <div className="mt-2 text-sm text-base-content/70 flex items-center justify-between">
                      <span className="break-all">{imageFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl("");
                        }}
                        className="ml-2 text-error hover:text-error/80 font-bold"
                        aria-label="파일 제거"
                        title="파일 제거"
                      >
                        &times;
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-base-content/60 mt-2 text-center">
                    이미지는 1개만 업로드할 수 있습니다.
                  </p>
                </div>
              </div>

              {previewUrl && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-base-content/70">미리보기</span>
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-box border border-base-300/60 shadow-sm"
                  />
                </div>
              )}
            </div>
            {/* ▲ 파일 업로드 끝 */}

            <label className="flex flex-col gap-1">
              <span className="text-sm text-base-content/70">설명</span>
              <textarea
                className="textarea textarea-bordered w-full focus:outline-none focus:ring-2 focus:ring-secondary/40"
                name="content" // ← name을 content로
                value={form.content}
                onChange={onChange}
                placeholder="반려동물 소개를 적어주세요."
                rows={5}
              />
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-base-300/50">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => nav("/pet/list")}
              >
                목록
              </button>
              <button type="submit" className="btn btn-secondary">
                등록
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
