// 상태 배지 (리스트/상세 공용)
export default function StatusBadge({ status, className = "" }) {
  const meta = {
    SELLING: { label: "판매 중", cls: "badge-info" },
    RESERVED: { label: "예약 중", cls: "badge-warning" },
    SOLD: { label: "거래 완료", cls: "badge-accent" }, // 서버에서 SOLD_OUT/COMPLETED이면 여기 value만 맞추세요
  };
  const m = meta[status] || {
    label: status || "상태 없음",
    cls: "badge-ghost text-base-content/70",
  };
  return (
    <span className={`badge badge-sm ${m.cls} ${className}`}>{m.label}</span>
  );
}
