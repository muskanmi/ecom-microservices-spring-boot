import { useEffect, useState } from "react";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";

import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";

import { deleteProduct, getProducts } from "../services/productApi";

import { getProductImageUrl } from "../services/imageUtils";
import { useNavigate } from "react-router-dom";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getProducts();

      setProducts(response.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);

      setError(
        "Unable to load products. Please make sure the Seller Admin service is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId, productName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${productName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProduct(productId);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId),
      );
    } catch (err) {
      console.error("Failed to delete product:", err);

      window.alert("Unable to delete the product. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      {/* Page Header */}
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
            Seller Console / Catalogue
          </p>

          <h1 className="font-serif text-4xl text-[#233636]">Products</h1>

          <p className="mt-3 text-sm leading-6 text-[#6F766F]">
            Manage the products available in your marketplace catalogue.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => navigate("/admin/products/new")}
          sx={{
            backgroundColor: "#2D3A3A",
            color: "#FFFCF4",
            borderRadius: 0,
            textTransform: "none",
            padding: "10px 18px",
            fontFamily: "inherit",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#233636",
              boxShadow: "none",
            },
          }}
        >
          Add Product
        </Button>
      </div>

      {/* Summary */}
      <div className="mb-6 flex items-center justify-between border-y border-[#DED7C9] bg-[#F7F1E5] px-5 py-4">
        <div className="flex items-center gap-3">
          <Inventory2OutlinedIcon fontSize="small" className="text-[#8A8378]" />

          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6F766F]">
            Catalogue
          </span>
        </div>

        <span className="font-serif text-sm text-[#233636]">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[300px] items-center justify-center border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="flex flex-col items-center gap-4">
            <CircularProgress
              size={28}
              sx={{
                color: "#2D3A3A",
              }}
            />

            <p className="text-sm text-[#8A8378]">Loading products...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="border border-[#C9A7A0] bg-[#F7EDEA] px-6 py-8">
          <p className="font-serif text-lg text-[#5A302A]">
            Something went wrong
          </p>

          <p className="mt-2 text-sm text-[#7A514A]">{error}</p>

          <button
            type="button"
            onClick={loadProducts}
            className="mt-5 border border-[#5A302A] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#5A302A] transition hover:bg-[#5A302A] hover:text-white"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="border border-[#DED7C9] bg-[#F7F1E5] px-6 py-16 text-center">
          <Inventory2OutlinedIcon
            sx={{
              fontSize: 40,
              color: "#8A8378",
            }}
          />

          <h2 className="mt-4 font-serif text-2xl text-[#233636]">
            No products yet
          </h2>

          <p className="mt-2 text-sm text-[#8A8378]">
            Your catalogue is currently empty.
          </p>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && products.length > 0 && (
        <div className="overflow-hidden border border-[#DED7C9] bg-[#F7F1E5]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#DED7C9]">
                  <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Price
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => {
                  const firstImage =
                    product.images && product.images.length > 0
                      ? product.images[0].imageUrl
                      : null;

                  const imageUrl = getProductImageUrl(firstImage);

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-[#DED7C9] last:border-b-0 transition hover:bg-[#FFFCF4]"
                    >
                      {/* Product */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 shrink-0 overflow-hidden border border-[#DED7C9] bg-[#FFFCF4]">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <Inventory2OutlinedIcon
                                  sx={{
                                    color: "#B1AA9E",
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div>
                            <p className="font-serif text-base text-[#233636]">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-[#8A8378]">
                              ID #{product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-5">
                        <span className="font-serif text-base text-[#233636]">
                          ₹{Number(product.price || 0).toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-5">
                        <span className="text-sm text-[#4F5955]">
                          {product.stock ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {product.stock > 0 ? (
                          <span className="inline-flex border border-[#B7C8B5] bg-[#EDF4EA] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#466044]">
                            In Stock
                          </span>
                        ) : (
                          <span className="inline-flex border border-[#D4B5AF] bg-[#F7EDEA] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A4A42]">
                            Out of Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-1">
                          <Tooltip title="Edit product">
                            <IconButton
                              size="small"
                              sx={{
                                color: "#4F5955",
                                "&:hover": {
                                  backgroundColor: "#EDE7DB",
                                },
                              }}
                              onClick={() =>
                                navigate(`/admin/products/${product.id}/edit`)
                              }
                            >
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Delete product">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                              sx={{
                                color: "#7A4A42",
                                "&:hover": {
                                  backgroundColor: "#F7EDEA",
                                },
                              }}
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
