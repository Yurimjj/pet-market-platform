import React, { useEffect, useState } from "react";
import { getPet, updatePet } from "../../api/petApi"; // ← modifyPet → updatePet
import { useNavigate, useParams } from "react-router-dom";

export default function PetModifyComponent() {
  const nav = useNavigate();
  const params = useParams();
  const petId = params.petId ?? params.id;

  const [form, setForm] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const data = await getPet(petId);
        setForm({
          name: data.name ?? "",
          petTypeId: String(data.petTypeId ?? data.typeId ?? 3),
          bodyType: data.bodyType ?? "MEDIUM",
          age: Number(data.age ?? 0),
          gender: data.gender ?? "MALE",
          neutered: Boolean(data.neutered),
          content: data.description ?? data.content ?? "", // ← content로 보관/전송
          imageUrl: data.photoUrl ?? "", // 미리보기
        });
      } finally {
        setFetching(false);
      }
    };
    if (petId) load();
  }, [petId]);

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
    if (file) {
      const preview = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, imageUrl: preview }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await updatePet(petId, {
      name: form.name,
      petTypeId: Number(form.petTypeId),
      bodyType: form.bodyType,
      age: Number(form.age || 0),
      // [ADD] 성별/중성화도 함께 전송해야 서버가 반영합니다.
      gender: form.gender,
      neutered: !!form.neutered,
      content: form.content, // ← description 대신 content 전송
      image: imageFile || undefined, // 선택 시에만 업로드
    });
    alert("수정되었습니다.");
    nav(`/pet/read/${petId}`);
  };

  if (fetching || !form)
    return (
      <div className="py-12 text-center text-base-content/60">Loading...</div>
    );

  return (
    <section className="px-4">
      <div className="card bg-base-100 shadow-sm border border-base-300/50 w-full max-w-3xl mx-auto">
        <div className="card-body p-4">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            반려가족 프로필 수정
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
                  value={form.gender ?? ""} // "" | "MALE" | "FEMALE"
                  onChange={(e) =>
                    setForm({ ...form, gender: e.target.value || null })
                  }
                >
                  <option value="">선택</option>
                  <option value="MALE">수</option>
                  <option value="FEMALE">암</option>
                </select>
              </label>

              <label className="flex items-center gap-2 mt-1 md:mt-0 md:col-span-4">
                <input
                  type="checkbox"
                  name="neutered"
                  className="checkbox checkbox-success"
                  checked={!!form.neutered}
                  onChange={(e) =>
                    setForm({ ...form, neutered: e.target.checked })
                  }
                />
                <span className="text-sm text-base-content/80">
                  중성화 여부
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block mb-1 text-sm text-base-content/70">
                  이미지 업로드
                </span>
                <div className="rounded-box border border-base-300/50 p-4 bg-base-100">
                  <div className="relative">
                    <label
                      htmlFor="petModifyFileInput"
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
                      id="petModifyFileInput"
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
                          setForm((prev) => ({ ...prev, imageUrl: "" }));
                        }}
                        className="ml-2 text-error hover:text-error/80 font-bold"
                        aria-label="파일 제거"
                        title="파일 제거"
                      >
                        &times;
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {form.imageUrl && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-base-content/70">미리보기</span>
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-box border border-base-300/60 shadow-sm"
                  />
                </div>
              )}
            </div>

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
                onClick={() => nav(`/pet/read/${petId}`)}
              >
                취소
              </button>
              <button type="submit" className="btn btn-secondary">
                저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
