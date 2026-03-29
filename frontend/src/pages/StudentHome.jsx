import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold">공간 예약 시스템</h1>
        <div className="flex gap-3">
          <button onClick={() => navigate("/my-reservations")} className="text-sm text-blue-600 hover:underline">
            내 예약
          </button>
          <button onClick={logout} className="text-sm text-gray-500 hover:underline">로그아웃</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-6">
        {/* 공간 탭 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {spaces.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={`px-4 py-2 rounded-full text-sm border transition ${
                selected?.id === s.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 hover:border-blue-400"
              } ${s.status === "maintenance" ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={s.status === "maintenance"}
            >
              {s.name} {s.status === "maintenance" && "(점검중)"}
            </button>
          ))}
        </div>

        {selected && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-base font-semibold mb-1">{selected.name}</h2>
            {selected.location && (
              <p className="text-xs text-gray-400 mb-4">{selected.location}</p>
            )}
            <WeeklyTimetable space={selected} role="student" userId={userId} />
          </div>
        )}
      </div>
    </div>
  );
}
