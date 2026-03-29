import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Paper, Typography, TextField, Button, AppBar, Toolbar, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Chip } from "@mui/material";
import { ArrowBack, Add, Edit, Delete } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { getSpaces, createSpace, updateSpace, deleteSpace } from "../api/spaces";

export default function SpaceManage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [spaces, setSpaces] = useState([]);
  const [form, setForm] = useState({ name: "", location: "", capacity: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => { fetchSpaces(); }, []);

  const fetchSpaces = async () => { const { data } = await getSpaces(); setSpaces(data); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      location: form.location || undefined,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
    };
    try {
      if (editing) {
        await updateSpace(editing.id, payload);
        enqueueSnackbar("✏️ 공간이 수정됐어요", { variant: "success" });
        setEditing(null);
      } else {
        await createSpace(payload);
        enqueueSnackbar("🏫 새 공간이 등록됐어요!", { variant: "success" });
      }
      setForm({ name: "", location: "", capacity: "" });
      fetchSpaces();
    } catch (err) {
      enqueueSnackbar(`❌ ${err.response?.data?.detail || "저장 실패"}`, { variant: "error" });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`'${name}' 공간을 삭제하시겠습니까?`)) return;
    await deleteSpace(id);
    enqueueSnackbar("🗑️ 공간이 삭제됐어요", { variant: "info" });
    fetchSpaces();
  };

  const startEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, location: s.location || "", capacity: s.capacity || "" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)", color: "text.primary",
      }}>
        <Toolbar>
          <IconButton onClick={() => navigate("/teacher")} edge="start"><ArrowBack /></IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>🏫 공간 관리</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 600, mx: "auto", p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* 등록/수정 폼 */}
        <Paper sx={{ p: 3, borderRadius: 4 }} component="form" onSubmit={handleSubmit}>
          <Typography variant="subtitle1" fontWeight={700} mb={2}>
            {editing ? "✏️ 공간 수정" : "➕ 공간 등록"}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <TextField size="small" label="공간명 *" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <TextField size="small" label="위치 (예: 3층 과학실)" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <TextField size="small" label="수용 인원" type="number" value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button fullWidth variant="contained" type="submit">
                {editing ? "수정하기" : <><Add fontSize="small" sx={{ mr: 0.5 }} />등록하기</>}
              </Button>
              {editing && (
                <Button variant="outlined" onClick={() => { setEditing(null); setForm({ name: "", location: "", capacity: "" }); }}>
                  취소
                </Button>
              )}
            </Box>
          </Box>
        </Paper>

        {/* 공간 목록 */}
        <Paper sx={{ borderRadius: 4, overflow: "hidden" }}>
          {spaces.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">등록된 공간이 없어요 😅</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {spaces.map((s, i) => (
                <ListItem key={s.id} divider={i < spaces.length - 1} sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography fontWeight={600}>🏫 {s.name}</Typography>
                      {s.status === "maintenance" && <Chip label="점검중" size="small" color="warning" />}
                    </Box>}
                    secondary={s.location && `📍 ${s.location}${s.capacity ? ` · 정원 ${s.capacity}명` : ""}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => startEdit(s)} sx={{ mr: 0.5 }}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(s.id, s.name)}><Delete fontSize="small" /></IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
