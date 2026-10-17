import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";

import {
  currentUser,
  getSellerProfile,
  createSellerProfile,
  updateProfile,
  updateSellerProfile,
} from "../services/authApi";

function Account() {
  const [user, setUser] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingStore, setUpdatingStore] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [shopName, setShopName] = useState("");

  // ========================================
  // PROFILE EDITING
  // ========================================

  const [editingProfile, setEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  // ========================================
  // STORE EDITING
  // ========================================

  const [editingStore, setEditingStore] = useState(false);

  const [storeForm, setStoreForm] = useState({
    shopName: "",
  });

  useEffect(() => {
    const loadAccount = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessage("Your session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setErrorMessage("");

        // ========================================
        // LOAD USER
        // ========================================

        const userResponse = await currentUser(token);

        setUser(userResponse.data);

        setProfileForm({
          name: userResponse.data.name || "",
          email: userResponse.data.email || "",
        });

        // ========================================
        // LOAD SELLER PROFILE
        // ========================================

        try {
          const sellerResponse = await getSellerProfile(token);

          setSellerProfile(sellerResponse.data);

          setStoreForm({
            shopName: sellerResponse.data.shopName || "",
          });

          setProfileError("");
        } catch (sellerError) {
          const message = sellerError.response?.data?.message;

          if (message === "Seller Profile does not exist") {
            setSellerProfile(null);
            setProfileError("");
          } else {
            console.error("Failed to load seller profile:", sellerError);

            setProfileError(message || "Unable to load your seller profile.");
          }
        }
      } catch (error) {
        console.error("Failed to load seller account:", error);

        setErrorMessage(
          error.response?.data?.message ||
            "Unable to load your seller account.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAccount();
  }, []);

  // ========================================
  // PROFILE EDITING
  // ========================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditProfile = () => {
    setSuccessMessage("");
    setProfileError("");

    setProfileForm({
      name: user.name || "",
      email: user.email || "",
    });

    setEditingProfile(true);
  };

  const handleCancelProfileEdit = () => {
    setProfileForm({
      name: user.name || "",
      email: user.email || "",
    });

    setEditingProfile(false);
    setProfileError("");
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    if (!profileForm.name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    try {
      setUpdatingProfile(true);
      setProfileError("");
      setSuccessMessage("");

      const response = await updateProfile(token, {
        name: profileForm.name.trim(),
        email: user.email,
      });

      setUser(response.data);

      setProfileForm({
        name: response.data.name || "",
        email: response.data.email || "",
      });

      setEditingProfile(false);

      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Failed to update profile:", error);

      setProfileError(
        error.response?.data?.message || "Unable to update your profile.",
      );
    } finally {
      setUpdatingProfile(false);
    }
  };

  // ========================================
  // STORE EDITING
  // ========================================

  const handleEditStore = () => {
    setSuccessMessage("");
    setProfileError("");

    setStoreForm({
      shopName: sellerProfile?.shopName || "",
    });

    setEditingStore(true);
  };

  const handleStoreChange = (event) => {
    setStoreForm({
      shopName: event.target.value,
    });
  };

  const handleCancelStoreEdit = () => {
    setStoreForm({
      shopName: sellerProfile?.shopName || "",
    });

    setEditingStore(false);
    setProfileError("");
  };

  const handleUpdateStore = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    if (!storeForm.shopName.trim()) {
      setProfileError("Store name is required.");
      return;
    }

    try {
      setUpdatingStore(true);
      setProfileError("");
      setSuccessMessage("");

      const response = await updateSellerProfile(token, {
        shopName: storeForm.shopName.trim(),
      });

      setSellerProfile(response.data);

      setStoreForm({
        shopName: response.data.shopName || "",
      });

      setEditingStore(false);

      setSuccessMessage("Store information updated successfully.");
    } catch (error) {
      console.error("Failed to update seller profile:", error);

      setProfileError(
        error.response?.data?.message ||
          "Unable to update your store information.",
      );
    } finally {
      setUpdatingStore(false);
    }
  };

  // ========================================
  // CREATE SELLER PROFILE
  // ========================================

  const handleCreateSellerProfile = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    if (!shopName.trim()) {
      setProfileError("Store name is required.");
      return;
    }

    try {
      setCreatingProfile(true);
      setProfileError("");
      setSuccessMessage("");

      const response = await createSellerProfile(token, {
        shopName: shopName.trim(),
      });

      setSellerProfile(response.data);

      setStoreForm({
        shopName: response.data.shopName || "",
      });

      setShopName("");

      setSuccessMessage("Store profile created successfully.");
    } catch (error) {
      console.error("Failed to create seller profile:", error);

      setProfileError(
        error.response?.data?.message ||
          "Unable to create your seller profile.",
      );
    } finally {
      setCreatingProfile(false);
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <CircularProgress
          size={30}
          sx={{
            color: "#164E4A",
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* ========================================
          PAGE HEADING
      ======================================== */}

      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#7A817B]">
          Seller Console / Account
        </p>

        <h1 className="mt-2 font-serif text-4xl font-semibold text-[#263331]">
          Seller Account
        </h1>

        <p className="mt-3 text-sm text-[#6F766F]">
          Manage your seller profile, store information, and account settings.
        </p>
      </div>

      {/* ========================================
          GENERAL ERROR
      ======================================== */}

      {errorMessage && (
        <div className="mt-6">
          <Alert severity="error">{errorMessage}</Alert>
        </div>
      )}

      {/* ========================================
          SUCCESS MESSAGE
      ======================================== */}

      {successMessage && (
        <div className="mt-6">
          <Alert severity="success">{successMessage}</Alert>
        </div>
      )}

      {/* ========================================
          ACCOUNT CONTENT
      ======================================== */}

      {!errorMessage && user && (
        <div className="mt-8 space-y-6">
          {/* ========================================
              PROFILE
          ======================================== */}

          <section className="border border-[#E4DDCF] bg-[#F7F1E5]">
            <div className="flex items-center justify-between border-b border-[#E4DDCF] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A817B]">
                  Profile
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#263331]">
                  Personal information
                </h2>
              </div>

              {!editingProfile && (
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleEditProfile}
                  sx={{
                    borderColor: "#164E4A",
                    color: "#164E4A",
                    textTransform: "none",
                    padding: "7px 18px",
                    "&:hover": {
                      borderColor: "#123F3C",
                      backgroundColor: "#EDF4F2",
                    },
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center gap-5">
                <Avatar
                  src={
                    user.avatarUrl
                      ? `http://localhost:8081${user.avatarUrl}`
                      : undefined
                  }
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: "#E9B12C",
                    color: "#164E4A",
                    fontFamily: "Georgia, serif",
                    fontSize: "28px",
                    fontWeight: 700,
                  }}
                >
                  {user.name?.charAt(0)?.toUpperCase() || "S"}
                </Avatar>

                <div>
                  <h3 className="font-serif text-xl font-semibold text-[#263331]">
                    {user.name}
                  </h3>

                  <p className="mt-1 text-sm text-[#7A817B]">{user.email}</p>

                  <span className="mt-2 inline-block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#164E4A]">
                    {user.role}
                  </span>
                </div>
              </div>

              {profileError && (
                <div className="mt-6">
                  <Alert severity="error">{profileError}</Alert>
                </div>
              )}

              {!editingProfile ? (
                <>
                  <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817B]">
                        Name
                      </p>

                      <div className="mt-2 border border-[#E4DDCF] bg-[#FFFCF4] px-4 py-3 text-sm text-[#263331]">
                        {user.name}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817B]">
                        Email
                      </p>

                      <div className="mt-2 border border-[#E4DDCF] bg-[#FFFCF4] px-4 py-3 text-sm text-[#263331]">
                        {user.email}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817B]">
                      Member since
                    </p>

                    <div className="mt-2 text-sm text-[#263331]">
                      {user.memberSince
                        ? new Date(user.memberSince).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </div>
                  </div>
                </>
              ) : (
                <form onSubmit={handleUpdateProfile} className="mt-7">
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <TextField
                      label="Name"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#FFFCF4",
                        },
                      }}
                    />

                    <TextField
                      label="Email"
                      name="email"
                      value={profileForm.email}
                      fullWidth
                      disabled
                      helperText="Email changes are currently disabled."
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#FFFCF4",
                        },
                      }}
                    />
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updatingProfile}
                      sx={{
                        backgroundColor: "#164E4A",
                        color: "#FFFFFF",
                        padding: "9px 20px",
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: "#123F3C",
                        },
                      }}
                    >
                      {updatingProfile ? "Saving..." : "Save Changes"}
                    </Button>

                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleCancelProfileEdit}
                      disabled={updatingProfile}
                      sx={{
                        borderColor: "#E4DDCF",
                        color: "#263331",
                        padding: "9px 20px",
                        textTransform: "none",
                        "&:hover": {
                          borderColor: "#164E4A",
                          backgroundColor: "#FFFCF4",
                        },
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* ========================================
              SELLER / STORE INFORMATION
          ======================================== */}

          {sellerProfile ? (
            <section className="border border-[#E4DDCF] bg-[#F7F1E5]">
              <div className="flex items-center justify-between border-b border-[#E4DDCF] px-6 py-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A817B]">
                    Seller Account
                  </p>

                  <h2 className="mt-1 font-serif text-2xl text-[#263331]">
                    Store information
                  </h2>
                </div>

                {!editingStore && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handleEditStore}
                    sx={{
                      borderColor: "#164E4A",
                      color: "#164E4A",
                      textTransform: "none",
                      padding: "7px 18px",
                      "&:hover": {
                        borderColor: "#123F3C",
                        backgroundColor: "#EDF4F2",
                      },
                    }}
                  >
                    Edit Store
                  </Button>
                )}
              </div>

              <div className="p-6">
                {editingStore ? (
                  <form onSubmit={handleUpdateStore}>
                    <div className="max-w-[570px]">
                      <TextField
                        label="Store name"
                        value={storeForm.shopName}
                        onChange={handleStoreChange}
                        required
                        fullWidth
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#FFFCF4",
                          },
                        }}
                      />
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817B]">
                          Seller status
                        </p>

                        <div className="mt-2">
                          <span
                            className={`inline-flex border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                              sellerProfile.approvalStatus === "APPROVED"
                                ? "border-[#B8D4C2] bg-[#EDF6EF] text-[#3F7352]"
                                : "border-[#E9D4A5] bg-[#FFF7DF] text-[#8A6A20]"
                            }`}
                          >
                            {sellerProfile.approvalStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={updatingStore}
                        sx={{
                          backgroundColor: "#164E4A",
                          color: "#FFFFFF",
                          padding: "9px 20px",
                          textTransform: "none",
                          "&:hover": {
                            backgroundColor: "#123F3C",
                          },
                        }}
                      >
                        {updatingStore ? "Saving..." : "Save Changes"}
                      </Button>

                      <Button
                        type="button"
                        variant="outlined"
                        onClick={handleCancelStoreEdit}
                        disabled={updatingStore}
                        sx={{
                          borderColor: "#E4DDCF",
                          color: "#263331",
                          padding: "9px 20px",
                          textTransform: "none",
                          "&:hover": {
                            borderColor: "#164E4A",
                            backgroundColor: "#FFFCF4",
                          },
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817B]">
                        Store name
                      </p>

                      <div className="mt-2 border border-[#E4DDCF] bg-[#FFFCF4] px-4 py-3 text-sm text-[#263331]">
                        {sellerProfile.shopName}
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817B]">
                        Seller status
                      </p>

                      <div className="mt-2">
                        <span
                          className={`inline-flex border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                            sellerProfile.approvalStatus === "APPROVED"
                              ? "border-[#B8D4C2] bg-[#EDF6EF] text-[#3F7352]"
                              : "border-[#E9D4A5] bg-[#FFF7DF] text-[#8A6A20]"
                          }`}
                        >
                          {sellerProfile.approvalStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="border border-[#E4DDCF] bg-[#F7F1E5]">
              <div className="border-b border-[#E4DDCF] px-6 py-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A817B]">
                  Seller Account
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#263331]">
                  Set up your store
                </h2>
              </div>

              <div className="p-6">
                <p className="max-w-[700px] text-sm leading-6 text-[#6F766F]">
                  Your seller account does not have a store profile yet. Create
                  your store profile to start managing your seller information.
                </p>

                {profileError && (
                  <div className="mt-5">
                    <Alert severity="error">{profileError}</Alert>
                  </div>
                )}

                <form
                  onSubmit={handleCreateSellerProfile}
                  className="mt-6 max-w-[520px]"
                >
                  <TextField
                    label="Store name"
                    value={shopName}
                    onChange={(event) => setShopName(event.target.value)}
                    fullWidth
                    required
                    placeholder="Enter your store name"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#FFFCF4",
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={creatingProfile}
                    sx={{
                      mt: 2.5,
                      backgroundColor: "#164E4A",
                      color: "#FFFFFF",
                      padding: "10px 20px",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#123F3C",
                      },
                    }}
                  >
                    {creatingProfile ? "Creating..." : "Create Store Profile"}
                  </Button>
                </form>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default Account;
