import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  CameraAltOutlined,
  EditOutlined,
  EmailOutlined,
  PersonOutlined,
  CalendarMonthOutlined,
  BadgeOutlined,
  LockOutlined,
  LogoutOutlined,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import {
  currentUser,
  updateProfile,
  uploadAvatar,
  changePassword,
} from "../api/authApi";

const ink = "#243F3F";
const muted = "#737373";
const border = "#E6E0D5";
const gold = "#F4B432";

const API_URL = "http://localhost:8081";

export default function ProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await currentUser(token);
      console.log(response, "response");

      setUser(response.data);
      setName(response.data.name || "");
      setEmail(response.data.email || "");
    } catch (error) {
      console.error("Profile fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      const token = localStorage.getItem("token");

      const response = await uploadAvatar(file, token);
      console.log(response, "response");

      setUser(response.data);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await changePassword(
        {
          currentPassword,
          newPassword,
        },
        token,
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setChangingPassword(false);

      alert("Password updated successfully");
    } catch (error) {
      console.error("Password update failed:", error);
      alert("Failed to update password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    navigate("/login");
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await updateProfile(
        {
          name,
          email,
        },
        token,
      );

      setUser(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
      setEditing(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <Box className="flex min-h-screen items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="flex min-h-screen items-center justify-center">
        <Typography>Unable to load profile.</Typography>
      </Box>
    );
  }

  const avatarSrc = user.avatarUrl ? `${API_URL}${user.avatarUrl}` : undefined;
  console.log(avatarSrc, user);

  return (
    <Box
      className="min-h-screen px-4 py-6 sm:px-6 lg:px-10"
      sx={{ bgcolor: "#F7F4EE" }}
    >
      <Box className="mx-auto max-w-5xl">
        {/* Header */}

        <Box className="mb-8 flex items-center justify-between">
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/dashboard")}
            className="!normal-case"
            sx={{
              color: ink,
              fontWeight: 600,
            }}
          >
            Back to Dashboard
          </Button>

          <Typography
            sx={{
              fontSize: { xs: 24, sm: 30 },
              fontWeight: 700,
              color: ink,
            }}
          >
            My Profile
          </Typography>

          <Box className="w-32" />
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${border}`,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(35,31,24,.06)",
          }}
        >
          {/* Profile Header */}

          <Box
            className="flex flex-col items-center gap-5 px-6 py-10 sm:flex-row sm:px-10"
            sx={{
              bgcolor: "#F3EFE7",
            }}
          >
            {/* Avatar */}

            <Box className="relative">
              <Avatar
                src={avatarSrc}
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: ink,
                  color: "#fff",
                  fontSize: 42,
                  fontWeight: 700,
                  border: "4px solid white",
                }}
              >
                {(user.name || "U").slice(0, 1).toUpperCase()}
              </Avatar>

              <Button
                component="label"
                disabled={uploading}
                sx={{
                  position: "absolute",
                  right: -4,
                  bottom: -4,
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: gold,
                  color: ink,
                  "&:hover": {
                    bgcolor: gold,
                    opacity: 0.9,
                  },
                }}
              >
                {uploading ? (
                  <CircularProgress size={18} />
                ) : (
                  <CameraAltOutlined fontSize="small" />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarUpload}
                />
              </Button>
            </Box>

            {/* User Details */}

            <Box className="text-center sm:text-left">
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: ink,
                }}
              >
                {user.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 15,
                  color: muted,
                  mt: 0.5,
                }}
              >
                {user.email}
              </Typography>

              <Box
                className="mt-3 inline-flex rounded-full px-3 py-1"
                sx={{
                  bgcolor: "#DCE8E4",
                  color: ink,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {user.role}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          {/* Profile Information */}

          <Box className="p-6 sm:p-10">
            <Box className="mb-8 flex items-center justify-between">
              <Box>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: ink,
                  }}
                >
                  Personal Information
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: muted,
                    mt: 0.5,
                  }}
                >
                  Manage your personal account details
                </Typography>
              </Box>

              {!editing ? (
                <Button
                  startIcon={<EditOutlined />}
                  onClick={() => setEditing(true)}
                  variant="outlined"
                  className="!normal-case"
                  sx={{
                    borderColor: border,
                    color: ink,
                    fontWeight: 600,
                    paddingLeft: 2,
                    paddingRight: 2,
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setName(user.name);
                    setEmail(user.email);
                    setEditing(false);
                  }}
                  className="!normal-case"
                  sx={{
                    color: muted,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </Button>
              )}
            </Box>

            <Box className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}

              <Box>
                <Box className="mb-2 flex items-center gap-2">
                  <PersonOutlined sx={{ fontSize: 18, color: muted }} />

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: muted,
                    }}
                  >
                    FULL NAME
                  </Typography>
                </Box>

                {editing ? (
                  <TextField
                    fullWidth
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    size="small"
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: ink,
                    }}
                  >
                    {user.name}
                  </Typography>
                )}
              </Box>

              {/* Email */}

              <Box>
                <Box className="mb-2 flex items-center gap-2">
                  <EmailOutlined sx={{ fontSize: 18, color: muted }} />

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: muted,
                    }}
                  >
                    EMAIL ADDRESS
                  </Typography>
                </Box>

                {editing ? (
                  <TextField
                    fullWidth
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    size="small"
                    type="email"
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: ink,
                    }}
                  >
                    {user.email}
                  </Typography>
                )}
              </Box>

              {/* Role */}

              <Box>
                <Box className="mb-2 flex items-center gap-2">
                  <BadgeOutlined sx={{ fontSize: 18, color: muted }} />

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: muted,
                    }}
                  >
                    ACCOUNT TYPE
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: ink,
                    textTransform: "capitalize",
                  }}
                >
                  {user.role}
                </Typography>
              </Box>

              {/* Created At */}

              <Box>
                <Box className="mb-2 flex items-center gap-2">
                  <CalendarMonthOutlined sx={{ fontSize: 18, color: muted }} />

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: muted,
                    }}
                  >
                    MEMBER SINCE
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: ink,
                  }}
                >
                  {user.memberSince
                    ? new Date(user.memberSince).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </Typography>
              </Box>
            </Box>

            {/* Save Button */}

            {editing && (
              <Box className="mt-10 flex justify-end">
                <Button
                  variant="contained"
                  onClick={handleSave}
                  className="!normal-case"
                  sx={{
                    bgcolor: gold,
                    color: ink,
                    px: 4,
                    py: 1.3,
                    fontWeight: 700,
                    "&:hover": {
                      bgcolor: gold,
                      opacity: 0.9,
                    },
                  }}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>

          <Divider />

          <Box className="p-6 sm:p-10">
            <Box className="mb-8 flex items-center justify-between">
              <Box>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: ink,
                  }}
                >
                  Password & Security
                </Typography>

                <Typography
                  sx={{
                    fontSize: 13,
                    color: muted,
                    mt: 0.5,
                  }}
                >
                  Keep your account secure by updating your password
                </Typography>
              </Box>

              {!changingPassword && (
                <Button
                  startIcon={<LockOutlined />}
                  variant="outlined"
                  onClick={() => setChangingPassword(true)}
                  className="!normal-case"
                  sx={{
                    borderColor: border,
                    color: ink,
                    fontWeight: 600,
                    paddingLeft: 2,
                    paddingRight: 2,
                  }}
                >
                  Change Password
                </Button>
              )}
            </Box>

            {changingPassword && (
              <Box className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                />

                <Box />

                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />

                <Box className="col-span-1 mt-4 flex gap-3 md:col-span-2">
                  <Button
                    variant="contained"
                    onClick={handleChangePassword}
                    className="!normal-case"
                    sx={{
                      bgcolor: gold,
                      color: ink,
                      fontWeight: 700,
                      px: 3,
                      "&:hover": {
                        bgcolor: gold,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Update Password
                  </Button>

                  <Button
                    onClick={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setChangingPassword(false);
                    }}
                    className="!normal-case"
                    sx={{
                      color: muted,
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            )}
          </Box>

          <Box
            className="border-t p-6 sm:p-10"
            sx={{
              borderColor: border,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 700,
                color: "#d32f2f",
                mb: 1,
              }}
            >
              Logout
            </Typography>

            <Typography
              sx={{
                fontSize: 13,
                color: muted,
                mb: 3,
              }}
            >
              Sign out from your account on this device.
            </Typography>

            <Button
              variant="outlined"
              startIcon={<LogoutOutlined />}
              onClick={handleLogout}
              className="!normal-case"
              sx={{
                borderColor: "#d32f2f",
                color: "#d32f2f",
                fontWeight: 600,
                px: 3,
                "&:hover": {
                  borderColor: "#b71c1c",
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
