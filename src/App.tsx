import { useState } from "react";
import Calendar from "./components/Calendar";
import DayView from "./components/DayView";
import TimerModal from "./components/TimerModal";
import FabButton from "./components/FabButton";
import { supabase } from "./lib/supabase";

export type Session = {
  title: string;
  start: string;
  end: string;
  duration: number;
};

export type StudyRecord = {
  [date: string]: {
    total: number;
    sessions: Session[];
  };
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [studyData, setStudyData] = useState<StudyRecord>({});
  const [showTimer, setShowTimer] = useState(false);

  // 🔥 Supabase保存
  const saveStudyTime = async (date: string, start: string, end: string) => {
    const { data, error } = await supabase
      .from("time-tracking")
      .insert([
        {
          date: date,
          start_time: start,
          end_time: end,
        },
      ]);

    if (error) {
      console.error("保存エラー:", error);
    } else {
      console.log("保存成功:", data);
    }
  };

  const changeMonth = (offset: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + offset);
      return newDate;
    });
  };

  // 🔥 月別タイトル集計
  const getMonthlyTitleTotals = (year: number, month: number) => {
    const totals: Record<string, number> = {};

    Object.entries(studyData).forEach(([date, data]) => {
      const d = new Date(date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        data.sessions.forEach((s) => {
          if (!totals[s.title]) totals[s.title] = 0;
          totals[s.title] += s.duration;
        });
      }
    });

    return totals;
  };

  const monthlyTotals = getMonthlyTitleTotals(
    currentDate.getFullYear(),
    currentDate.getMonth()
  );

  return (
    <div className="bg-[#202124] text-white min-h-screen p-4">
      {!selectedDate ? (
        <>
          <Calendar
            currentDate={currentDate}
            studyData={studyData}
            onSelectDate={setSelectedDate}
            onChangeMonth={changeMonth}
          />

          {/* 月別集計 */}
          <div className="mt-6">
            <h2 className="text-lg mb-2">今月の科目別合計</h2>

            {Object.entries(monthlyTotals).map(([title, total]) => {
              const h = Math.floor(total / 3600);
              const m = Math.floor((total % 3600) / 60);

              return (
                <div key={title} className="flex justify-between text-sm">
                  <span>{title}</span>
                  <span>
                    {h}時間 {m}分
                  </span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <DayView
          date={selectedDate}
          studyData={studyData}
          onBack={() => setSelectedDate(null)}
        />
      )}

      <FabButton
        onClick={() => {
          if (selectedDate) {
            setShowTimer(true);
          } else {
            const today = new Date();
            const dateString = `${today.getFullYear()}-${
              today.getMonth() + 1
            }-${today.getDate()}`;
            setSelectedDate(dateString);
            setShowTimer(true);
          }
        }}
      />

      {showTimer && selectedDate && (
        <TimerModal
          date={selectedDate}
          onClose={() => setShowTimer(false)}
          setStudyData={setStudyData}
        />
      )}
    </div>
  );
}