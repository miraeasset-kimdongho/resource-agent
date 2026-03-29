import { useState, useEffect } from "react";
import { Box, Paper, Typography, Chip, IconButton, Tooltip, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { getReservations, createReservation, cancelReservation } from "../api/reservations";
import { PERIODS, TIME_SLOTS } from "../constants/timeSlots";

const DAY_LABELS = ["월", "화", "수", "목", "금"];

function getWeekDates(base) {
  const date = new Date(base);
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateStr(date) {
  return date.toISOString().split("T")[0];
}

function isToday(date) {
  return toDateStr(date) === toDateStr(new Date());
}

export default function WeeklyTimetable({ space, role, userId }) {
  const { enqueueSnackbar } = useSnackbar();
  const [baseDate, setBaseDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const weekDates = getWeekDates(baseDate);

  useEffect(() => { fetchReservations(); }, [space?.id, baseDate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data } = await getReservations();
      const weekStrs = weekDates.map(toDateStr);
      setReservations(data.filter((r) => r.space_id === space.id && weekStrs.includes(r.date)));
    } finally {
      setLoading(false);
    }
  };

  const getCell = (dateStr, period) =>
    reservations.find((r) => r.date === dateStr && r.period === period);

  const handleCellClick = async (dateStr, period) => {
    if (role !== "student") return;
    const existing = getCell(dateStr, period);

    if (existing) {
      if (existing.user_id === userId && existing.status === "pending") {
        if (!window.confirm("예약을 취소하시겠습니까?")) return;
        try {
          await cancelReservation(existing.id);
          enqueueSnackbar("🗑️ 예약이 취소됐어요", { variant: "info" });
          fetchReservations();
        } catch (err) {
          enqueueSnackbar(`❌ ${err.response?.data?.detail || "취소 실패"}`, { variant: "error" });
        }
      }
      return;
    }

    const slot = TIME_SLOTS[period];
    if (!window.confirm(`📍 ${space.name}\n🗓 ${dateStr}\n⏰ ${slot.label} ${slot.time}\n\n예약 신청할까요?`)) return;
    try {
      await createReservation({ space_id: space.id, date: dateStr, period });
      enqueueSnackbar("✅ 예약 신청 완료! 선생님 승인을 기다려주세요", { variant: "success" });
      fetchReservations();
    } catch (err) {
      enqueueSnackbar(`❌ ${err.response?.data?.detail || "예약 실패"}`, { variant: "error" });
    }
  };

  const prevWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() - 7); setBaseDate(d); };
  const nextWeek = () => { const d = new Date(baseDate); d.setDate(d.getDate() + 7); setBaseDate(d); };

  const cellColor = (cell) => {
    if (!cell) return { bg: "rgba(255,255,255,0.6)", color: "#3182F6", cursor: role === "student" ? "pointer" : "default" };
    if (cell.status === "approved") return { bg: "rgba(240,68,82,0.12)", color: "#F04452", cursor: "default" };
    if (cell.status === "pending") return { bg: "rgba(255,168,0,0.15)", color: "#FF8A00", cursor: role === "student" ? "pointer" : "default" };
    return { bg: "rgba(0,0,0,0.04)", color: "#8B95A1", cursor: "default" };
  };

  const cellText = (cell) => {
    if (!cell) return "🟢 예약가능";
    if (cell.status === "approved") return "🔴 예약완료";
    if (cell.status === "pending") return "🟡 대기중";
    return "⚫ 취소됨";
  };

  return (
    <Box>
      {/* 주간 네비게이션 */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <IconButton onClick={prevWeek} size="small"><ChevronLeft /></IconButton>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          {toDateStr(weekDates[0])} ~ {toDateStr(weekDates[4])}
        </Typography>
        <IconButton onClick={nextWeek} size="small"><ChevronRight /></IconButton>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress size={24} /></Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "4px" }}>
            <thead>
              <tr>
                <th style={{ width: 110, padding: "6px 8px" }} />
                {weekDates.map((d, i) => (
                  <th key={i} style={{ padding: "6px 4px", textAlign: "center" }}>
                    <Box sx={{
                      borderRadius: 2,
                      py: 0.75,
                      bgcolor: isToday(d) ? "primary.main" : "rgba(255,255,255,0.6)",
                      color: isToday(d) ? "#fff" : "text.primary",
                    }}>
                      <Typography variant="body2" fontWeight={700}>{DAY_LABELS[i]}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>{toDateStr(d).slice(5)}</Typography>
                    </Box>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period}>
                  <td style={{ padding: "4px 0" }}>
                    <Box sx={{
                      borderRadius: 2, px: 1.5, py: 1,
                      bgcolor: "rgba(255,255,255,0.6)",
                      textAlign: "center",
                    }}>
                      <Typography variant="caption" fontWeight={700} display="block">{TIME_SLOTS[period].label}</Typography>
                      <Typography variant="caption" color="text.secondary">{TIME_SLOTS[period].time}</Typography>
                    </Box>
                  </td>
                  {weekDates.map((d, i) => {
                    const dateStr = toDateStr(d);
                    const cell = getCell(dateStr, period);
                    const style = cellColor(cell);
                    return (
                      <td key={i} style={{ padding: "4px" }}>
                        <Tooltip
                          title={role === "student" && !cell ? "클릭하여 예약 신청" : ""}
                          placement="top"
                        >
                          <Box
                            onClick={() => handleCellClick(dateStr, period)}
                            sx={{
                              borderRadius: 2,
                              py: 1.5,
                              textAlign: "center",
                              bgcolor: style.bg,
                              color: style.color,
                              cursor: style.cursor,
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              border: "1px solid rgba(255,255,255,0.5)",
                              transition: "all 0.15s",
                              "&:hover": role === "student" && !cell ? {
                                bgcolor: "rgba(49,130,246,0.15)",
                                transform: "scale(1.02)",
                              } : {},
                            }}
                          >
                            {cellText(cell)}
                          </Box>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
}
