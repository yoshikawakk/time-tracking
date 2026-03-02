import type { StudyRecord } from "../App";

type Props = {
  date: string;
  studyData: StudyRecord;
  onBack: () => void;
};

export default function DayView({ date, studyData, onBack }: Props) {
  const dayData = studyData[date] ?? { total: 0, sessions: [] };
  const hourHeight = 60; // 1時間の高さ(px)

  // 🔥 タイトル別集計
  const titleTotals = dayData.sessions.reduce((acc, s) => {
    if (!acc[s.title]) acc[s.title] = 0;
    acc[s.title] += s.duration;
    return acc;
  }, {} as Record<string, number>);

  const formatTotal = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}時間 ${m}分`;
  };

  const parseTime = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  return (
    <div>
      <button onClick={onBack}>← 戻る</button>
      <h2 className="text-xl mb-2">{date}</h2>

    
      {/* 🔥 タイトル別合計 */}
      <div className="mb-6">
        <h3 className="text-sm text-gray-400 mb-2"></h3>
        {Object.entries(titleTotals).map(([title, total]) => (
          <div key={title} className="flex justify-between text-sm">
            <span>{title}</span>
            <span>{formatTotal(total)}</span>
          </div>
        ))}
      </div>

      {/* 🔥 タイムライン */}
      <div className="relative border-l border-gray-600 ml-12">

        {/* 24時間ライン */}
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            style={{ height: hourHeight }}
            className="border-t border-gray-700 relative"
          >
            <span className="absolute -left-12 text-xs text-gray-400">
              {i}:00
            </span>
          </div>
        ))}

        {/* 🔥 セッションバー */}
        {dayData.sessions.map((session, index) => {
          const startMin = parseTime(session.start);
          const endMin = parseTime(session.end);

          const top = (startMin / 60) * hourHeight;
          const height = ((endMin - startMin) / 60) * hourHeight;

          return (
            <div
              key={index}
              className="absolute left-2 right-2 bg-blue-500 rounded-md opacity-80 text-xs p-1"
              style={{ top, height }}
            >
              <div className="font-bold truncate">
                {session.title}
              </div>
              {session.start} - {session.end}
            </div>
          );
        })}
      </div>
    </div>
  );
}