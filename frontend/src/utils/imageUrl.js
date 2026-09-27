const CATALOG_SERVICE_URL = "http://localhost:8082";

export const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "/placeholder-product.png";
    }

    // Already a complete URL
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    return `${CATALOG_SERVICE_URL}${imageUrl}`;
};