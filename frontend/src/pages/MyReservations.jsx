import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, Chip, AppBar, Toolbar, IconButton, Button, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { getReservations, cancelReservation } from "../api/reservations";
import { TIME_SLOTS } from "../constants/timeSlots";

const STATUS = {
  pending:   { label: "⏳ 대기중",   color: "warning" },
  approved:  { label: "✅ 승인완료", color: "success" },
  rejected:  { label: "❌ 거절됨",   color: "error" },
  cancelled: { label: "🚫 취소됨",   color: "default" },
};

export default function MyReservations() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [reservations, setReservations] = useState([]);

  useEffect(() => { getReservations().then(({ data }) => setReservations(data)); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm("예약을 취소하시겠습니까?")) return;
    try {
      await cancelReservation(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      enqueueSnackbar("🗑️ 예약이 취소됐어요", { variant: "info" });
    } catch (err) {
      enqueueSnackbar(`❌ ${err.response?.data?.detail || "취소 실패"}`, { variant: "error" });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", color: "text.primary",
      }}>
        <Toolbar>
          <IconButton onClick={() => navigate("/")} edge="start"><ArrowBack /></IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>📋 내 예약 현황</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 700, mx: "auto", p: 3 }}>
        {reservations.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 4 }}>
            <Typography variant="h4" mb={1}>📭</Typography>
            <Typography color="text.secondary">예약 내역이 없어요</Typography>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
            <Table>
              <TableHead sx={{ bgcolor: "rgba(49,130,246,0.06)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>공간</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>날짜</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>시간</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>상태</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {reservations.map((r) => (
                  <TableRow key={r.id} hover>
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
                        <Button size="small" color="error" onClick={() => handleCancel(r.id)}>취소</Button>
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
