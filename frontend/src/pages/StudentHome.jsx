import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Chip, AppBar, Toolbar, Button, IconButton } from "@mui/material";
import { CalendarMonth, Logout } from "@mui/icons-material";
import { getSpaces } from "../api/spaces";
import WeeklyTimetable from "../components/WeeklyTimetable";

function getUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  return parseInt(JSON.parse(atob(token.split(".")[1])).sub);
}

export default function StudentHome() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [selected, setSelected] = useState(null);
  const userId = getUserId();

  useEffect(() => {
    getSpaces().then(({ data }) => {
      setSpaces(data);
      if (data.length > 0) setSelected(data[0]);
    });
  }, []);

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* 헤더 */}
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        color: "text.primary",
      }}>
        <Toolbar>
          <CalendarMonth sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>공간 예약</Typography>
          <Button size="small" onClick={() => navigate("/my-reservations")} sx={{ mr: 1 }}>
            📋 내 예약
          </Button>
          <IconButton size="small" onClick={logout}><Logout fontSize="small" /></IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        {/* 공간 선택 탭 */}
        <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
          {spaces.map((s) => (
            <Chip
              key={s.id}
              label={s.status === "maintenance" ? `🔧 ${s.name}` : `🏫 ${s.name}`}
              onClick={() => s.status !== "maintenance" && setSelected(s)}
              color={selected?.id === s.id ? "primary" : "default"}
              disabled={s.status === "maintenance"}
              sx={{ fontWeight: 600, px: 1 }}
            />
          ))}
        </Box>

        {selected && (
          <Paper sx={{ p: 3, borderRadius: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6">🏫 {selected.name}</Typography>
              {selected.location && (
                <Typography variant="body2" color="text.secondary">📍 {selected.location}</Typography>
              )}
            </Box>
            <WeeklyTimetable space={selected} role="student" userId={userId} />
          </Paper>
        )}

        {spaces.length === 0 && (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
            <Typography variant="h4" mb={1}>🏫</Typography>
            <Typography color="text.secondary">등록된 공간이 없어요</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
