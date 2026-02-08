'use client';

interface AttendanceStatisticsBarProps {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  totalStudents: number;
}

export function AttendanceStatisticsBar({
  presentCount,
  absentCount,
  lateCount,
  excusedCount,
  totalStudents,
}: AttendanceStatisticsBarProps) {
  const getWidth = (count: number) =>
    totalStudents > 0 ? `${(count / totalStudents) * 100}%` : '0%';

  return (
    <div className="space-y-3">
      <div className="flex gap-4 text-sm flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          출석 {presentCount}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          결석 {absentCount}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500" />
          지각 {lateCount}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          사유 {excusedCount}
        </span>
        <span className="text-muted-foreground ml-auto">
          총 {totalStudents}명
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden flex">
        {totalStudents > 0 && (
          <>
            <div className="bg-green-500 transition-all" style={{ width: getWidth(presentCount) }} />
            <div className="bg-yellow-500 transition-all" style={{ width: getWidth(lateCount) }} />
            <div className="bg-blue-500 transition-all" style={{ width: getWidth(excusedCount) }} />
            <div className="bg-red-500 transition-all" style={{ width: getWidth(absentCount) }} />
          </>
        )}
      </div>
    </div>
  );
}
