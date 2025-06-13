"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Props = {
  user: { full_name?: string; email?: string };
  jobs: {
    status: string;
    last_date_to_apply?: string | null; // 👈 allow null
    role?: string;
    company_name?: string;
  }[];
};

const statusColors: Record<string, string> = {
  "to-apply": "#f97316", // orange
  applied: "#22c55e", // green
  waiting: "#eab308", // yellow
  rejected: "#ef4444", // red
  approved: "#3b82f6", // blue
};

export default function DashboardGreeting({ user, jobs }: Props) {
  const name = user?.full_name ?? user?.email ?? "there";

  const [tab, setTab] = useState<"overview" | "deadlines">("overview");
  const [showAllDeadlines, setShowAllDeadlines] = useState(false);

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

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  function polarToCartesian(x: number, y: number, r: number, angle: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: x + r * Math.cos(rad),
      y: y + r * Math.sin(rad),
    };
  }

  function describeArc(
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number
  ) {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      x,
      y,
      "Z",
    ].join(" ");
  }

  let startAngle = 0;
  const arcs = Object.entries(statusCounts).map(([status, count]) => {
    const angle = (count / total) * 360;
    const path = describeArc(50, 50, 40, startAngle, startAngle + angle);
    const color = statusColors[status] || "#94a3b8"; // slate fallback
    startAngle += angle;
    return { status, count, path, color };
  });

  return (
    <section className="bg-indigo-50 p-6 rounded-lg max-w-3xl mx-auto">
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

      {/* Tab content */}
      {tab === "overview" ? (
        <div className="flex items-center gap-6 flex-wrap">
          {/* Donut chart */}
          <svg
            width={100}
            height={100}
            viewBox="0 0 100 100"
            className="rounded-full bg-white shadow"
          >
            <circle cx={50} cy={50} r={40} fill="#e5e7eb" />
            {arcs.map(({ path, color }, i) => (
              <path key={i} d={path} fill={color} />
            ))}
            <circle cx={50} cy={50} r={25} fill="#fff" />
            <text
              x="50"
              y="54"
              textAnchor="middle"
              fontSize="20"
              fill="#4b5563"
              fontWeight="700"
            >
              {total}
            </text>
          </svg>

          {/* Legend */}
          <div className="flex flex-col gap-1 text-sm text-indigo-900">
            {arcs.map(({ status, count, color }) => (
              <p key={status} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></span>
                <span className="capitalize">{status}</span>:&nbsp;
                <span className="font-semibold">{count}</span>
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-inner">
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
                      <p className="text-red-600 text-sm font-medium whitespace-nowrap">
                        {new Date(job.last_date_to_apply!).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
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
    </section>
  );
}
