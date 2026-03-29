import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getReservations, cancelReservation } from "../api/reservations";

const STATUS_LABEL = {
  pending: { text: "대기중", cls: "bg-yellow-100 text-yellow-700" },
  approved: { text: "승인완료", cls: "bg-green-100 text-green-700" },
  rejected: { text: "거절됨", cls: "bg-red-100 text-red-700" },
  cancelled: { text: "취소됨", cls: "bg-gray-100 text-gray-500" },
};

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    getReservations().then(({ data }) => setReservations(data));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm("예약을 취소하시겠습니까?")) return;
    try {
      await cancelReservation(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "취소 실패");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex justify-between items-center">
        <h1 className="text-lg font-bold">내 예약 현황</h1>
        <button onClick={() => navigate("/")} className="text-sm text-blue-600 hover:underline">← 홈으로</button>
      </header>

      <div className="max-w-3xl mx-auto p-6">
        {reservations.length === 0 ? (
          <p className="text-center text-gray-400 mt-16">예약 내역이 없습니다</p>
        ) : (
          <table className="w-full bg-white rounded-xl shadow text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">공간</th>
                <th className="px-4 py-3">날짜</th>
                <th className="px-4 py-3">교시</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3">취소</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">{r.space?.name}</td>
                  <td className="px-4 py-3 text-center">{r.date}</td>
                  <td className="px-4 py-3 text-center">{r.period}교시</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUS_LABEL[r.status]?.cls}`}>
                      {STATUS_LABEL[r.status]?.text}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.status === "pending" && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        취소
                      </button>
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
