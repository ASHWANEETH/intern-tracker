"use client";

import { Job } from "@/app/types/job";
import { useEffect, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isToday,
  addMonths,
  subMonths,
  differenceInCalendarDays,
} from "date-fns";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { BsBook } from "react-icons/bs";
import AnimatedList from "@/components/reactbits/AnimatedList";
import { ConfirmModal } from "@/components/ConfirmModal";

interface DeadlinesTabProps {
  jobs: Job[];
  onStatusUpdate: (jobId: string, newStatus: string) => void;
}

export default function DeadlinesTab({
  jobs,
  onStatusUpdate,
}: DeadlinesTabProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    items: Job[];
  } | null>(null);

  const [jobList, setJobList] = useState<Job[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setJobList(jobs); // initialize local state from props
  }, [jobs]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const [confirmModal, setConfirmModal] = useState<{
    jobId: string | null;
    open: boolean;
  }>({ jobId: null, open: false });

  const openConfirmModal = (jobId: string) => {
    setConfirmModal({ jobId, open: true });
  };

  const handleConfirmApply = () => {
    if (confirmModal.jobId) {
      setJobList((prev) =>
        prev.map((j) =>
          j.id === confirmModal.jobId ? { ...j, status: "applied" } : j
        )
      );
      onStatusUpdate(confirmModal.jobId, "applied");
    }
    setConfirmModal({ jobId: null, open: false });
  };

  const handleCancelApply = () => {
    setConfirmModal({ jobId: null, open: false });
  };

  const getJobsByDate = (
    field: "last_date_to_apply" | "exam_date",
    dayStr: string
  ) => jobList.filter((j) => j[field]?.slice(0, 10) === dayStr);

  const jumpToToday = () => setCurrentDate(new Date());

  return (
    <div className="w-full px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-start flex-wrap gap-2">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
          <FiChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </h2>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
          <FiChevronRight size={20} />
        </button>
        <button
          onClick={jumpToToday}
          className="ml-2 px-3 py-1 text-xs border border-violet-500 text-violet-600 dark:text-violet-400 rounded hover:bg-violet-50 dark:hover:bg-violet-900/30 transition"
        >
          Today
        </button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Application</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Exam</span>
        </div>
        <div className="flex items-center gap-1">
          <BsBook size={12} className="text-yellow-600" />
          <span>Interview</span>
        </div>
      </div>

      <ConfirmModal
        open={confirmModal.open}
        title="Mark as Applied"
        message="Are you sure you want to mark this job as applied?"
        onConfirm={handleConfirmApply}
        onCancel={handleCancelApply}
      />

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-[6px] sm:gap-[10px]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400"
          >
            {d}
          </div>
        ))}

        {Array.from({ length: days[0].getDay() }).map((_, i) => (
          <div key={i} className="p-2 h-[75px] sm:h-[90px]" />
        ))}

        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd");
          const applyJobs = getJobsByDate("last_date_to_apply", dayStr);
          const examJobs = getJobsByDate("exam_date", dayStr);

          const hasApply = applyJobs.length > 0;
          const hasExam = examJobs.length > 0;

          const bgClasses = hasApply
            ? "bg-gradient-to-br from-red-50 to-white dark:from-red-900/50 dark:to-transparent"
            : hasExam
            ? "bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/50 dark:to-transparent"
            : "bg-white dark:bg-neutral-900";

          const cellClick = (e: React.MouseEvent) => {
            if (!isMobile) return;
            const jobs = [...applyJobs, ...examJobs];
            if (jobs.length) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({
                x: Math.max(rect.left + rect.width / 2, 110),
                y: rect.bottom + window.scrollY + 10,
                items: jobs,
              });
            } else {
              setTooltip(null);
            }
          };

          const badgeHover = (e: React.MouseEvent) => {
            if (isMobile) return;
            const jobs = [...applyJobs, ...examJobs];
            if (jobs.length) {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({
                x: Math.max(rect.left + rect.width / 2, 110),
                y: rect.bottom + window.scrollY + 10,
                items: jobs,
              });
            }
          };

          return (
            <div
              key={dayStr}
              className={`relative p-2 h-[75px] sm:h-[90px] rounded-lg border border-gray-200 dark:border-neutral-700 ${bgClasses} transition`}
              onClick={cellClick}
            >
              <div
                className={`text-sm font-medium ${
                  isToday(day)
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {format(day, "d")}
              </div>

              {hasApply && (
                <div
                  className="absolute top-2 right-2 h-4 w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center"
                  title={`${applyJobs.length} applications`}
                  onMouseEnter={badgeHover}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {applyJobs.length}
                </div>
              )}
              {hasExam && (
                <div
                  className="absolute bottom-2 right-2 h-4 w-4 bg-yellow-500 text-white text-[10px] rounded-full flex items-center justify-center"
                  title={`${examJobs.length} exams`}
                  onMouseEnter={badgeHover}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {examJobs.length}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          style={{ top: tooltip.y, left: tooltip.x }}
          className="fixed z-50 max-w-xs transform -translate-x-1/2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg shadow-lg p-2 text-[13px] text-gray-800 dark:text-gray-100"
        >
          {tooltip.items.map((j) => {
            const isExam =
              j.exam_date &&
              (!j.last_date_to_apply || j.exam_date !== j.last_date_to_apply);
            const deadlineDate = isExam ? j.exam_date : j.last_date_to_apply;
            const daysLeft = deadlineDate
              ? Math.max(
                  0,
                  differenceInCalendarDays(new Date(deadlineDate), new Date())
                )
              : null;

            return (
              <div
                key={j.id}
                className="mb-2 last:mb-0 flex justify-between items-center"
              >
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-semibold text-sm">
                    {j.company_name}
                  </span>
                  {isExam ? (
                    <BsBook size={14} className="text-yellow-500" />
                  ) : daysLeft !== null ? (
                    <span className="text-[11px] text-red-500">
                      ({daysLeft}d left)
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Deadline List */}
      <div className="w-full max-w-full overflow-hidden">
        <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          All Upcoming Deadlines
        </h3>
        <AnimatedList
          items={[...jobList]
            .filter((j) => j.last_date_to_apply && j.status !== "applied")
            .sort(
              (a, b) =>
                new Date(a.last_date_to_apply!).getTime() -
                new Date(b.last_date_to_apply!).getTime()
            )
            .map((j) => {
              const daysLeft = j.last_date_to_apply
                ? Math.max(
                    0,
                    differenceInCalendarDays(
                      new Date(j.last_date_to_apply),
                      new Date()
                    )
                  )
                : null;

              return (
                <div
                  key={j.id}
                  className="flex justify-between items-center px-4 py-2 w-full"
                >
                  <div className="text-sm flex flex-col gap-[2px]">
                    <span className="font-medium">{j.company_name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {j.role} • ₹{j.ctc}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {daysLeft !== null && (
                      <span className="text-xs text-red-500">
                        {daysLeft}d left
                      </span>
                    )}
                    <button
                      onClick={() => openConfirmModal(j.id)}
                      className="text-xs px-2 py-[2px] bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                      Mark as Applied
                    </button>
                  </div>
                </div>
              );
            })}
          onItemSelect={() => {}}
          showGradients={true}
          enableArrowNavigation={true}
          displayScrollbar={false}
        />
      </div>
    </div>
  );
}
