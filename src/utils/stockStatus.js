// Colour-wise stock helpers shared by the admin pages.
// A colour's stock is the sum of all its sizes. It is "low" when the
// stock is above 0 and <= that colour's lowStockThreshold (default 5).

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export const getColorStock = (color) =>
  (color?.sizes || []).reduce(
    (sum, size) => sum + Math.max(Number(size?.stock || 0), 0),
    0
  );

export const getColorThreshold = (color) => {
  const value = color?.lowStockThreshold;
  const parsed = Number(value);

  return value !== undefined &&
    value !== null &&
    value !== "" &&
    Number.isFinite(parsed) &&
    parsed >= 0
    ? parsed
    : DEFAULT_LOW_STOCK_THRESHOLD;
};

export const getColorStockInfo = (color) => {
  const stock = getColorStock(color);
  const threshold = getColorThreshold(color);

  if (stock <= 0) {
    return {
      stock,
      threshold,
      status: "out_of_stock",
      label: "Out of stock",
      badge: "bg-red-100 text-red-600 border-red-200",
    };
  }

  if (stock <= threshold) {
    return {
      stock,
      threshold,
      status: "low_stock",
      label: "Low stock",
      badge: "bg-amber-100 text-amber-700 border-amber-200",
    };
  }

  return {
    stock,
    threshold,
    status: "in_stock",
    label: "In stock",
    badge: "bg-green-100 text-green-700 border-green-200",
  };
};
