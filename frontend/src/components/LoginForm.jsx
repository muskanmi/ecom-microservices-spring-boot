import { useState } from "react";
import { TextField, Button, Alert } from "@mui/material";

const LoginForm = ({ onSubmit, errorMessage }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    console.log(e);

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

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

      <Button type="submit" variant="contained" fullWidth>
        Log In
      </Button>
    </form>
  );
};

export default LoginForm;
