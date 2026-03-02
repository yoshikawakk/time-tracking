import type { StudyRecord } from "../App";

type Props = {
  currentDate: Date;
  studyData: StudyRecord;
  onSelectDate: (date: string) => void;
  onChangeMonth: (offset: number) => void;
};

export default function Calendar({
  currentDate,
  studyData,
  onSelectDate,
  onChangeMonth,
}: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day <= 0 || day > daysInMonth) return null;
    return day;
  });

  const formatShort = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => onChangeMonth(-1)}>←</button>
        <h1>{year}年 {month + 1}月</h1>
        <button onClick={() => onChangeMonth(1)}>→</button>
      </div>

      <div className="grid grid-cols-7 gap-[1px] bg-[#3c4043]">
        {cells.map((day, i) => {
          if (!day) {
            return (
              <div key={i} className="bg-[#202124] h-28" />
            );
          }

          const dateKey = `${year}-${month + 1}-${day}`;
          const dayData = studyData[dateKey];

          // 🔥 タイトル別集計
          const titleTotals =
            dayData?.sessions.reduce((acc, s) => {
              if (!acc[s.title]) acc[s.title] = 0;
              acc[s.title] += s.duration;
              return acc;
            }, {} as Record<string, number>) || {};

          return (
            <div
              key={i}
              className="bg-[#202124] h-28 p-2 cursor-pointer text-xs"
              onClick={() => onSelectDate(dateKey)}
            >
              <div className="text-sm mb-1">{day}</div>

              {/* 🔥 タイトル別表示 */}
              <div className="space-y-1">
                {Object.entries(titleTotals)
                  .slice(0, 3) // 3個まで表示（崩れ防止）
                  .map(([title, total]) => (
                    <div
                      key={title}
                      className="flex justify-between text-blue-400"
                    >
                      <span className="truncate">{title}</span>
                      <span>{formatShort(total)}</span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}