"use client";

import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Job } from "@/app/types/job";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

type Props = {
  user: { full_name?: string; email?: string };
  jobs: Job[];
};

const statusColors: Record<string, string> = {
  "to-apply": "#81858d",
  applied: "#4f8ff7",
  waiting: "#f7aa23",
  rejected: "#f25454",
  approved: "#32cc6e",
};

export default function OverviewTab({ user, jobs }: Props) {
  const name = user?.full_name ?? user?.email ?? "there";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [jobs]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

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
    const numeric = parseFloat(ctc.replace(/[^\d.]/g, ""));
    return isNaN(numeric) ? 0 : numeric;
  };

  const sortedByCTC = [...jobs]
    .filter((job) => job.ctc)
    .sort((a, b) => getCTCValue(b.ctc) - getCTCValue(a.ctc));

  const top3 = sortedByCTC.slice(0, 3);

  const latestJobs = [...jobs]
    .filter((j) => j.applied_date)
    .sort(
      (a, b) =>
        new Date(b.applied_date!).getTime() -
        new Date(a.applied_date!).getTime()
    )
    .slice(0, 3);

  const upcomingDeadlines = [...jobs]
    .filter((j) => j.last_date_to_apply)
    .sort(
      (a, b) =>
        new Date(a.last_date_to_apply!).getTime() -
        new Date(b.last_date_to_apply!).getTime()
    )
    .slice(0, 3);

  return (
    <div className="w-full md:max-w-5xl md:mx-auto space-y-8 px-4">
      {/* Greeting outside */}
      <h2 className="text-2xl md:text-3xl font-semibold text-black text-center md:text-left">
        Hello {name}!{" "}
        <span className="text-base text-gray-600">{getGreeting()}.</span>
      </h2>

      {jobs.length === 0 ? (
        <div className="text-center text-gray-500 py-10 bg-white/60 shadow-xl rounded-xl p-6 backdrop-blur-md">
          <p className="text-lg">No job applications yet. Start applying!</p>
        </div>
      ) : (
        <>
          {/* Bar & Pie Chart */}
          <div className="bg-white/60 p-6 rounded-2xl shadow-lg backdrop-blur-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-800">
                Application Status
              </h3>
              <p className="text-sm text-gray-600">
                Total Applications:{" "}
                <span className="font-semibold">{jobs.length}</span>
              </p>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Bar Chart */}
              <div className="flex-1 space-y-2">
                {bars.map(({ status, count, color, widthPercent }) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <span className="w-24 capitalize">{status}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden relative">
                      <div
                        className="h-3 rounded-full absolute left-0 top-0 transition-all duration-700 ease-out"
                        style={{
                          width: mounted ? `${widthPercent}%` : "0%",
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right font-semibold text-gray-800">
                      {count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pie Chart (hidden on mobile) */}
              <div className="hidden md:block w-[250px] h-64">
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
                        isAnimationActive
                        animationDuration={800}
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
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white/60 p-6 rounded-2xl shadow-lg backdrop-blur-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Upcoming Deadlines
            </h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {upcomingDeadlines.map((job) => (
                <li key={job.id} className="flex justify-between">
                  <span>
                    📅 {job.role} at {job.company_name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {dayjs(job.last_date_to_apply).format("MMM D")}
                  </span>
                </li>
              ))}
              {upcomingDeadlines.length === 0 && (
                <li className="text-gray-500 italic">No upcoming deadlines.</li>
              )}
            </ul>
            <a
              href="#"
              className="text-sm text-violet-700 hover:underline font-medium"
            >
              Show all deadlines →
            </a>
          </div>

          {/* Top 3 Highest Packages */}
          <div className="bg-white/60 p-6 rounded-2xl shadow-lg backdrop-blur-md">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Top 3 Highest Packages
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              {top3.map((job, index) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-white/70 shadow space-y-1"
                >
                  <h4 className="text-sm font-semibold text-gray-700">
                    #{index + 1} {job.role} at {job.company_name}
                  </h4>
                  <p className="text-green-600 font-bold text-sm">
                    ₹ {job.ctc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Activity */}
          <div className="bg-white/60 p-6 rounded-2xl shadow-lg backdrop-blur-md">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Latest Activity
            </h3>
            <ul className="space-y-1 text-sm text-gray-700">
              {latestJobs.map((job) => (
                <li key={job.id} className="flex justify-between items-center">
                  <span>
                    ✅ Applied to{" "}
                    <span className="font-medium">{job.role}</span> at{" "}
                    <span className="font-medium">{job.company_name}</span>
                  </span>
                  <span className="text-gray-500 text-xs">
                    {dayjs(job.applied_date).fromNow()}
                  </span>
                </li>
              ))}
              {latestJobs.length === 0 && (
                <li className="text-gray-500 italic">No recent activity.</li>
              )}
            </ul>
          </div>
        </>
      )}

      <footer className="sticky bottom-0 z-40 w-full bg-white/70 backdrop-blur-md border-t text-center py-1 text-sm text-gray-600">
        <span>© {new Date().getFullYear()} Intern Tracker</span>
      </footer>
    </div>
  );
}
