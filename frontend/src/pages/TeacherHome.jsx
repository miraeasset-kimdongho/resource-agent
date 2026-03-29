import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Chip, AppBar, Toolbar, Button, IconButton, Table, TableBody, TableCell, TableHead, TableRow, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { Logout, SpaceDashboard } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { getReservations, updateReservationStatus } from "../api/reservations";
import { TIME_SLOTS } from "../constants/timeSlots";

const STATUS = {
  pending:   { label: "⏳ 대기중",   color: "warning" },
  approved:  { label: "✅ 승인완료", color: "success" },
  rejected:  { label: "❌ 거절됨",   color: "error" },
  cancelled: { label: "🚫 취소됨",   color: "default" },
};

export default function TeacherHome() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("pending");

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const { data } = await getReservations();
    setReservations(data);
  };

  const handleStatus = async (r, newStatus) => {
    try {
      await updateReservationStatus(r.id, { status: newStatus, version: r.version });
      enqueueSnackbar(
        newStatus === "approved" ? `✅ ${r.space?.name} 예약을 승인했어요` : `❌ 예약을 거절했어요`,
        { variant: newStatus === "approved" ? "success" : "error" }
      );
      fetchAll();
    } catch (err) {
      enqueueSnackbar(`⚠️ ${err.response?.data?.detail || "처리 실패"}`, { variant: "warning" });
    }
  };

  const logout = () => { localStorage.removeItem("token"); navigate("/login"); };
  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);
  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", color: "text.primary",
      }}>
        <Toolbar>
          <SpaceDashboard sx={{ mr: 1, color: "primary.main" }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>예약 관리</Typography>
          <Button size="small" onClick={() => navigate("/spaces")} sx={{ mr: 1 }}>🏫 공간 관리</Button>
          <IconButton size="small" onClick={logout}><Logout fontSize="small" /></IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        {/* 필터 */}
        <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
          <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small">
            <ToggleButton value="pending" sx={{ borderRadius: "12px !important", px: 2 }}>
              ⏳ 대기중 {pendingCount > 0 && <Chip label={pendingCount} size="small" color="warning" sx={{ ml: 1, height: 18, fontSize: "0.65rem" }} />}
            </ToggleButton>
            <ToggleButton value="all" sx={{ borderRadius: "12px !important", px: 2 }}>전체</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {filtered.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
            <Typography variant="h4" mb={1}>🎉</Typography>
            <Typography color="text.secondary">처리할 예약이 없어요</Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ bgcolor: "rgba(49,130,246,0.06)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>학생</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>공간</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>날짜</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>시간</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>상태</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>처리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>👤 {r.user?.name ?? "-"}</TableCell>
                    <TableCell>🏫 {r.space?.name}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{TIME_SLOTS[r.period]?.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{TIME_SLOTS[r.period]?.time}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={STATUS[r.status]?.label} color={STATUS[r.status]?.color} size="small" />
                    </TableCell>
                    <TableCell>
                      {r.status === "pending" && (
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button size="small" variant="contained" color="success" onClick={() => handleStatus(r, "approved")}>승인</Button>
                          <Button size="small" variant="outlined" color="error" onClick={() => handleStatus(r, "rejected")}>거절</Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
