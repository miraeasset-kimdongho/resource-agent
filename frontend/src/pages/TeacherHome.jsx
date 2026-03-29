import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReservations, updateReservationStatus } from "../api/reservations";

const STATUS_LABEL = {
  pending: { text: "대기중", cls: "bg-yellow-100 text-yellow-700" },
  approved: { text: "승인완료", cls: "bg-green-100 text-green-700" },
  rejected: { text: "거절됨", cls: "bg-red-100 text-red-700" },
  cancelled: { text: "취소됨", cls: "bg-gray-100 text-gray-500" },
};

export default function TeacherHome() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const { data } = await getReservations();
    setReservations(data);
  };

  const handleStatus = async (r, newStatus) => {
    try {
      await updateReservationStatus(r.id, { status: newStatus, version: r.version });
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.detail || "처리 실패");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold">예약 관리 (선생님)</h1>
        <div className="flex gap-3">
          <button onClick={() => navigate("/spaces")} className="text-sm text-blue-600 hover:underline">
            공간 관리
          </button>
          <button onClick={logout} className="text-sm text-gray-500 hover:underline">로그아웃</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* 필터 탭 */}
        <div className="flex gap-2 mb-4">
          {["pending", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm border ${
                filter === s ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600"
              }`}
            >
              {s === "pending" ? "대기중" : "전체"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 mt-16">예약 내역이 없습니다</p>
        ) : (
          <table className="w-full bg-white rounded-xl shadow text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">학생</th>
                <th className="px-4 py-3">공간</th>
                <th className="px-4 py-3">날짜</th>
                <th className="px-4 py-3">교시</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">처리</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">{r.user?.name ?? "-"}</td>
                  <td className="px-4 py-3 text-center">{r.space?.name}</td>
                  <td className="px-4 py-3 text-center">{r.date}</td>
                  <td className="px-4 py-3 text-center">{r.period}교시</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUS_LABEL[r.status]?.cls}`}>
                      {STATUS_LABEL[r.status]?.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.status === "pending" && (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleStatus(r, "approved")}
                          className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleStatus(r, "rejected")}
                          className="text-xs bg-red-400 text-white px-2 py-1 rounded hover:bg-red-500"
                        >
                          거절
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
