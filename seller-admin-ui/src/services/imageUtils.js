export function getProductImageUrl(imageUrl) {
  if (!imageUrl) {
    return null;
  }

  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://") ||
    imageUrl.startsWith("data:")
  ) {
    return imageUrl;
  }

  return `${import.meta.env.VITE_CATALOG_URL}${imageUrl}`;
}
