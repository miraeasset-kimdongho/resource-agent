import { useState, useEffect } from "react";
import { getSpaceAvailability } from "../api/spaces";
import { createReservation, cancelReservation } from "../api/reservations";

const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];
const PERIOD_LABELS = {
  1: "1교시 (09:00)",
  2: "2교시 (10:00)",
  3: "3교시 (11:00)",
  4: "4교시 (12:00)",
  5: "5교시 (13:00)",
  6: "6교시 (14:00)",
  7: "7교시 (15:00)",
  8: "8교시 (16:00)",
};

function getWeekDates(baseDate) {
  const date = new Date(baseDate);
  const day = date.getDay(); // 0=일, 1=월 ...
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

const DAY_LABELS = ["월", "화", "수", "목", "금"];

export default function WeeklyTimetable({ space, role, userId }) {
  const [baseDate, setBaseDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const weekDates = getWeekDates(baseDate);

  useEffect(() => {
    fetchReservations();
  }, [space, baseDate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const from = toDateStr(weekDates[0]);
      const to = toDateStr(weekDates[4]);
      const { data } = await getSpaceAvailability(space.id, from, to);
      setReservations(data);
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
      // 본인 pending 예약 → 취소
      if (existing.is_mine && existing.status === "pending") {
        if (!confirm("예약을 취소하시겠습니까?")) return;
        // 취소하려면 실제 예약 ID가 필요 — 취소 전용 API 호출
        try {
          const { getReservations } = await import("../api/reservations");
          const { data: myList } = await getReservations();
          const mine = myList.find(
            (r) => r.space_id === space.id && r.date === dateStr && r.period === period && r.status === "pending"
          );
          if (mine) {
            await cancelReservation(mine.id);
            fetchReservations();
          }
        } catch (err) {
          alert(err.response?.data?.detail || "취소 실패");
        }
      }
      return;
    }

    // 빈 셀 → 예약 신청
    if (!confirm(`${space.name} | ${dateStr} | ${PERIOD_LABELS[period]} 예약 신청하시겠습니까?`)) return;
    try {
      await createReservation({ space_id: space.id, date: dateStr, period });
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.detail || "예약 실패");
    }
  };

  const cellStyle = (cell) => {
    if (!cell) return "bg-white hover:bg-blue-50 cursor-pointer text-gray-400 text-xs";
    const { status, is_mine } = cell;
    if (status === "approved") return `bg-red-100 text-red-700 text-xs font-medium ${is_mine ? "cursor-pointer" : "cursor-default"}`;
    if (status === "pending") return `bg-yellow-100 text-yellow-700 text-xs font-medium ${is_mine ? "cursor-pointer" : "cursor-default"}`;
    return "bg-gray-100 text-gray-400 text-xs cursor-default";
  };

  const cellText = (cell) => {
    if (!cell) return "예약가능";
    if (cell.status === "approved") return cell.is_mine ? "예약완료(나)" : "예약완료";
    if (cell.status === "pending") return cell.is_mine ? "대기중(나)" : "대기중";
    return "-";
  };

  const prevWeek = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - 7);
    setBaseDate(d);
  };

  const nextWeek = () => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + 7);
    setBaseDate(d);
  };

  return (
    <div className="overflow-x-auto">
      {/* 주간 네비게이션 */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={prevWeek} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">← 이전 주</button>
        <span className="text-sm font-medium text-gray-700">
          {toDateStr(weekDates[0])} ~ {toDateStr(weekDates[4])}
        </span>
        <button onClick={nextWeek} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">다음 주 →</button>
      </div>

      {loading && <p className="text-center text-gray-400 text-sm py-4">불러오는 중...</p>}

      {/* 시간표 그리드 */}
      <table className="w-full border-collapse text-center text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-2 w-28 text-gray-600">교시</th>
            {weekDates.map((d, i) => (
              <th key={i} className="border px-2 py-2 text-gray-700">
                <div>{DAY_LABELS[i]}</div>
                <div className="text-xs text-gray-400">{toDateStr(d).slice(5)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period}>
              <td className="border px-2 py-3 bg-gray-50 text-xs text-gray-600 whitespace-nowrap">
                {PERIOD_LABELS[period]}
              </td>
              {weekDates.map((d, i) => {
                const dateStr = toDateStr(d);
                const cell = getCell(dateStr, period);
                return (
                  <td
                    key={i}
                    className={`border px-2 py-3 ${cellStyle(cell)}`}
                    onClick={() => handleCellClick(dateStr, period)}
                  >
                    {cellText(cell)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 범례 */}
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span><span className="inline-block w-3 h-3 bg-white border mr-1" />예약가능</span>
        <span><span className="inline-block w-3 h-3 bg-yellow-100 border mr-1" />대기중</span>
        <span><span className="inline-block w-3 h-3 bg-red-100 border mr-1" />예약완료</span>
      </div>
    </div>
  );
}
