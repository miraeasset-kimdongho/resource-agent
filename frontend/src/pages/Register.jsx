import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Box, Paper, Typography, TextField, Button, Alert, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { register } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "회원가입에 실패했어요 😢");
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
        <Typography variant="h5" align="center" mb={0.5}>✏️ 회원가입</Typography>
        <Typography variant="body2" align="center" color="text.secondary" mb={3}>
          계정을 만들어 예약을 시작하세요
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <TextField fullWidth label="이름" margin="normal" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <TextField fullWidth label="이메일" type="email" margin="normal" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <TextField fullWidth label="비밀번호" type="password" margin="normal" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />

        <FormControl fullWidth margin="normal">
          <InputLabel>역할</InputLabel>
          <Select value={form.role} label="역할" onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <MenuItem value="student">👨‍🎓 학생</MenuItem>
            <MenuItem value="teacher">👩‍🏫 선생님</MenuItem>
          </Select>
        </FormControl>

        <Button fullWidth variant="contained" type="submit" disabled={loading} sx={{ mt: 2, py: 1.5 }}>
          {loading ? "가입 중..." : "가입하기"}
        </Button>
        <Typography variant="body2" align="center" mt={2} color="text.secondary">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" style={{ color: "#3182F6", fontWeight: 600 }}>로그인</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
