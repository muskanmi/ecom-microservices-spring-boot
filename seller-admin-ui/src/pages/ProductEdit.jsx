import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { Alert, Button, CircularProgress, TextField } from "@mui/material";

import {
  getProduct,
  updateProduct,
  uploadProductImages,
  deleteProductImage,
} from "../services/productApi";

import { getProductImageUrl } from "../services/imageUtils";

function ProductEdit() {
  const { productId } = useParams();

  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  // ========================================================
  // STATE
  // ========================================================

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    stock: "",
    categoryId: "",
  });

  const [existingImages, setExistingImages] = useState([]);

  const [selectedImages, setSelectedImages] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [uploadStatus, setUploadStatus] = useState("");

  // ========================================================
  // LOAD PRODUCT
  // ========================================================

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await getProduct(productId);

        const product = response.data;

        console.log("Loaded product:", product);

        setFormData({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          mrp: product.mrp ?? "",
          stock: product.stock ?? "",
          categoryId: product.categoryId ?? "",
        });

        setExistingImages(product.images || []);
      } catch (err) {
        console.error("Unable to load product:", err);

        setError(err?.response?.data?.message || "Unable to load the product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  // ========================================================
  // FORM CHANGE
  // ========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setSuccess("");
  };

  // ========================================================
  // SELECT NEW IMAGES
  // ========================================================

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      setError("Only image files can be selected.");
    } else {
      setError("");
    }

    setSelectedImages((current) => [...current, ...validFiles]);

    // Allow selecting the same file again.
    event.target.value = "";
  };

  // ========================================================
  // REMOVE NEW IMAGE
  // ========================================================

  const removeSelectedImage = (indexToRemove) => {
    setSelectedImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  // ========================================================
  // DELETE EXISTING IMAGE
  // ========================================================

  const handleDeleteExistingImage = async (imageId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProductImage(productId, imageId);

      setExistingImages((current) =>
        current.filter((image) => image.id !== imageId),
      );

      setSuccess("Image deleted successfully.");
    } catch (err) {
      console.error("Unable to delete image:", err);

      setError(err?.response?.data?.message || "Unable to delete the image.");
    }
  };

  // ========================================================
  // VALIDATION
  // ========================================================

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.description.trim()) {
      return "Product description is required.";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      return "Please enter a valid product price.";
    }

    if (!formData.mrp || Number(formData.mrp) <= 0) {
      return "Please enter a valid MRP.";
    }

    if (formData.stock === "" || Number(formData.stock) < 0) {
      return "Please enter a valid stock quantity.";
    }

    if (!formData.categoryId) {
      return "Please enter a category ID.";
    }

    return null;
  };

  // ========================================================
  // SAVE PRODUCT
  // ========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccess("");

    setUploadStatus("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    const request = {
      name: formData.name.trim(),

      description: formData.description.trim(),

      price: Number(formData.price),

      mrp: Number(formData.mrp),

      stock: Number(formData.stock),

      categoryId: Number(formData.categoryId),
    };

    try {
      setSaving(true);

      // ==================================================
      // STEP 1 — UPDATE PRODUCT
      // ==================================================

      await updateProduct(productId, request);

      // ==================================================
      // STEP 2 — UPLOAD NEW IMAGES
      // ==================================================

      if (selectedImages.length > 0) {
        setUploadStatus(
          `Uploading ${selectedImages.length} image${
            selectedImages.length > 1 ? "s" : ""
          }...`,
        );

        await uploadProductImages(productId, selectedImages);

        setSelectedImages([]);
      }

      // ==================================================
      // STEP 3 — SUCCESS
      // ==================================================

      setSuccess("Product updated successfully.");

      setUploadStatus("");

      // Give the user a moment to see success.
      setTimeout(() => {
        navigate("/admin/products");
      }, 700);
    } catch (err) {
      console.error("Unable to update product:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update the product.",
      );
    } finally {
      setSaving(false);

      setUploadStatus("");
    }
  };

  // ========================================================
  // LOADING
  // ========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <CircularProgress
            size={28}
            sx={{
              color: "#2D3A3A",
            }}
          />

          <p className="mt-4 text-sm text-[#8A8378]">Loading product...</p>
        </div>
      </div>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* ==================================================
                HEADER
            ================================================== */}

      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#6F766F] transition hover:text-[#233636]"
        >
          <ArrowBackOutlinedIcon fontSize="small" />
          Back to Products
        </button>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
          Seller Console / Catalogue / Edit Product
        </p>

        <h1 className="font-serif text-4xl text-[#233636]">Edit Product</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F766F]">
          Update your product details, pricing, inventory and images.
        </p>
      </div>

      {/* ==================================================
                ERROR
            ================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 3,
            borderRadius: 0,
            border: "1px solid #D4B5AF",
            backgroundColor: "#F7EDEA",
            color: "#5A302A",
            "& .MuiAlert-icon": {
              color: "#7A4A42",
            },
          }}
        >
          {error}
        </Alert>
      )}

      {/* ==================================================
                SUCCESS
            ================================================== */}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{
            mb: 3,
            borderRadius: 0,
            border: "1px solid #C7D6C7",
            backgroundColor: "#EEF5EE",
            color: "#34543A",
          }}
        >
          {success}
        </Alert>
      )}

      {/* ==================================================
                UPLOAD STATUS
            ================================================== */}

      {uploadStatus && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 0,
            border: "1px solid #DED7C9",
            backgroundColor: "#F7F1E5",
            color: "#2D3A3A",
          }}
        >
          {uploadStatus}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* ==================================================
                    MAIN GRID
                ================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* =================================================
                        BASIC DETAILS
                    ================================================= */}

          <section className="border border-[#DED7C9] bg-[#F7F1E5] lg:col-span-2">
            <div className="border-b border-[#DED7C9] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Product Information
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Basic Details
              </h2>
            </div>

            <div className="space-y-5 px-6 py-7">
              {/* Product name */}

              <TextField
                fullWidth
                required
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    backgroundColor: "#FFFCF4",
                    "& fieldset": {
                      borderColor: "#DED7C9",
                    },
                    "&:hover fieldset": {
                      borderColor: "#A9A195",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2D3A3A",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2D3A3A",
                  },
                }}
              />

              {/* Description */}

              <TextField
                fullWidth
                required
                multiline
                minRows={5}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    backgroundColor: "#FFFCF4",
                    "& fieldset": {
                      borderColor: "#DED7C9",
                    },
                    "&:hover fieldset": {
                      borderColor: "#A9A195",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2D3A3A",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2D3A3A",
                  },
                }}
              />

              {/* =================================================
                                EXISTING IMAGES
                            ================================================= */}

              <div className="border-t border-[#DED7C9] pt-6">
                <div className="mb-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Catalogue
                  </p>

                  <h3 className="mt-2 font-serif text-xl text-[#233636]">
                    Product Images
                  </h3>
                </div>

                {existingImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {existingImages.map((image) => (
                      <div
                        key={image.id}
                        className="group relative overflow-hidden border border-[#DED7C9] bg-[#FFFCF4]"
                      >
                        <img
                          src={getProductImageUrl(image.imageUrl)}
                          alt="Product"
                          className="h-40 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteExistingImage(image.id)}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-[#DED7C9] bg-[#FFFCF4] text-[#7A4A42] opacity-0 transition group-hover:opacity-100 hover:bg-[#F7EDEA]"
                          title="Delete image"
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </button>

                        <div className="border-t border-[#DED7C9] px-3 py-2">
                          <p className="text-xs text-[#8A8378]">
                            Image {image.displayOrder}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-[#B7B0A4] px-6 py-10 text-center">
                    <ImageOutlinedIcon
                      sx={{
                        fontSize: 32,
                        color: "#8A8378",
                      }}
                    />

                    <p className="mt-3 font-serif text-lg text-[#233636]">
                      No product images
                    </p>

                    <p className="mt-2 text-xs text-[#8A8378]">
                      Add images below.
                    </p>
                  </div>
                )}

                {/* =================================================
                                    NEW IMAGE UPLOAD
                                ================================================= */}

                <div className="mt-6">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelection}
                    className="hidden"
                  />

                  {selectedImages.length > 0 && (
                    <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {selectedImages.map((file, index) => {
                        const previewUrl = URL.createObjectURL(file);

                        return (
                          <div
                            key={`${file.name}-${index}`}
                            className="group relative overflow-hidden border border-[#DED7C9] bg-[#FFFCF4]"
                          >
                            <img
                              src={previewUrl}
                              alt={`New image ${index + 1}`}
                              className="h-40 w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => removeSelectedImage(index)}
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-[#DED7C9] bg-[#FFFCF4] text-[#7A4A42] opacity-0 transition group-hover:opacity-100 hover:bg-[#F7EDEA]"
                            >
                              <DeleteOutlineOutlinedIcon fontSize="small" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center border border-dashed border-[#B7B0A4] bg-[#FFFCF4] px-6 py-8 text-center transition hover:border-[#2D3A3A] hover:bg-[#F9F4EA]"
                  >
                    <ImageOutlinedIcon
                      sx={{
                        fontSize: 32,
                        color: "#8A8378",
                      }}
                    />

                    <span className="mt-2 font-serif text-lg text-[#233636]">
                      Add More Images
                    </span>

                    <span className="mt-2 text-xs text-[#8A8378]">
                      Select one or more product images
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
                        PRICING & INVENTORY
                    ================================================= */}

          <section className="border border-[#DED7C9] bg-[#F7F1E5]">
            <div className="border-b border-[#DED7C9] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                Catalogue
              </p>

              <h2 className="mt-2 font-serif text-xl text-[#233636]">
                Pricing & Inventory
              </h2>
            </div>

            <div className="space-y-5 px-6 py-7">
              {/* Price */}

              <TextField
                fullWidth
                required
                type="number"
                label="Selling Price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    backgroundColor: "#FFFCF4",
                    "& fieldset": {
                      borderColor: "#DED7C9",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2D3A3A",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2D3A3A",
                  },
                }}
              />

              {/* MRP */}

              <TextField
                fullWidth
                required
                type="number"
                label="MRP"
                name="mrp"
                value={formData.mrp}
                onChange={handleChange}
                inputProps={{
                  min: 0,
                  step: "0.01",
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    backgroundColor: "#FFFCF4",
                    "& fieldset": {
                      borderColor: "#DED7C9",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2D3A3A",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2D3A3A",
                  },
                }}
              />

              {/* Stock */}

              <TextField
                fullWidth
                required
                type="number"
                label="Stock Quantity"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                inputProps={{
                  min: 0,
                  step: 1,
                }}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    backgroundColor: "#FFFCF4",
                    "& fieldset": {
                      borderColor: "#DED7C9",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2D3A3A",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2D3A3A",
                  },
                }}
              />

              {/* Category */}

              <TextField
                fullWidth
                required
                type="number"
                label="Category ID"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                inputProps={{
                  min: 1,
                  step: 1,
                }}
                helperText="Use the category ID from your catalogue."
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 0,
                    backgroundColor: "#FFFCF4",
                    "& fieldset": {
                      borderColor: "#DED7C9",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2D3A3A",
                    },
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#2D3A3A",
                  },
                  "& .MuiFormHelperText-root": {
                    marginLeft: 0,
                    color: "#8A8378",
                  },
                }}
              />
            </div>
          </section>
        </div>

        {/* ==================================================
                    ACTIONS
                ================================================== */}

        <div className="mt-6 flex justify-end gap-3 border-t border-[#DED7C9] pt-6">
          <Button
            type="button"
            variant="outlined"
            disabled={saving}
            onClick={() => navigate("/admin/products")}
            sx={{
              borderRadius: 0,
              borderColor: "#B7B0A4",
              color: "#4F5955",
              textTransform: "none",
              padding: "10px 20px",
              boxShadow: "none",
              "&:hover": {
                borderColor: "#2D3A3A",
                backgroundColor: "#F7F1E5",
              },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress
                  size={17}
                  sx={{
                    color: "#FFFCF4",
                  }}
                />
              ) : (
                <SaveOutlinedIcon />
              )
            }
            sx={{
              borderRadius: 0,
              backgroundColor: "#2D3A3A",
              color: "#FFFCF4",
              textTransform: "none",
              padding: "10px 22px",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#233636",
                boxShadow: "none",
              },
            }}
          >
            {saving ? uploadStatus || "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProductEdit;
