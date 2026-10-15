import { getColorStockInfo } from "../utils/stockStatus";

// Small live badge showing a colour's total stock and status
export default function ColorStockBadge({ color }) {
  const info = getColorStockInfo(color);

  return (
    <span
      className={`inline-flex items-center gap-2 border px-3 py-1 rounded-full text-sm font-bold ${info.badge}`}
    >
      {info.label} · {info.stock}
    </span>
  );
}
