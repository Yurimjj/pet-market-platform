// src/pages/admin/ReportList.jsx  (또는 기존 경로 유지)
import React, { useEffect, useState } from "react";
import jwtAxios from "../../util/JWTUtil";

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    jwtAxios
      .get("/admin/reports") // ← /api 제거 (jwtAxios에 baseURL=/api 이미 설정)
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.items)
          ? res.data.items
          : [];
        setReports(data);
      })
      .catch((err) => {
        console.error("신고 내역 로드 실패:", err);
        setError("신고 내역을 불러오는데 실패했습니다.");
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 뱃지 톤 매핑
  const statusBadgeClass = (s = "") => {
    const key = String(s).toUpperCase();
    if (key.includes("RESOLVED") || key.includes("DONE"))
      return "badge-success";
    if (key.includes("REJECT")) return "badge-error";
    if (key.includes("PENDING") || key.includes("WAIT")) return "badge-warning";
    return "badge-ghost";
    // 필요 시: "IN_PROGRESS" => "badge-info"
  };

  const typeBadgeText = (t = "") => {
    const key = String(t).toUpperCase();
    if (key === "USER") return "사용자";
    if (key === "PRODUCT") return "상품";
    if (key === "POST") return "게시글";
    if (key === "COMMENT") return "댓글";
    return t || "-";
  };

  const fmtDate = (v) => {
    if (!v) return "";
    try {
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return String(v);
      return d.toLocaleString();
    } catch {
      return String(v);
    }
  };

  return (
    <section className="card bg-base-100 shadow-sm border border-base-300/50">
      <div className="card-body p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="card-title text-xl lg:text-2xl text-secondary">
            신고 내역
          </h2>
          <span className="text-sm text-base-content/60">
            총 {reports.length.toLocaleString()}건
          </span>
        </div>

        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-box border border-base-300/50 bg-base-100"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="skeleton h-4 w-16" />
                  <div className="skeleton h-5 w-20" />
                  <div className="skeleton h-5 w-16" />
                </div>
                <div className="skeleton h-4 w-3/5 mb-2" />
                <div className="skeleton h-4 w-4/5" />
              </div>
            ))}
          </div>
        )}

        {/* 에러 */}
        {!loading && error && (
          <div className="alert alert-error text-sm">
            <span>{error}</span>
          </div>
        )}

        {/* 비어있음 */}
        {!loading && !error && reports.length === 0 && (
          <div className="card bg-base-100 border border-base-300/50 shadow-sm p-8 text-center">
            <span className="text-base-content/70">
              신고 데이터가 없습니다.
            </span>
          </div>
        )}

        {/* 리스트 */}
        {!loading && !error && reports.length > 0 && (
          <div className="card bg-base-100 border border-base-300/50 shadow-sm">
            <ul className="divide-y divide-base-300/50">
              {reports.map((r) => (
                <li
                  key={
                    r.reportId ?? `${r.reportedType}-${r.id ?? Math.random()}`
                  }
                  className="p-4"
                >
                  {/* 헤더 정보 */}
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs sm:text-sm text-base-content/60">
                      #{r.reportId ?? "-"}
                    </span>
                    <span
                      className={`badge ${statusBadgeClass(
                        r.reportStatus
                      )} badge-sm`}
                    >
                      {r.reportStatus ?? "상태 미상"}
                    </span>
                    <span className="badge badge-outline badge-sm">
                      {typeBadgeText(r.reportedType)}
                    </span>
                    {r.createdAt && (
                      <span className="text-xs text-base-content/50 ml-auto">
                        {fmtDate(r.createdAt)}
                      </span>
                    )}
                  </div>

                  {/* 사유 / 상세 */}
                  <div className="font-medium text-base-content">
                    {r.reportReason ?? "사유 미입력"}
                  </div>
                  {r.reportDetail && (
                    <div className="text-sm text-base-content/70 mt-1 whitespace-pre-line">
                      {r.reportDetail}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReportList;
