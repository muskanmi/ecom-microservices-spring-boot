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
  updateProfile,
  updateSellerProfile,
  changePassword,
} from "../services/authApi";

function Account() {
  const [user, setUser] = useState(null);
  const [sellerProfile, setSellerProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* ========================================
     EDIT PROFILE
  ======================================== */

  const [editingProfile, setEditingProfile] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [profileSaving, setProfileSaving] = useState(false);

  /* ========================================
     EDIT STORE
  ======================================== */

  const [editingStore, setEditingStore] = useState(false);

  const [storeForm, setStoreForm] = useState({
    shopName: "",
  });

  const [storeSaving, setStoreSaving] = useState(false);

  /* ========================================
     CHANGE PASSWORD
  ======================================== */

  const [editingPassword, setEditingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordSaving, setPasswordSaving] = useState(false);

  /* ========================================
     LOAD ACCOUNT
  ======================================== */

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

        const [userResponse, sellerResponse] = await Promise.all([
          currentUser(token),
          getSellerProfile(token),
        ]);

        setUser(userResponse.data);
        setSellerProfile(sellerResponse.data);

        setProfileForm({
          name: userResponse.data.name || "",
          email: userResponse.data.email || "",
        });

        setStoreForm({
          shopName: sellerResponse.data.shopName || "",
        });
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

  /* ========================================
     PROFILE HANDLERS
  ======================================== */

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditProfile = () => {
    setSuccessMessage("");
    setErrorMessage("");

    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
    });

    setEditingProfile(true);
  };

  const handleCancelProfile = () => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
    });

    setEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    if (!profileForm.name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }

    try {
      setProfileSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      const response = await updateProfile(token, {
        name: profileForm.name.trim(),
        email: profileForm.email,
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

      setErrorMessage(
        error.response?.data?.message || "Unable to update your profile.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  /* ========================================
     STORE HANDLERS
  ======================================== */

  const handleStoreChange = (event) => {
    setStoreForm({
      shopName: event.target.value,
    });
  };

  const handleEditStore = () => {
    setSuccessMessage("");
    setErrorMessage("");

    setStoreForm({
      shopName: sellerProfile?.shopName || "",
    });

    setEditingStore(true);
  };

  const handleCancelStore = () => {
    setStoreForm({
      shopName: sellerProfile?.shopName || "",
    });

    setEditingStore(false);
  };

  const handleSaveStore = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    if (!storeForm.shopName.trim()) {
      setErrorMessage("Store name is required.");
      return;
    }

    try {
      setStoreSaving(true);
      setErrorMessage("");
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
      console.error("Failed to update store:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Unable to update your store information.",
      );
    } finally {
      setStoreSaving(false);
    }
  };

  /* ========================================
     PASSWORD HANDLERS
  ======================================== */

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEditPassword = () => {
    setSuccessMessage("");
    setErrorMessage("");

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setEditingPassword(true);
  };

  const handleCancelPassword = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setEditingPassword(false);
  };

  const handleSavePassword = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters.");
      return;
    }

    try {
      setPasswordSaving(true);
      setErrorMessage("");
      setSuccessMessage("");

      await changePassword(token, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setEditingPassword(false);
      setSuccessMessage("Password changed successfully.");
    } catch (error) {
      console.error("Failed to change password:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to change your password.",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  /* ========================================
     LOADING
  ======================================== */

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

  /* ========================================
     PAGE
  ======================================== */

  return (
    <div>
      {/* Page heading */}
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

      {/* Success message */}
      {successMessage && (
        <div className="mt-6">
          <Alert severity="success">{successMessage}</Alert>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mt-6">
          <Alert severity="error">{errorMessage}</Alert>
        </div>
      )}

      {/* ========================================
          PROFILE
      ======================================== */}

      {user && (
        <section className="mt-8 border border-[#E4DDCF] bg-[#F7F1E5]">
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
              <button
                type="button"
                onClick={handleEditProfile}
                className="border border-[#164E4A] px-5 py-2.5 text-sm font-medium text-[#164E4A] transition hover:bg-[#164E4A] hover:text-white"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="p-6">
            {/* Profile header */}
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

            {/* View mode */}
            {!editingProfile && (
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
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "—"}
                  </div>
                </div>
              </>
            )}

            {/* Edit mode */}
            {editingProfile && (
              <div className="mt-7">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <TextField
                    label="Name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Email"
                    name="email"
                    value={profileForm.email}
                    disabled
                    fullWidth
                    helperText="Email changes are currently disabled."
                  />
                </div>

                <div className="mt-7 flex gap-3">
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    sx={{
                      backgroundColor: "#164E4A",
                      textTransform: "none",
                      padding: "10px 22px",
                      "&:hover": {
                        backgroundColor: "#123F3B",
                      },
                    }}
                  >
                    {profileSaving ? "Saving..." : "Save Changes"}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleCancelProfile}
                    disabled={profileSaving}
                    sx={{
                      borderColor: "#E4DDCF",
                      color: "#263331",
                      textTransform: "none",
                      padding: "10px 22px",
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================
          STORE INFORMATION
      ======================================== */}

      {sellerProfile && (
        <section className="mt-6 border border-[#E4DDCF] bg-[#F7F1E5]">
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
              <button
                type="button"
                onClick={handleEditStore}
                className="border border-[#164E4A] px-5 py-2.5 text-sm font-medium text-[#164E4A] transition hover:bg-[#164E4A] hover:text-white"
              >
                Edit Store
              </button>
            )}
          </div>

          <div className="p-6">
            {/* View mode */}
            {!editingStore && (
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

            {/* Edit mode */}
            {editingStore && (
              <div>
                <div className="max-w-[580px]">
                  <TextField
                    label="Store name"
                    name="shopName"
                    value={storeForm.shopName}
                    onChange={handleStoreChange}
                    required
                    fullWidth
                  />
                </div>

                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#7A817B]">
                    Seller status
                  </p>

                  <span
                    className={`mt-2 inline-flex border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                      sellerProfile.approvalStatus === "APPROVED"
                        ? "border-[#B8D4C2] bg-[#EDF6EF] text-[#3F7352]"
                        : "border-[#E9D4A5] bg-[#FFF7DF] text-[#8A6A20]"
                    }`}
                  >
                    {sellerProfile.approvalStatus}
                  </span>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button
                    variant="contained"
                    onClick={handleSaveStore}
                    disabled={storeSaving}
                    sx={{
                      backgroundColor: "#164E4A",
                      textTransform: "none",
                      padding: "10px 22px",
                      "&:hover": {
                        backgroundColor: "#123F3B",
                      },
                    }}
                  >
                    {storeSaving ? "Saving..." : "Save Changes"}
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handleCancelStore}
                    disabled={storeSaving}
                    sx={{
                      borderColor: "#E4DDCF",
                      color: "#263331",
                      textTransform: "none",
                      padding: "10px 22px",
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================
          SECURITY
      ======================================== */}

      <section className="mt-6 border border-[#E4DDCF] bg-[#F7F1E5]">
        <div className="flex items-center justify-between border-b border-[#E4DDCF] px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A817B]">
              Security
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#263331]">
              Password
            </h2>
          </div>

          {!editingPassword && (
            <button
              type="button"
              onClick={handleEditPassword}
              className="border border-[#164E4A] px-5 py-2.5 text-sm font-medium text-[#164E4A] transition hover:bg-[#164E4A] hover:text-white"
            >
              Change Password
            </button>
          )}
        </div>

        <div className="p-6">
          {!editingPassword && (
            <div>
              <p className="text-sm text-[#6F766F]">
                Keep your seller account secure by using a strong password.
              </p>

              <p className="mt-2 text-sm text-[#7A817B]">
                Your password is never displayed here.
              </p>
            </div>
          )}

          {editingPassword && (
            <div className="max-w-[580px]">
              <div className="space-y-5">
                <TextField
                  label="Current password"
                  name="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                />

                <TextField
                  label="New password"
                  name="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                />

                <TextField
                  label="Confirm new password"
                  name="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  fullWidth
                />
              </div>

              <div className="mt-6 flex gap-3">
                <Button
                  variant="contained"
                  onClick={handleSavePassword}
                  disabled={passwordSaving}
                  sx={{
                    backgroundColor: "#164E4A",
                    textTransform: "none",
                    padding: "10px 22px",
                    "&:hover": {
                      backgroundColor: "#123F3B",
                    },
                  }}
                >
                  {passwordSaving ? "Updating..." : "Change Password"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={handleCancelPassword}
                  disabled={passwordSaving}
                  sx={{
                    borderColor: "#E4DDCF",
                    color: "#263331",
                    textTransform: "none",
                    padding: "10px 22px",
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Account;
