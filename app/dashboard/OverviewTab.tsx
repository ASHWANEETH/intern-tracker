"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Job } from "@/app/types/job";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import Image from "next/image";
import { VscLinkExternal } from "react-icons/vsc";
import AnimatedList from "@/components/reactbits/AnimatedList";
import JobFormDialog from "@/components/JobFormDialog";

dayjs.extend(relativeTime);

type Props = {
  user: { full_name?: string; email?: string };
  jobs: Job[];
  setActiveTab: (tab: "overview" | "applications" | "deadlines") => void;
};

const statusColors: Record<string, string> = {
  "to-apply": "#81858d",
  applied: "#4f8ff7",
  waiting: "#f7aa23",
  rejected: "#f25454",
  approved: "#32cc6e",
};

export default function OverviewTab({ jobs, setActiveTab }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [jobs]);

  const statusCounts = jobs.reduce((acc: Record<string, number>, job) => {
    if (!job.status || job.status === "-9") return acc;
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(statusCounts), 1);

  const bars = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    color: statusColors[status] || "#94a3b8",
    widthPercent: (count / maxCount) * 100,
  }));

  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const getCTCValue = (ctc: string) => {
    // Handles ranges like "10-20" or "10-20 LPA"
    const match = ctc.match(/(\d+)\s*-\s*(\d+)/);
    if (match) {
      // Use the lower bound for sorting
      return parseFloat(match[1]);
    }
    // Handles single values like "30", "30 LPA", "30000/month"
    const numeric = parseFloat(ctc.replace(/[^\d.]/g, ""));
    return isNaN(numeric) ? 0 : numeric;
  };

  // Optimized: no unnecessary array copies
  const top3 = jobs
    .filter((job) => job.ctc)
    .sort((a, b) => getCTCValue(b.ctc) - getCTCValue(a.ctc))
    .slice(0, 3);

  const latestJobs = jobs
    .filter((j) => j.applied_date)
    .sort(
      (a, b) =>
        new Date(b.applied_date!).getTime() -
        new Date(a.applied_date!).getTime()
    )
    .slice(0, 3);

  const upcomingDeadlines = jobs
    .filter((j) => j.status === "to-apply" && j.last_date_to_apply)
    .sort(
      (a, b) =>
        new Date(a.last_date_to_apply!).getTime() -
        new Date(b.last_date_to_apply!).getTime()
    )
    .slice(0, 3);

  // Modal state for JobFormDialog
  const [jobModalOpen, setJobModalOpen] = useState(false);

  // Dummy props for JobFormDialog (replace with your actual state/handlers)
  // You may want to lift these up to Dashboard and pass them down
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [ctc, setCtc] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState("to-apply");
  const [lastDateToApply, setLastDateToApply] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [examDate, setExamDate] = useState("");

  // Dummy handler for job add/update (replace with your actual logic)
  const handleAddOrUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    // ...your logic here...
    setJobModalOpen(false);
  };

  return (
    <div className="w-full px-1 sm:px-4 md:px-4 space-y-3 sm:space-y-4 mt-0 sm:mt-0">
      {/* JobFormDialog Modal */}
      <JobFormDialog
        modalOpen={jobModalOpen}
        setModalOpen={setJobModalOpen}
        handleAddOrUpdateJob={handleAddOrUpdateJob}
        editJobId={editJobId}
        setEditJobId={setEditJobId}
        companyName={companyName}
        setCompanyName={setCompanyName}
        role={role}
        setRole={setRole}
        ctc={ctc}
        setCtc={setCtc}
        requirements={requirements}
        setRequirements={setRequirements}
        status={status}
        setStatus={setStatus}
        lastDateToApply={lastDateToApply}
        setLastDateToApply={setLastDateToApply}
        appliedDate={appliedDate}
        setAppliedDate={setAppliedDate}
        examDate={examDate}
        setExamDate={setExamDate}
      />
      {jobs.length === 0 ? (
        <SpotlightCard
          key="add-app"
          spotlightColor="rgba(196, 181, 253, 0.18)" // lighter violet gradient
          className="px-4 py-4 sm:p-5 bg-gradient-to-r from-violet-100 via-pink-100 to-indigo-100 dark:from-violet-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 shadow rounded-xl flex flex-col items-center justify-center"
        >
          <p className="text-sm sm:text-base text-gray-500 mb-2">
            No job applications yet. Start adding!
          </p>
          <button
            onClick={() => setJobModalOpen(true)}
            className="px-5 py-2 rounded font-semibold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 text-violet-900 animate-gradient-x dark:text-white shadow hover:scale-105 transition flex items-center gap-2"
          >
            <span>Add with AI✨</span>
          </button>
          <p className="my-2 text-xs text-gray-700 dark:text-gray-300 text-center">
            Use AI✨ to quickly add a new application from a Job Description
          </p>
          <p className="mb-7 text-xs text-gray-700 dark:text-gray-300 text-center">
            or Fill Manually!
          </p>
          <Image
            src="/adddash.svg"
            alt="Illustration"
            width={0}
            height={0}
            sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 120px"
            className="w-50 sm:w-60 md:w-80 h-auto"
            priority
          />
        </SpotlightCard>
      ) : (
        <>
          <AnimatedList
            items={[
              // Chart Section
              <SpotlightCard
                key="chart"
                spotlightColor="rgba(139, 92, 246, 0.2)"
                className="px-4 py-5 sm:p-5 bg-violet-50 dark:bg-violet-900/10 shadow rounded-xl"
              >
                <div className="flex justify-around items-center mb-4 md:mb-1">
                  <p className="text-xs sm:text-sm flex items-center gap-1">
                    Total Applications:{" "}
                    <span className="font-semibold">{jobs.length}</span>
                    <button
                      onClick={() => setActiveTab("applications")}
                      className="text-violet-600 dark:text-violet-400 ml-1"
                      title="Show Applications"
                    >
                      <VscLinkExternal size={10} />
                    </button>
                  </p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
                  <div className="flex-1 space-y-2">
                    {bars.map(({ status, count, color, widthPercent }) => (
                      <div
                        key={status}
                        className="flex items-center gap-2 text-xs sm:text-sm"
                      >
                        <span className="w-20 sm:w-24 capitalize">
                          {status}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 relative">
                          <div
                            className="h-2.5 absolute top-0 left-0 rounded-full transition-all duration-700"
                            style={{
                              width: mounted ? `${widthPercent}%` : "0%",
                              backgroundColor: color,
                            }}
                          />
                        </div>
                        <span className="w-5 text-right font-semibold">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block w-[300px] h-56">
                    {mounted && (
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={statusColors[entry.name] || "#ccc"}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </SpotlightCard>,

              // Add Application Card (AI Integrated, single button, opens modal)
              <SpotlightCard
                key="add-app"
                spotlightColor="rgba(196, 181, 253, 0.18)" // lighter violet gradient
                className="px-4 py-4 sm:p-5 bg-gradient-to-r from-violet-100 via-pink-100 to-indigo-100 dark:from-violet-900/20 dark:via-pink-900/20 dark:to-indigo-900/20 shadow rounded-xl flex flex-col items-center justify-center"
              >
                <button
                  onClick={() => setJobModalOpen(true)}
                  className="px-5 py-2 rounded font-semibold bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 text-violet-900 animate-gradient-x dark:text-white shadow hover:scale-105 transition flex items-center gap-2"
                >
                  <span className="text-gray-700 dark:text-black">
                    Add with AI✨
                  </span>
                </button>
                <p className="mt-2 text-xs text-gray-700 dark:text-gray-300 text-center">
                  Use AI✨ to quickly add a new application from a Job
                  Description!
                </p>
              </SpotlightCard>,
              // Upcoming Deadlines
              <SpotlightCard
                key="deadlines"
                spotlightColor="rgba(236, 72, 153, 0.15)"
                className="px-4 py-5 sm:p-5 bg-pink-50 dark:bg-pink-900/10 shadow rounded-xl"
              >
                <h3 className="text-sm sm:text-base font-medium mb-3">
                  Upcoming Deadlines
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {upcomingDeadlines
                    .filter((job) => job.status === "to-apply")
                    .map((job) => (
                      <div
                        key={job.id}
                        className="px-3 py-2 sm:p-3 rounded-xl bg-white/80 dark:bg-zinc-800 shadow text-xs sm:text-sm flex flex-col"
                      >
                        <span className="font-semibold">
                          {job.role} at {job.company_name}
                        </span>
                        <span className="text-pink-600 font-bold">
                          {dayjs(job.last_date_to_apply).format("MMM D")}
                        </span>
                      </div>
                    ))}
                  {upcomingDeadlines.filter((j) => j.status === "to-apply")
                    .length === 0 && (
                    <div className="italic text-gray-500 px-3 py-2.5 sm:p-4 rounded-xl bg-white/80 dark:bg-zinc-800 shadow text-xs sm:text-sm">
                      No upcoming deadlines.
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab("deadlines")}
                  className="text-xs sm:text-sm text-violet-700 dark:text-violet-400 hover:underline font-medium mt-3 inline-block"
                >
                  &nbsp;Show all deadlines →
                </button>
              </SpotlightCard>,

              // Top 3 CTC
              <SpotlightCard
                key="top3"
                spotlightColor="rgba(34, 197, 94, 0.15)"
                className="px-4 py-5 sm:p-5 bg-green-50 dark:bg-green-900/10 shadow rounded-xl"
              >
                <h3 className="text-sm sm:text-base font-medium mb-3">
                  Top 3 Highest Packages
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  {top3.map((job, idx) => (
                    <div
                      key={job.id}
                      className="px-3 py-2 sm:p-3 rounded-xl bg-white/80 dark:bg-zinc-800 shadow text-xs sm:text-sm"
                    >
                      <h4 className="font-semibold">
                        #{idx + 1} {job.role} at {job.company_name}
                      </h4>
                      <p className="text-green-600 font-bold">₹ {job.ctc}</p>
                    </div>
                  ))}
                </div>
              </SpotlightCard>,

              // Latest Activity
              <SpotlightCard
                key="latest"
                spotlightColor="rgba(59, 130, 246, 0.12)"
                className="px-4 py-5 sm:p-5 bg-blue-50 dark:bg-blue-900/10 shadow rounded-xl"
              >
                <h3 className="text-sm sm:text-base font-medium mb-2">
                  Latest Activity
                </h3>
                <ul className="space-y-1 text-xs sm:text-sm">
                  {latestJobs.map((job) => (
                    <li
                      key={job.id}
                      className="flex justify-between items-center"
                    >
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 mr-1 rounded-full bg-gray-500 dark:bg-gray-400" />
                        <span>
                          Applied to{" "}
                          <span className="font-medium">{job.role}</span> at{" "}
                          <span className="font-medium">
                            {job.company_name}
                          </span>
                        </span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayjs(job.applied_date).fromNow()}
                      </span>
                    </li>
                  ))}
                  {latestJobs.length === 0 && (
                    <li className="italic text-gray-500">
                      No recent activity.
                    </li>
                  )}
                </ul>
              </SpotlightCard>,
            ]}
            className="min-h-[600px]"
            showGradients={false}
            enableArrowNavigation={false}
            displayScrollbar={false}
          />
        </>
      )}

      <footer className="sticky bottom-0 z-40 w-full bg-white/70 dark:bg-black/40 backdrop-blur-md text-center py-0.5 text-[11px] sm:text-sm text-gray-600 dark:text-gray-400">
        <span>© {new Date().getFullYear()} Intern Tracker</span>
      </footer>
    </div>
  );
}
