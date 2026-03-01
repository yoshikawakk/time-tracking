import { useState, useEffect } from "react";

type StudyRecord = {
  [date: string]: number;
};

function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (sec === 0) return "";
  return `${h}h ${m}m`;
}

function formatDisplay(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [studyData, setStudyData] = useState<StudyRecord>({});
  const [showTimer, setShowTimer] = useState(false);

const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  // ===== モード =====
  const [mode, setMode] = useState<"timer" | "stopwatch">("timer");

  // ===== 共通時間 =====
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [initialTimerValue, setInitialTimerValue] = useState(0);

  // ===== 動作制御 =====
  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setTime(prev => {
        if (mode === "timer") {
          if (prev <= 1) {
            setRunning(false);

            // ⭐ 0になったときだけ加算
            if (selectedDate) {
              setStudyData(prevData => ({
                ...prevData,
                [selectedDate]:
                  (prevData[selectedDate] || 0) + initialTimerValue
              }));
            }

            return 0;
          }
          return prev - 1;
        }

        // stopwatch
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running, mode]);

  const start = () => {
    if (mode === "timer" && time <= 0) return;
    if (mode === "timer") {
      setInitialTimerValue(time);
    }
    setRunning(true);
  };

  const stop = () => {
    setRunning(false);

  
    if (mode === "stopwatch" && selectedDate) {
      setStudyData(prev => ({
        ...prev,
        [selectedDate]: (prev[selectedDate] || 0) + time
      }));
      setTime(0);
    }
  };

  const reset = () => {
    setRunning(false);
    setTime(0);
  };

  const addTime = (sec: number) => {
    if (running) return;
    setTime(prev => prev + sec);
  };

  // ===== 月表示 =====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day <= 0 || day > daysInMonth) return null;
    return day;
  });

  return (
    <div className="bg-[#202124] text-white min-h-screen p-4 relative">
      {/* ===== 月表示 ===== */}
      {!selectedDate && (
        <>
          <h1 className="text-xl mb-4">
            {year}年 {month + 1}月
          </h1>

          <div className="grid grid-cols-7 gap-[1px] bg-[#3c4043]">
            {cells.map((day, i) => (
              <div
                key={i}
                className="bg-[#202124] h-28 p-2 cursor-pointer"
                onClick={() => {
                  if (day)
                    setSelectedDate(`${year}-${month + 1}-${day}`);
                }}
              >
                {day && (
                  <>
                    <div>{day}</div>
                    <div className="text-xs text-blue-400 mt-1">
                      {formatTime(
                        studyData[
                          `${year}-${month + 1}-${day}`
                        ] || 0
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== 1日表示 ===== */}
      {selectedDate && (
        <div>
          <div className="flex justify-between mb-4">
            <button onClick={() => setSelectedDate(null)}>
              ← 戻る
            </button>
            <h2>{selectedDate}</h2>
          </div>

          <div className="space-y-6">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="h-20 border-b border-gray-700 relative"
              >
                <div className="absolute left-0 text-xs text-gray-400">
                  {i}:00
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      
      {/* ===== モーダル ===== */}
      {showTimer && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-[#f5dede] text-black p-6 rounded-xl w-80">

            {/* モード切替 */}
            <div className="flex justify-center gap-4 mb-4">
              <button onClick={() => { reset(); setMode("timer"); }}>
                タイマー
              </button>
              <button onClick={() => { reset(); setMode("stopwatch"); }}>
                ストップウォッチ
              </button>
            </div>

            <div className="text-5xl text-center mb-6 font-mono">
              {formatDisplay(time)}
            </div>

            {mode === "timer" && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={() => addTime(600)}>10分</button>
                <button onClick={() => addTime(60)}>1分</button>
                <button onClick={() => addTime(10)}>10秒</button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button onClick={reset}>リセット</button>
              <button onClick={stop}>停止</button>
              <button onClick={start}>開始</button>
            </div>

            <button
              onClick={() => setShowTimer(false)}
              className="w-full bg-gray-300 mt-4"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
<button
  onClick={() => {
    setMode("timer");
    setTime(0);
    setShowTimer(true);
  }}
  className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-[#1a73e8] text-3xl shadow-lg"
>
  +
</button>

    </div>
  );
}