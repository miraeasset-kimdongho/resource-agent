import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSpaces, createSpace, updateSpace, deleteSpace } from "../api/spaces";

export default function SpaceManage() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState([]);
  const [form, setForm] = useState({ name: "", location: "", capacity: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    const { data } = await getSpaces();
    setSpaces(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, location: form.location || undefined, capacity: form.capacity ? parseInt(form.capacity) : undefined };
    try {
      if (editing) {
        await updateSpace(editing.id, payload);
        setEditing(null);
      } else {
        await createSpace(payload);
      }
      setForm({ name: "", location: "", capacity: "" });
      fetchSpaces();
    } catch (err) {
      alert(err.response?.data?.detail || "저장 실패");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("공간을 삭제하시겠습니까?")) return;
    await deleteSpace(id);
    fetchSpaces();
  };

  const startEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, location: s.location || "", capacity: s.capacity || "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold">공간 관리</h1>
        <button onClick={() => navigate("/teacher")} className="text-sm text-blue-600 hover:underline">← 예약 관리</button>
      </header>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* 등록/수정 폼 */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-sm font-semibold mb-3">{editing ? "공간 수정" : "공간 등록"}</h2>
          <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
            <input
              className="border rounded px-3 py-2 text-sm flex-1 min-w-32"
              placeholder="공간명 *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="border rounded px-3 py-2 text-sm flex-1 min-w-32"
              placeholder="위치 (예: 3층)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
            <input
              className="border rounded px-3 py-2 text-sm w-24"
              placeholder="수용인원"
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700" type="submit">
              {editing ? "수정" : "등록"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setForm({ name: "", location: "", capacity: "" }); }}
                className="border px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-100">
                취소
              </button>
            )}
          </form>
        </div>

        {/* 공간 목록 */}
        <div className="bg-white rounded-xl shadow">
          {spaces.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-4 border-b last:border-0">
              <div>
                <span className="font-medium text-sm">{s.name}</span>
                {s.location && <span className="text-xs text-gray-400 ml-2">{s.location}</span>}
                {s.status === "maintenance" && (
                  <span className="ml-2 text-xs text-orange-500">(점검중)</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(s)} className="text-xs text-blue-500 hover:underline">수정</button>
                <button onClick={() => handleDelete(s.id)} className="text-xs text-red-400 hover:underline">삭제</button>
              </div>
            </div>
          ))}
          {spaces.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">등록된 공간이 없습니다</p>
          )}
        </div>
      </div>
    </div>
  );
}
