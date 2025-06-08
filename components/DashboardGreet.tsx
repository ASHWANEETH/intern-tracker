"use client";

import React from "react";

type Props = {
  user: { full_name?: string; email?: string };
  jobs: { status: string }[];
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
      <h2 className="text-xl font-semibold text-black-800 mb-3">
        &nbsp;{greeting}, {name} !
      </h2>

      <div className="flex items-center gap-6 flex-wrap">
        {/* Donut chart */}
        <svg
          width={100}
          height={100}
          viewBox="0 0 100 100"
          className="rounded-full bg-white shadow"
          role="img"
          aria-label="Applications status chart"
        >
          <circle cx={50} cy={50} r={40} fill="#e5e7eb" /> {/* bg circle */}
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
    </section>
  );
}
