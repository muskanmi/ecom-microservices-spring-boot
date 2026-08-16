import { useState } from "react";
import {
  TextField,
  Button,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
} from "@mui/material";

const RegisterForm = ({ onSubmit, errorMessage }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (e, newRole) => {
    if (newRole) setFormData({ ...formData, role: newRole });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <TextField
        label="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
        fullWidth
      />
      <TextField
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        fullWidth
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        fullWidth
      />

      <div>
        <Typography className="!font-mono !text-[11px] !tracking-widest !uppercase !text-muted !mb-1.5">
          I want to
        </Typography>
        <ToggleButtonGroup
          value={formData.role}
          exclusive
          onChange={handleRoleChange}
          fullWidth
        >
          <ToggleButton value="CUSTOMER">Shop</ToggleButton>
          <ToggleButton
            value="SELLER"
            sx={{
              "&.Mui-selected": {
                borderColor: "#C1443C !important",
                backgroundColor: "rgba(193,68,60,0.1) !important",
              },
            }}
          >
            Sell
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      <Button type="submit" variant="contained" fullWidth>
        Register
      </Button>
    </form>
  );
};

export default RegisterForm;
