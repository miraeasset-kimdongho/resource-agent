import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Paper, Typography, TextField, Button, Alert } from "@mui/material";
import { login } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login(form);
      localStorage.setItem("token", data.access_token);
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      navigate(payload.role === "teacher" ? "/teacher" : "/");
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않아요 😢");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}>
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, width: 360, borderRadius: 4 }}>
        <Typography variant="h5" align="center" mb={0.5}>🏫 공간 예약</Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          학교 공간 예약 시스템
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <TextField
          fullWidth label="이메일" type="email" margin="normal"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
        />
        <TextField
          fullWidth label="비밀번호" type="password" margin="normal"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
        />
        <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 2, py: 1.5 }}>
          {loading ? "로그인 중..." : "로그인"}
        </Button>
        <Typography variant="body2" align="center" mt={2} color="text.secondary">
          계정이 없으신가요?{" "}
          <Link to="/register" style={{ color: "#3182F6", fontWeight: 600 }}>회원가입</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
