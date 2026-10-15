import { getProductImageUrl } from "../services/imageUtils";

function ProductImage({ imageUrl, alt = "Product", className = "" }) {
  const src = getProductImageUrl(imageUrl);

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-[#F7F1E5] text-[#B0A99D] ${className}`}
      >
        □
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
    />
  );
}

export default ProductImage;
