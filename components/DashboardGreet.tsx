"use client";

import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Home } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ConfirmModal";

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
  "to-apply": "#6b7280",
  applied: "#3b82f6",
  waiting: "#f59e0b",
  rejected: "#ef4444",
  approved: "#22c55e",
};

export default function DashboardGreeting({ user, jobs }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const name = user?.full_name ?? user?.email ?? "there";

  const [tab, setTab] = useState<"overview" | "deadlines">("overview");
  const [showAllDeadlines, setShowAllDeadlines] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBars, setShowBars] = useState(true);

  const handleLogoutClick = () => setShowModal(true);
  const handleCancel = () => setShowModal(false);

  const handleConfirmlogout = async () => {
    setShowModal(false);
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/");
    }
  };

  useEffect(() => {
  const checkDesktop = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setShowAllDeadlines(true);  // always expanded on desktop
    } else {
      setShowAllDeadlines(false); // mobile → collapsed by default
    }
  };

  checkDesktop(); // on mount

  window.addEventListener("resize", checkDesktop);
  return () => window.removeEventListener("resize", checkDesktop);
}, []);

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

  const overviewContent = () => (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-2 min-h-[28px]">
        <div className="text-center text-gray-700 font-medium">
          Total Applications:{" "}
          <span className="font-semibold">{totalCount}</span>
        </div>
        <button
          onClick={() => setShowBars((prev) => !prev)}
          className="text-gray-700 hover:text-black flex items-center gap-1 text-sm"
        >
          {showBars ? (
            <>
              Hide <ChevronUp size={16} />
            </>
          ) : (
            <>
              Show <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: showBars ? "auto" : 0,
          opacity: showBars ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="overflow-hidden flex flex-col gap-1.5 mx-3"
      >
        {bars.map(({ status, count, color, widthPercent }) => (
          <div
            key={status}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <span className="w-20 capitalize">{status}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden relative">
              <motion.div
                initial={false}
                animate={{
                  width: mounted ? `${widthPercent}%` : "0%",
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-3 rounded-full absolute left-0 top-0"
                style={{ backgroundColor: color }}
              ></motion.div>
            </div>
            <span className="w-6 text-right font-semibold text-gray-800">
              {count}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );

  const deadlinesContent = () => (
    <div className="bg-white p-4 rounded-lg shadow-inner">
      {deadlineJobs.length === 0 ? (
        <p className="text-gray-500 text-sm">No upcoming deadlines 🎉</p>
      ) : (
        <>
          <motion.div
            initial={false}
            animate={{
              height: showAllDeadlines ? "auto" : "7rem",
              opacity: 1,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ overflow: "hidden", willChange: "height" }}
          >
            <ul className="space-y-3 text-sm">
              {deadlineJobs.map((job, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-semibold text-indigo-800">{job.company_name}</p>
                    <p className="text-gray-600">{job.role}</p>
                  </div>
                  <p className="text-sm font-medium whitespace-nowrap text-center">
                    <span className="text-black">
                      {new Date(job.last_date_to_apply!).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>{" "}
                    <br />
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
          </motion.div>

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
  );

  return (
    <motion.section
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      className="
        w-full md:max-w-3xl md:mx-auto p-3 
        rounded-2xl
        shadow-xl 
        bg-gradient-to-br from-violet-100/90 to-violet-50/80
        backdrop-blur-md
      "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-black-800">Hello {name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={handleLogoutClick}>
            Logout
          </Button>
          <ConfirmModal
            open={showModal}
            title="Confirm Logout"
            message="Are you sure you want to logout?"
            onConfirm={handleConfirmlogout}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {/* Tabs - Mobile only */}
      <div className="flex gap-4 mb-3 relative md:hidden">
        <button
          className={`text-sm px-3 py-1 rounded-full ${
            tab === "overview"
              ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm"
              : "bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200"
          }`}
          onClick={() => setTab("overview")}
        >
          Overview
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
            Deadlines
          </button>
          {deadlineJobs.length > 0 && (
            <span className="absolute -top-0 -right-0 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="block md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col gap-4"
          >
            {tab === "overview" && overviewContent()}
            {tab === "deadlines" && deadlinesContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop - show both */}
      <div className="hidden md:flex flex-col gap-4">
        {overviewContent()}
        {deadlinesContent()}
      </div>
    </motion.section>
  );
}
