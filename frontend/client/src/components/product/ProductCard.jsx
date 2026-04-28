// client/src/components/product/ProductCard.jsx
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

const DEFAULT_IMG = "/no_image.png";

export default function ProductCard({ item = {} }) {
  const {
    productId,
    title,
    price,
    thumbnailUrl,
    addr,
    conditionStatus,
    status,
  } = item;

  // 서버(new) seller.nicname / 서버(구) sellerNicname 모두 대응
  const sellerName = item?.seller?.nicname ?? item?.sellerNickname ?? "";

  const isSold = status === "SOLD";
  const imgSrc = thumbnailUrl || DEFAULT_IMG;

  return (
    <Link
      to={`/product/read/${productId}`}
      className="
        card bg-base-100 border border-base-300/50 shadow-sm rounded-2xl overflow-hidden
        h-full flex flex-col
        transition hover:shadow-md
        focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40
        focus-visible:ring-offset-2 focus-visible:ring-offset-base-100
      "
    >
      {/* 이미지 (정사각형 비율) */}
      <div className="relative aspect-square overflow-hidden bg-base-100">
        {status && (
          <StatusBadge
            status={status}
            className="absolute top-2 left-2 z-[1]"
          />
        )}

        <img
          src={imgSrc}
          alt={title || "상품 이미지"}
          className={`w-full h-full object-cover ${isSold ? "grayscale" : ""}`}
          loading="lazy"
          onError={(e) => {
            const t = e.target;
            if (t.dataset.err) return;
            t.dataset.err = "1";
            t.src = DEFAULT_IMG;
          }}
        />
      </div>

      {/* 본문 */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="font-semibold text-base-content truncate">{title}</div>

        <div className="mt-1 text-sm text-base-content/60 truncate">
          {sellerName ? `${sellerName} · ` : ""}
          {addr || "택배"}
          {conditionStatus ? ` · ${conditionStatus}` : ""}
        </div>

        <div className="mt-auto pt-2 font-semibold text-secondary">
          {Number(price)?.toLocaleString?.() ?? price}원
        </div>
      </div>
    </Link>
  );
}
