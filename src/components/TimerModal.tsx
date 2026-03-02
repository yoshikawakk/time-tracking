import { useState, useEffect, useRef } from "react";
import type { StudyRecord } from "../App";

type Props = {
  date: string;
  onClose: () => void;
  setStudyData: React.Dispatch<React.SetStateAction<StudyRecord>>;
};

export default function TimerModal({
  date,
  onClose,
  setStudyData,
}: Props) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [title, setTitle] = useState("");

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatClock = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;

  const start = () => {
    if (!title.trim() || running) return;
    setStartTime(new Date());
    setElapsed(0);
    setRunning(true);
  };

  const stop = () => {
    if (!startTime) return;

    const endTime = new Date();
    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000
    );

    setStudyData((prev) => {
      const dayData = prev[date] || { total: 0, sessions: [] };
      return {
        ...prev,
        [date]: {
          total: dayData.total + duration,
          sessions: [
            ...dayData.sessions,
            {
              title,
              start: formatClock(startTime),
              end: formatClock(endTime),
              duration,
            },
          ],
        },
      };
    });

    setRunning(false);
    setElapsed(0);
    setStartTime(null);
    setTitle("");
  };

  const formatDisplay = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white text-black p-6 rounded-xl w-80">
        {!running && (
          <input
            type="text"
            placeholder="タイトル"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
        )}

        <div className="text-4xl text-center mb-6 font-mono">
          {formatDisplay(elapsed)}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={stop}>停止</button>
          <button onClick={start}>開始</button>
        </div>

        <button onClick={onClose} className="w-full mt-4 bg-gray-200">
          閉じる
        </button>
      </div>
    </div>
  );
}