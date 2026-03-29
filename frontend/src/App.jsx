import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentHome from "./pages/StudentHome";
import MyReservations from "./pages/MyReservations";
import TeacherHome from "./pages/TeacherHome";
import SpaceManage from "./pages/SpaceManage";

function getRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1])).role;
  } catch {
    return null;
  }
}

function PrivateRoute({ children, allowedRole }) {
  const role = getRole();
  if (!role) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

function HomeRoute() {
  const role = getRole();
  if (!role) return <Navigate to="/login" replace />;
  return role === "teacher" ? <Navigate to="/teacher" replace /> : <Navigate to="/student" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeRoute />} />
        <Route path="/student" element={<PrivateRoute allowedRole="student"><StudentHome /></PrivateRoute>} />
        <Route path="/my-reservations" element={<PrivateRoute allowedRole="student"><MyReservations /></PrivateRoute>} />
        <Route path="/teacher" element={<PrivateRoute allowedRole="teacher"><TeacherHome /></PrivateRoute>} />
        <Route path="/spaces" element={<PrivateRoute allowedRole="teacher"><SpaceManage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
