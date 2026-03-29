import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await login(form);
      localStorage.setItem("token", data.access_token);
      // role 파싱 후 리다이렉트
      const payload = JSON.parse(atob(data.access_token.split(".")[1]));
      navigate(payload.role === "teacher" ? "/teacher" : "/");
    } catch {
      setError("이메일 또는 비밀번호가 올바르지 않습니다");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow w-96 space-y-4">
        <h1 className="text-2xl font-bold text-center">공간 예약 시스템</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="이메일"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="비밀번호"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" type="submit">
          로그인
        </button>
        <p className="text-center text-sm text-gray-500">
          계정이 없으신가요? <Link to="/register" className="text-blue-600">회원가입</Link>
        </p>
      </form>
    </div>
  );
}
