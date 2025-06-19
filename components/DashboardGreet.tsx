"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  user: { full_name?: string; email?: string };
  jobs: {
    status: string;
    last_date_to_apply?: string | null;
    role?: string;
    company_name?: string;
  }[];
};

const statusColors: Record<string, string> = {
  "to-apply": "#6b7280", // gray-500
  applied: "#3b82f6", // blue-500
  waiting: "#f59e0b", // amber-500
  rejected: "#ef4444", // red-500
  approved: "#22c55e", // green-500
};

export default function DashboardGreeting({ user, jobs }: Props) {
  const name = user?.full_name ?? user?.email ?? "there";

  const [tab, setTab] = useState<"overview" | "deadlines">("overview");
  const [showAllDeadlines, setShowAllDeadlines] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, [jobs]);

  useEffect(() => {
    setShowAllDeadlines(false);
  }, [tab]);

  const deadlineJobs = [...jobs]
    .filter((job) => job.status === "to-apply" && job.last_date_to_apply)
    .sort(
      (a, b) =>
        new Date(a.last_date_to_apply!).getTime() -
        new Date(b.last_date_to_apply!).getTime()
    );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const statusCounts = jobs.reduce((acc: Record<string, number>, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {});

  const maxCount = Math.max(...Object.values(statusCounts), 1);
  const totalCount = Object.values(statusCounts).reduce((sum, v) => sum + v, 0);

  const bars = Object.entries(statusCounts).map(([status, count]) => {
    const color = statusColors[status] || "#94a3b8";
    const widthPercent = (count / maxCount) * 100;
    return { status, count, color, widthPercent };
  });

  return (
    <section
      className="
    max-w-3xl mx-auto p-4 
    rounded-2xl border border-indigo-200 
    shadow-xl 
    bg-gradient-to-br from-indigo-100/90 to-indigo-50/80 
    backdrop-blur-md
  "
    >
      {" "}
      <h2 className="text-xl font-semibold text-black-800 mb-4">
        {greeting}, {name}!
      </h2>
      {/* Tabs */}
      <div className="flex gap-4 mb-4 relative">
        <button
          className={`text-sm px-3 py-1 rounded-full ${
            tab === "overview"
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm"
              : "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
          }`}
          onClick={() => setTab("overview")}
        >
          📊 Overview
        </button>

        <div className="relative">
          <button
            className={`text-sm px-3 py-1 rounded-full ${
              tab === "deadlines"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
            }`}
            onClick={() => setTab("deadlines")}
          >
            ⏳ Deadlines
          </button>
          {deadlineJobs.length > 0 && (
            <span className="absolute -top-0 -right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      </div>
      {/* Content */}
      <div className="flex flex-col gap-4">
        {tab === "overview" && (
          <div className="flex flex-col gap-2 animate-fade-in">
            {bars.map(({ status, count, color, widthPercent }) => (
              <div
                key={status}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span className="w-20 capitalize">{status}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden relative">
                  <div
                    className="h-3 rounded-full absolute left-0 top-0 transition-all duration-700"
                    style={{
                      width: mounted ? `${widthPercent}%` : "0%",
                      backgroundColor: color,
                    }}
                  ></div>
                </div>
                <span className="w-6 text-right font-semibold text-gray-800">
                  {count}
                </span>
              </div>
            ))}

            {/* Total applications */}
            <div className="mt-4 text-center text-gray-700 font-medium">
              Total Applications:{" "}
              <span className="font-semibold">{totalCount}</span>
            </div>
          </div>
        )}

        {tab === "deadlines" && (
          <div className="bg-white p-4 rounded-lg shadow-inner animate-fade-in">
            {deadlineJobs.length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming deadlines 🎉</p>
            ) : (
              <>
                <ul className="space-y-3 text-sm">
                  {deadlineJobs
                    .slice(0, showAllDeadlines ? deadlineJobs.length : 2)
                    .map((job, i) => (
                      <li
                        key={i}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <p className="font-semibold text-indigo-800">
                            {job.role}
                          </p>
                          <p className="text-gray-600">{job.company_name}</p>
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap">
                          <span className="text-black">
                            {new Date(
                              job.last_date_to_apply!
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>{" "}
                          <span className="text-red-600">
                            {(() => {
                              const date = new Date(job.last_date_to_apply!);
                              const now = new Date();
                              now.setHours(0, 0, 0, 0);
                              const dueDate = new Date(date);
                              dueDate.setHours(0, 0, 0, 0);

                              const diffDays = Math.ceil(
                                (dueDate.getTime() - now.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              );

                              if (diffDays > 0) {
                                return `(${diffDays} day${
                                  diffDays > 1 ? "s" : ""
                                } left)`;
                              } else if (diffDays === 0) {
                                return `(Today)`;
                              } else {
                                return `(Past Due)`;
                              }
                            })()}
                          </span>
                        </p>
                      </li>
                    ))}
                </ul>

                {deadlineJobs.length > 2 && (
                  <button
                    onClick={() => setShowAllDeadlines(!showAllDeadlines)}
                    className="mt-2 flex items-center gap-1 text-indigo-600 text-sm"
                  >
                    {showAllDeadlines ? "Show less" : "Show more"}
                    {showAllDeadlines ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
