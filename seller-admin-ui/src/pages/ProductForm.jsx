import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { Alert, Button, CircularProgress, TextField } from "@mui/material";

import { createProduct, uploadProductImages } from "../services/productApi";

function ProductForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    mrp: "",
    stock: "",
    categoryId: "",
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  /*
   * ---------------------------------------------------------
   * FORM CHANGE
   * ---------------------------------------------------------
   */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /*
   * ---------------------------------------------------------
   * IMAGE SELECTION
   * ---------------------------------------------------------
   */

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setError("");

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name} is not an image.`);
        return;
      }

      // Backend currently allows max 10 MB per image
      if (file.size > 10 * 1024 * 1024) {
        invalidFiles.push(`${file.name} is larger than 10 MB.`);
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setError(invalidFiles.join(" "));
    }

    if (validFiles.length > 0) {
      setSelectedImages((current) => [...current, ...validFiles]);
    }

    // Allow selecting the same file again
    event.target.value = "";
  };

  /*
   * ---------------------------------------------------------
   * REMOVE SELECTED IMAGE
   * ---------------------------------------------------------
   */

  const removeSelectedImage = (indexToRemove) => {
    setSelectedImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  /*
   * ---------------------------------------------------------
   * VALIDATION
   * ---------------------------------------------------------
   */

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.description.trim()) {
      return "Product description is required.";
    }

    if (!formData.price || Number(formData.price) <= 0) {
      return "Please enter a valid selling price.";
    }

    if (!formData.mrp || Number(formData.mrp) <= 0) {
      return "Please enter a valid MRP.";
    }

    if (Number(formData.mrp) < Number(formData.price)) {
      return "MRP cannot be lower than the selling price.";
    }

    if (
      formData.stock === "" ||
      Number(formData.stock) < 0 ||
      !Number.isInteger(Number(formData.stock))
    ) {
      return "Please enter a valid stock quantity.";
    }

    if (!formData.categoryId || Number(formData.categoryId) <= 0) {
      return "Please enter a valid category ID.";
    }

    return null;
  };

  /*
   * ---------------------------------------------------------
   * CREATE PRODUCT
   * ---------------------------------------------------------
   */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
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
      setLoading(true);

      /*
       * =====================================================
       * STEP 1 — CREATE PRODUCT
       * =====================================================
       */

      setUploadStatus("Creating product...");

      const productResponse = await createProduct(request);

      const createdProduct = productResponse?.data;

      console.log("Product created:", createdProduct);

      const productId = createdProduct?.id;

      if (!productId) {
        throw new Error(
          "Product was created, but the server did not return a product ID.",
        );
      }

      console.log("Created product ID:", productId);

      /*
       * =====================================================
       * STEP 2 — UPLOAD IMAGES
       * =====================================================
       */

      if (selectedImages.length > 0) {
        setUploadStatus(
          `Uploading ${selectedImages.length} image${
            selectedImages.length > 1 ? "s" : ""
          }...`,
        );

        await uploadProductImages(productId, selectedImages);

        console.log("Product images uploaded successfully.");
      }

      /*
       * =====================================================
       * STEP 3 — SUCCESS
       * =====================================================
       */

      navigate(`/admin/products/${productId}`);
    } catch (err) {
      console.error("Product creation failed:", err);

      const backendMessage =
        err?.response?.data?.message || err?.response?.data?.error;

      setError(
        backendMessage ||
          err?.message ||
          "Unable to create the product. Please try again.",
      );
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  /*
   * ---------------------------------------------------------
   * CLEAN UP IMAGE PREVIEW URLS
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      selectedImages.forEach((file) => {
        if (file.__previewUrl) {
          URL.revokeObjectURL(file.__previewUrl);
        }
      });
    };
  }, [selectedImages]);

  /*
   * ---------------------------------------------------------
   * CREATE PREVIEW URL
   * ---------------------------------------------------------
   */

  const getPreviewUrl = (file) => {
    if (!file.__previewUrl) {
      file.__previewUrl = URL.createObjectURL(file);
    }

    return file.__previewUrl;
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <div className="mx-auto max-w-[1200px]">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="mb-8">
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          disabled={loading}
          className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#6F766F] transition hover:text-[#233636] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowBackOutlinedIcon fontSize="small" />
          Back to Products
        </button>

        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8A8378]">
          Seller Console / Catalogue / New Product
        </p>

        <h1 className="font-serif text-4xl text-[#233636]">Add Product</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6F766F]">
          Add a new product and its images to your marketplace catalogue.
        </p>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

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

      {/* =====================================================
          UPLOAD STATUS
      ===================================================== */}

      {uploadStatus && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 0,
            border: "1px solid #DED7C9",
            backgroundColor: "#F7F1E5",
            color: "#2D3A3A",
            "& .MuiAlert-icon": {
              color: "#2D3A3A",
            },
          }}
        >
          {uploadStatus}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* =================================================
              PRODUCT INFORMATION
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
              {/* PRODUCT NAME */}

              <TextField
                fullWidth
                required
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Wireless Headphones"
                variant="outlined"
                disabled={loading}
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

              {/* DESCRIPTION */}

              <TextField
                fullWidth
                required
                multiline
                minRows={5}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the product..."
                variant="outlined"
                disabled={loading}
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
                  PRODUCT IMAGES
              ================================================= */}

              <div className="border-t border-[#DED7C9] pt-6">
                <div className="mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Catalogue
                  </p>

                  <h3 className="mt-2 font-serif text-xl text-[#233636]">
                    Product Images
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#8A8378]">
                    Add one or more images for this product. Each image must be
                    10 MB or smaller.
                  </p>
                </div>

                {/* HIDDEN FILE INPUT */}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelection}
                  className="hidden"
                  disabled={loading}
                />

                {/* IMAGE PREVIEWS */}

                {selectedImages.length > 0 && (
                  <div className="mb-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {selectedImages.map((file, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="group relative overflow-hidden border border-[#DED7C9] bg-[#FFFCF4]"
                      >
                        <img
                          src={getPreviewUrl(file)}
                          alt={`Product preview ${index + 1}`}
                          className="h-40 w-full object-cover"
                        />

                        {/* REMOVE BUTTON */}

                        <button
                          type="button"
                          onClick={() => removeSelectedImage(index)}
                          disabled={loading}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-[#DED7C9] bg-[#FFFCF4] text-[#7A4A42] opacity-0 transition group-hover:opacity-100 hover:bg-[#F7EDEA] disabled:cursor-not-allowed"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </button>

                        {/* FILE NAME */}

                        <div className="border-t border-[#DED7C9] px-3 py-2">
                          <p className="truncate text-xs text-[#6F766F]">
                            {file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* UPLOAD AREA */}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="flex w-full flex-col items-center justify-center border border-dashed border-[#B7B0A4] bg-[#FFFCF4] px-6 py-8 text-center transition hover:border-[#2D3A3A] hover:bg-[#F9F4EA] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ImageOutlinedIcon
                    sx={{
                      fontSize: 32,
                      color: "#8A8378",
                      mb: 1,
                    }}
                  />

                  <span className="font-serif text-lg text-[#233636]">
                    {selectedImages.length > 0
                      ? "Add More Images"
                      : "Select Product Images"}
                  </span>

                  <span className="mt-2 text-xs text-[#8A8378]">
                    JPG, PNG, WEBP and other image formats
                  </span>
                </button>
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
              {/* SELLING PRICE */}

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
                InputProps={{
                  startAdornment: (
                    <span className="mr-2 text-sm text-[#8A8378]">₹</span>
                  ),
                }}
                variant="outlined"
                disabled={loading}
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
                InputProps={{
                  startAdornment: (
                    <span className="mr-2 text-sm text-[#8A8378]">₹</span>
                  ),
                }}
                variant="outlined"
                disabled={loading}
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

              {/* STOCK */}

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
                disabled={loading}
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

              {/* CATEGORY */}

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
                disabled={loading}
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

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div className="mt-6 flex justify-end gap-3 border-t border-[#DED7C9] pt-6">
          <Button
            type="button"
            onClick={() => navigate("/admin/products")}
            variant="outlined"
            disabled={loading}
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
            disabled={loading}
            startIcon={
              loading ? (
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
            {loading ? uploadStatus || "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProductForm;
