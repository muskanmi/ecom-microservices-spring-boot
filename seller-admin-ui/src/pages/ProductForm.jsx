import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { Alert, Button, CircularProgress, TextField } from "@mui/material";

import { createProduct, uploadProductImages } from "../services/productApi";
import { getSellerProfile } from "../services/authApi";

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

  const [approvalStatus, setApprovalStatus] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(true);
  const [approvalError, setApprovalError] = useState("");

  const isApproved =
    !approvalLoading && !approvalError && approvalStatus === "APPROVED";

  // Verify the seller's current approval status.
  useEffect(() => {
    let cancelled = false;

    async function verifyApproval() {
      const token = localStorage.getItem("token");

      if (!token) {
        if (!cancelled) {
          setApprovalError("Your session has expired. Please log in again.");
          setApprovalLoading(false);
        }
        return;
      }

      try {
        const response = await getSellerProfile(token);
        const status = response?.data?.approvalStatus;

        if (!status) {
          throw new Error("Seller approval status is unavailable.");
        }

        if (!cancelled) {
          setApprovalStatus(String(status).trim().toUpperCase());
          setApprovalError("");
        }
      } catch (err) {
        console.error("Failed to verify seller approval:", err);

        if (!cancelled) {
          setApprovalError(
            "Unable to verify your seller approval status. Please refresh and try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setApprovalLoading(false);
        }
      }
    }

    verifyApproval();

    return () => {
      cancelled = true;
    };
  }, []);

  // Form field changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Select and validate product images.
  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setError("");

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        invalidFiles.push(`${file.name} is not an image.`);
        return;
      }

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

    event.target.value = "";
  };

  const removeSelectedImage = (indexToRemove) => {
    setSelectedImages((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  };

  const getPreviewUrl = (file) => {
    if (!file.__previewUrl) {
      file.__previewUrl = URL.createObjectURL(file);
    }

    return file.__previewUrl;
  };

  // Release preview URLs when images change or the component unmounts.
  useEffect(() => {
    return () => {
      selectedImages.forEach((file) => {
        if (file.__previewUrl) {
          URL.revokeObjectURL(file.__previewUrl);
          delete file.__previewUrl;
        }
      });
    };
  }, [selectedImages]);

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Product name is required.";
    }

    if (!formData.description.trim()) {
      return "Product description is required.";
    }

    if (
      formData.price === "" ||
      !Number.isFinite(Number(formData.price)) ||
      Number(formData.price) <= 0
    ) {
      return "Please enter a valid selling price.";
    }

    if (
      formData.mrp === "" ||
      !Number.isFinite(Number(formData.mrp)) ||
      Number(formData.mrp) <= 0
    ) {
      return "Please enter a valid MRP.";
    }

    if (Number(formData.mrp) < Number(formData.price)) {
      return "MRP cannot be lower than the selling price.";
    }

    if (
      formData.stock === "" ||
      !Number.isInteger(Number(formData.stock)) ||
      Number(formData.stock) < 0
    ) {
      return "Please enter a valid stock quantity.";
    }

    if (
      formData.categoryId === "" ||
      !Number.isInteger(Number(formData.categoryId)) ||
      Number(formData.categoryId) <= 0
    ) {
      return "Please enter a valid category ID.";
    }

    return null;
  };

  // Create the product, then upload its images.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setUploadStatus("");

    // Do not allow submission unless approval is verified.
    if (approvalLoading) {
      setError("Please wait while your seller approval is verified.");
      return;
    }

    if (approvalError) {
      setError(approvalError);
      return;
    }

    if (approvalStatus !== "APPROVED") {
      setError(
        approvalStatus === "PENDING"
          ? "Your seller application is awaiting approval. You cannot create products yet."
          : approvalStatus === "REJECTED"
            ? "Your seller application has been rejected. You cannot create products."
            : "Your seller approval must be verified before creating products.",
      );
      return;
    }

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
      setUploadStatus("Creating product...");

      const productResponse = await createProduct(request);
      const createdProduct = productResponse?.data;
      const productId = createdProduct?.id ?? createdProduct?.productId;

      if (!productId) {
        throw new Error(
          "Product was created, but the server did not return a product ID.",
        );
      }

      if (selectedImages.length > 0) {
        setUploadStatus(
          `Uploading ${selectedImages.length} image${
            selectedImages.length > 1 ? "s" : ""
          }...`,
        );

        await uploadProductImages(productId, selectedImages);
      }

      navigate(`/admin/products/${productId}`);
    } catch (err) {
      console.error("Product creation failed:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to create the product. Please try again.",
      );
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  const inputSx = {
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
  };

  return (
    <div className="mx-auto max-w-[1200px]">
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

      {/* Seller approval status */}
      {approvalLoading ? (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 0 }}>
          Verifying seller approval...
        </Alert>
      ) : approvalError ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          {approvalError}
        </Alert>
      ) : approvalStatus === "PENDING" ? (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 0 }}>
          Your seller application is awaiting approval. Product creation will be
          available once your account is approved.
        </Alert>
      ) : approvalStatus === "REJECTED" ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          Your seller application has been rejected. You cannot create products
          with this account. Please contact marketplace support if you need
          assistance.
        </Alert>
      ) : approvalStatus !== "APPROVED" ? (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>
          Your seller approval status could not be verified. Product creation is
          unavailable until your status is confirmed.
        </Alert>
      ) : null}

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

      {/* Only approved sellers can see and use the form. */}
      {isApproved && (
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                <TextField
                  fullWidth
                  required
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Wireless Headphones"
                  disabled={loading}
                  sx={inputSx}
                />

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
                  disabled={loading}
                  sx={inputSx}
                />

                <div className="border-t border-[#DED7C9] pt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                    Catalogue
                  </p>

                  <h3 className="mt-2 font-serif text-xl text-[#233636]">
                    Product Images
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-[#8A8378]">
                    Add one or more images. Each image must be 10 MB or smaller.
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelection}
                    className="hidden"
                    disabled={loading}
                  />

                  {selectedImages.length > 0 && (
                    <div className="mb-5 mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
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

                          <button
                            type="button"
                            onClick={() => removeSelectedImage(index)}
                            disabled={loading}
                            aria-label={`Remove image ${index + 1}`}
                            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-[#DED7C9] bg-[#FFFCF4] text-[#7A4A42] opacity-100 transition hover:bg-[#F7EDEA] disabled:cursor-not-allowed"
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </button>

                          <div className="border-t border-[#DED7C9] px-3 py-2">
                            <p className="truncate text-xs text-[#6F766F]">
                              {file.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="mt-5 flex w-full flex-col items-center justify-center border border-dashed border-[#B7B0A4] bg-[#FFFCF4] px-6 py-8 text-center transition hover:border-[#2D3A3A] hover:bg-[#F9F4EA] disabled:cursor-not-allowed disabled:opacity-50"
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

            <section className="border border-[#DED7C9] bg-[#F7F1E5]">
              <div className="border-b border-[#DED7C9] px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A8378]">
                  Catalogue
                </p>
                <h2 className="mt-2 font-serif text-xl text-[#233636]">
                  Pricing &amp; Inventory
                </h2>
              </div>

              <div className="space-y-5 px-6 py-7">
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Selling Price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: "0.01" }}
                  InputProps={{
                    startAdornment: (
                      <span className="mr-2 text-sm text-[#8A8378]">₹</span>
                    ),
                  }}
                  disabled={loading}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  required
                  type="number"
                  label="MRP"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: "0.01" }}
                  InputProps={{
                    startAdornment: (
                      <span className="mr-2 text-sm text-[#8A8378]">₹</span>
                    ),
                  }}
                  disabled={loading}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Stock Quantity"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  inputProps={{ min: 0, step: 1 }}
                  disabled={loading}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Category ID"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  inputProps={{ min: 1, step: 1 }}
                  helperText="Use the category ID from your catalogue."
                  disabled={loading}
                  sx={{
                    ...inputSx,
                    "& .MuiFormHelperText-root": {
                      marginLeft: 0,
                      color: "#8A8378",
                    },
                  }}
                />
              </div>
            </section>
          </div>

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
              disabled={loading || !isApproved}
              startIcon={
                loading ? (
                  <CircularProgress size={17} sx={{ color: "#FFFCF4" }} />
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
      )}
    </div>
  );
}

export default ProductForm;
