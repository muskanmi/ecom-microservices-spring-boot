import { useState } from "react";
import { Alert, Button, Switch, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { changePassword } from "../services/authApi";

function Settings() {
  const navigate = useNavigate();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordEditing, setPasswordEditing] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  /* =====================================================
     NOTIFICATION PREFERENCES
  ===================================================== */

  const getNotificationPreferences = () => {
    const savedPreferences = localStorage.getItem(
      "sellerNotificationPreferences",
    );

    if (savedPreferences) {
      try {
        return JSON.parse(savedPreferences);
      } catch {
        // Ignore invalid local storage data
      }
    }

    return {
      orderUpdates: true,
      inventoryAlerts: true,
      accountNotifications: true,
    };
  };

  const [notificationPreferences, setNotificationPreferences] = useState(
    getNotificationPreferences,
  );

  /* =====================================================
     PASSWORD
  ===================================================== */

  const handlePasswordChange = (event) => {
    setPasswordData({
      ...passwordData,
      [event.target.name]: event.target.value,
    });
  };

  const handlePasswordSave = async () => {
    setSuccessMessage("");
    setErrorMessage("");

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setErrorMessage("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New passwords do not match.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setErrorMessage("Your session has expired. Please log in again.");
        return;
      }

      await changePassword(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccessMessage("Password changed successfully.");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordEditing(false);
    } catch (error) {
      console.error("Failed to change password:", error);

      setErrorMessage(
        error.response?.data?.message || "Unable to change your password.",
      );
    }
  };

  const handlePasswordCancel = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setErrorMessage("");
    setPasswordEditing(false);
  };

  /* =====================================================
     NOTIFICATION PREFERENCES
  ===================================================== */

  const handleNotificationChange = (name) => {
    const updatedPreferences = {
      ...notificationPreferences,
      [name]: !notificationPreferences[name],
    };

    setNotificationPreferences(updatedPreferences);

    localStorage.setItem(
      "sellerNotificationPreferences",
      JSON.stringify(updatedPreferences),
    );

    setSuccessMessage("Notification preferences updated.");
    setErrorMessage("");
  };

  return (
    <div>
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#7A817B]">
          Seller Console / Settings
        </p>

        <h1 className="mt-2 font-serif text-4xl font-semibold text-[#263331]">
          Settings
        </h1>

        <p className="mt-3 text-sm text-[#6F766F]">
          Manage your account preferences and security settings.
        </p>
      </div>

      {/* =====================================================
          SUCCESS MESSAGE
      ===================================================== */}

      {successMessage && (
        <div className="mt-6">
          <Alert severity="success">{successMessage}</Alert>
        </div>
      )}

      {/* =====================================================
          ERROR MESSAGE
      ===================================================== */}

      {errorMessage && (
        <div className="mt-6">
          <Alert severity="error">{errorMessage}</Alert>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {/* ===================================================
            ACCOUNT
        =================================================== */}

        <section className="border border-[#E4DDCF] bg-[#F7F1E5]">
          <div className="border-b border-[#E4DDCF] px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A817B]">
              Account
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#263331]">
              Account settings
            </h2>
          </div>

          <div className="divide-y divide-[#E4DDCF]">
            {/* Profile */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">
              <div>
                <h3 className="text-sm font-semibold text-[#263331]">
                  Profile
                </h3>

                <p className="mt-1 text-sm text-[#7A817B]">
                  Update your name, email address, and profile picture.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/account")}
                className="shrink-0 border border-[#164E4A] px-4 py-2 text-sm font-medium text-[#164E4A] transition hover:bg-[#164E4A] hover:text-white"
              >
                Manage
              </button>
            </div>

            {/* Seller Account */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">
              <div>
                <h3 className="text-sm font-semibold text-[#263331]">
                  Seller account
                </h3>

                <p className="mt-1 text-sm text-[#7A817B]">
                  Manage your store name and seller profile.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/admin/account")}
                className="shrink-0 border border-[#164E4A] px-4 py-2 text-sm font-medium text-[#164E4A] transition hover:bg-[#164E4A] hover:text-white"
              >
                Manage
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            SECURITY
        =================================================== */}

        <section className="border border-[#E4DDCF] bg-[#F7F1E5]">
          <div className="border-b border-[#E4DDCF] px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A817B]">
              Security
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#263331]">
              Password
            </h2>
          </div>

          <div className="p-6">
            {!passwordEditing ? (
              <div className="flex items-center justify-between gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-[#263331]">
                    Password
                  </h3>

                  <p className="mt-1 text-sm text-[#7A817B]">
                    Change your seller account password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    setSuccessMessage("");
                    setPasswordEditing(true);
                  }}
                  className="shrink-0 border border-[#164E4A] px-4 py-2 text-sm font-medium text-[#164E4A] transition hover:bg-[#164E4A] hover:text-white"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <div className="max-w-[620px]">
                <div className="space-y-4">
                  <TextField
                    label="Current password"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    required
                  />

                  <TextField
                    label="New password"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    required
                  />

                  <TextField
                    label="Confirm new password"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    fullWidth
                    required
                  />
                </div>

                <div className="mt-5 flex gap-3">
                  <Button
                    variant="contained"
                    onClick={handlePasswordSave}
                    sx={{
                      backgroundColor: "#164E4A",
                      textTransform: "none",
                      "&:hover": {
                        backgroundColor: "#123F3B",
                      },
                    }}
                  >
                    Change Password
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={handlePasswordCancel}
                    sx={{
                      borderColor: "#E4DDCF",
                      color: "#263331",
                      textTransform: "none",
                      "&:hover": {
                        borderColor: "#164E4A",
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ===================================================
            PREFERENCES
        =================================================== */}

        <section className="border border-[#E4DDCF] bg-[#F7F1E5]">
          <div className="border-b border-[#E4DDCF] px-6 py-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#7A817B]">
              Preferences
            </p>

            <h2 className="mt-1 font-serif text-2xl text-[#263331]">
              Notifications
            </h2>
          </div>

          <div className="divide-y divide-[#E4DDCF]">
            {/* Order Updates */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">
              <div>
                <h3 className="text-sm font-semibold text-[#263331]">
                  Order updates
                </h3>

                <p className="mt-1 text-sm text-[#7A817B]">
                  Receive notifications when an order is placed or updated.
                </p>
              </div>

              <Switch
                checked={notificationPreferences.orderUpdates}
                onChange={() => handleNotificationChange("orderUpdates")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#164E4A",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#164E4A",
                  },
                }}
              />
            </div>

            {/* Inventory Alerts */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">
              <div>
                <h3 className="text-sm font-semibold text-[#263331]">
                  Inventory alerts
                </h3>

                <p className="mt-1 text-sm text-[#7A817B]">
                  Get notified when products have low or limited stock.
                </p>
              </div>

              <Switch
                checked={notificationPreferences.inventoryAlerts}
                onChange={() => handleNotificationChange("inventoryAlerts")}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#164E4A",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#164E4A",
                  },
                }}
              />
            </div>

            {/* Account Notifications */}

            <div className="flex items-center justify-between gap-6 px-6 py-5">
              <div>
                <h3 className="text-sm font-semibold text-[#263331]">
                  Account notifications
                </h3>

                <p className="mt-1 text-sm text-[#7A817B]">
                  Receive important notifications about your seller account.
                </p>
              </div>

              <Switch
                checked={notificationPreferences.accountNotifications}
                onChange={() =>
                  handleNotificationChange("accountNotifications")
                }
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: "#164E4A",
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: "#164E4A",
                  },
                }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
