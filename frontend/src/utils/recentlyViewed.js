// Remembers the products a shopper has looked at, so they can jump back to
// them later. Stored per browser in localStorage; every access is guarded
// because storage can be unavailable (private mode, blocked site data).

const STORAGE_KEY = "ecom.recentlyViewed";
const MAX_ITEMS = 12;

const readAll = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id) : [];
  } catch {
    return [];
  }
};

export const getRecentlyViewed = (excludeId) =>
  readAll().filter((item) => String(item.id) !== String(excludeId));

// Stores only what the card needs, most recent first, without duplicates.
export const trackProductView = (product) => {
  if (!product?.id) return;

  const entry = {
    id: product.id,
    name: product.name || "",
    price: product.price ?? null,
    mrp: product.mrp ?? null,
    imageUrl: product.images?.[0]?.imageUrl || null,
  };

  const next = [
    entry,
    ...readAll().filter((item) => String(item.id) !== String(entry.id)),
  ].slice(0, MAX_ITEMS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore: the feature simply does not remember anything.
  }
};

export const clearRecentlyViewed = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
};
