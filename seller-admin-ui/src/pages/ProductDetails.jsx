import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getProduct } from "../services/productApi";
import { getProductImageUrl } from "../services/imageUtils";
import Loading from "../components/Loading";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProduct(productId);

        if (!mounted) {
          return;
        }

        const productData = response.data;

        setProduct(productData);

        /*
         * Select the first product image automatically.
         */
        if (productData.images && productData.images.length > 0) {
          setSelectedImage(productData.images[0]);
        } else {
          setSelectedImage(null);
        }
      } catch (err) {
        console.error("Failed to load product:", err);

        if (mounted) {
          setError(
            "Unable to load product details. Please make sure the Seller Admin service is running.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <div className="border border-[#D8B5AC] bg-[#F8ECE8] p-6">
          <p className="font-serif text-xl text-[#713F36]">
            Something went wrong
          </p>

          <p className="mt-2 text-sm text-[#8A625A]">{error}</p>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="mt-5 border border-[#713F36] bg-[#713F36] px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#5E342D]"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1500px]">
        <div className="border border-[#DED7C9] bg-[#F7F1E5] p-10 text-center">
          <p className="font-serif text-2xl text-[#233636]">
            Product not found
          </p>

          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="mt-5 border border-[#2D3A3A] bg-[#2D3A3A] px-5 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [];

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Back to products */}
      <Link
        to="/admin/products"
        className="mb-8 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#6F766F] transition hover:text-[#233636]"
      >
        <span className="text-lg">←</span>
        Back to Products
      </Link>

      {/* Page Header */}
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
            Seller Console / Catalogue / Product
          </p>

          <h1 className="font-serif text-4xl text-[#233636]">{product.name}</h1>

          <p className="mt-3 text-sm text-[#6F766F]">
            {product.description || "Product details"}
          </p>
        </div>

        <Link
          to={`/admin/products/${product.id}/edit`}
          className="inline-flex items-center justify-center border border-[#2D3A3A] bg-[#2D3A3A] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#233030]"
        >
          ✎ &nbsp; Edit Product
        </Link>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* =========================
            PRODUCT GALLERY
        ========================== */}

        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="border-b border-[#DED7C9] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
              Product Gallery
            </p>

            <h2 className="mt-2 font-serif text-xl text-[#233636]">
              Product Images
            </h2>
          </div>

          <div className="p-6">
            {images.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center border border-dashed border-[#CFC6B5]">
                <div className="text-center">
                  <p className="font-serif text-lg text-[#233636]">
                    No product images
                  </p>

                  <p className="mt-2 text-sm text-[#8A8378]">
                    Add images from the edit product page.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Main Image */}
                <div className="flex h-[500px] items-center justify-center border border-[#DED7C9] bg-[#FFFDF8] p-8">
                  {selectedImage && (
                    <img
                      src={getProductImageUrl(selectedImage.imageUrl)}
                      alt={product.name}
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>

                {/* Thumbnails */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {images.map((image) => {
                    const isSelected = selectedImage?.id === image.id;

                    return (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        className={`flex h-20 w-20 items-center justify-center overflow-hidden border bg-[#FFFDF8] p-1 transition ${
                          isSelected
                            ? "border-[#2D3A3A] ring-1 ring-[#2D3A3A]"
                            : "border-[#DED7C9] hover:border-[#8A8378]"
                        }`}
                      >
                        <img
                          src={getProductImageUrl(image.imageUrl)}
                          alt={`${product.name} ${image.displayOrder || ""}`}
                          className="h-full w-full object-contain"
                        />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </section>

        {/* =========================
            PRODUCT INFORMATION
        ========================== */}

        <section className="border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="border-b border-[#DED7C9] px-6 py-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
              Catalogue
            </p>

            <h2 className="mt-2 font-serif text-xl text-[#233636]">
              Product Information
            </h2>
          </div>

          <div className="divide-y divide-[#DED7C9]">
            <DetailRow
              label="Selling Price"
              value={`₹${Number(product.price || 0).toLocaleString("en-IN")}`}
            />

            <DetailRow
              label="MRP"
              value={`₹${Number(product.mrp || 0).toLocaleString("en-IN")}`}
            />

            <DetailRow
              label="Stock"
              value={product.stock ?? 0}
              status
              inStock={Number(product.stock || 0) > 0}
              statusValue={
                Number(product.stock || 0) > 0 ? "IN STOCK" : "OUT OF STOCK"
              }
            />

            <DetailRow
              label="Category"
              value={
                product.categoryName || product.categoryId || "Not specified"
              }
            />

            <DetailRow label="Product ID" value={`#${product.id}`} />

            <DetailRow
              label="Images"
              value={`${images.length} ${
                images.length === 1 ? "image" : "images"
              }`}
            />
          </div>
        </section>
      </div>

      {/* =========================
          DESCRIPTION
      ========================== */}

      <section className="mt-6 border border-[#DED7C9] bg-[#F7F1E5]">
        <div className="border-b border-[#DED7C9] px-6 py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
            Product Information
          </p>

          <h2 className="mt-2 font-serif text-xl text-[#233636]">
            Description
          </h2>
        </div>

        <div className="px-6 py-6">
          <p className="max-w-4xl text-sm leading-7 text-[#6F766F]">
            {product.description || "No description available."}
          </p>
        </div>
      </section>
    </div>
  );
}

function DetailRow({
  label,
  value,
  status = false,
  inStock = false,
  statusValue,
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A8378]">
        {label}
      </span>

      {status ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#2D3A3A]">{value}</span>

          <span
            className={`border px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${
              inStock
                ? "border-[#BFD2BF] bg-[#EDF4EC] text-[#4D684D]"
                : "border-[#DABDB6] bg-[#F8ECE8] text-[#87584F]"
            }`}
          >
            {statusValue}
          </span>
        </div>
      ) : (
        <span className="text-right text-sm text-[#2D3A3A]">{value}</span>
      )}
    </div>
  );
}

export default ProductDetails;
