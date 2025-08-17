"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  VscHome,
  VscArchive,
  VscCalendar,
  VscSettingsGear,
  VscSignOut,
} from "react-icons/vsc";
import confetti from "canvas-confetti";
import { Sun, Moon } from "lucide-react";
import { Menu } from "lucide-react"; // Add hamburger icon

import { createClient } from "@/lib/supabaseClient";
import { ConfirmModal } from "@/components/ConfirmModal";

import OverviewTab from "./OverviewTab";
import ApplicationsTab from "./ApplicationsTab";
import DeadlinesTab from "./DeadlinesTab";
import { Job } from "@/app/types/job";

const supabase = createClient();

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = user?.full_name ?? user?.email ?? "there";

  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    await supabase
      .from("job_applications")
      .update({ status: newStatus })
      .eq("id", jobId);
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    if (newStatus === "approved") {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
  };

  useEffect(() => {
    const fetchUserAndJobs = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) return;

      setUser({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name,
      });

      const { data: jobsData, error: jobsError } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!jobsError && jobsData) {
        setJobs(jobsData as Job[]);
        setDataLoaded(true);
      }
    };

    fetchUserAndJobs();
  }, [activeTab]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const DotLoader = () => (
    <>
      <style jsx>{`
        @keyframes soft-bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <div className="w-full h-[60vh] flex items-center justify-center">
        <div className="flex space-x-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-violet-300 dark:bg-violet-500"
              style={{
                animation: "soft-bounce 1.2s ease-in-out infinite",
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    </>
  );

  // Tab bar items config (main tabs only)
  const tabItems = [
    {
      key: "overview",
      icon: <VscHome size={22} />,
      label: "Overview",
    },
    {
      key: "applications",
      icon: <VscArchive size={22} />,
      label: "Applications",
    },
    {
      key: "deadlines",
      icon: <VscCalendar size={22} />,
      label: "Deadlines",
    },
  ];

  // Menu items config
  const menuItems = [
    {
      key: "settings",
      icon: <VscSettingsGear size={18} />,
      label: "Settings",
      action: () => alert("Coming Soon"),
    },
    {
      key: "theme",
      icon: darkMode ? (
        <Sun size={18} className="text-yellow-600" />
      ) : (
        <Moon size={18} className="text-blue-600" />
      ),
      label: darkMode ? "Light Mode" : "Dark Mode",
      action: toggleDarkMode,
    },
    {
      key: "logout",
      icon: <VscSignOut size={18} className="text-red-400" />,
      label: "Logout",
      action: () => setLogoutModalOpen(true),
    },
  ];

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 flex-1 flex flex-col">
        <header className="sticky z-10 top-0 bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-md w-full transition-all">
          <div className="w-full sm:px-4 md:px-4 space-y-2.5 sm:space-y-3 mt-2 sm:mt-2">
            {/* Logo, Name, and Greeting */}
            <div className="flex flex-row items-center justify-between gap-2 w-full">
              {/* Logo + Name: left side */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Image
                  src={darkMode ? "/logod.svg" : "/logo.svg"}
                  alt="Intern Tracker Logo"
                  width={28}
                  height={28}
                  priority
                  className="w-7 h-7 sm:w-10 sm:h-10"
                />
                <div className="flex flex-col">
                  <h1 className="text-l md:text-l font-semibold tracking-tight text-left">
                    Intern Tracker
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight text-left">
                    Track applications with ease...
                  </p>
                </div>
              </div>
              {/* User Greeting: right side */}
              <div className="flex flex-col items-end">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Hello!
                </span>
                <span className="text-l md:text-xl font-semibold text-right break-words">
                  {name}
                </span>
              </div>
            </div>
            <div className="w-full h-[1px] bg-gray-200 dark:bg-neutral-800" />

            {/* Sleek Horizontal Tab Bar */}
            <div className="w-full flex items-center justify-between px-1">
              <nav className="flex items-center gap-1 flex-1">
                {tabItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={`flex items-center px-2.5 py-1.5 rounded-lg transition-all duration-300
                      ${
                        activeTab === item.key
                          ? "bg-violet-100 dark:bg-violet-900 shadow text-violet-700 dark:text-violet-100"
                          : "hover:bg-gray-100 dark:hover:bg-neutral-800"
                      }
                    `}
                  >
                    <span>{item.icon}</span>
                    {/* Always show label next to icon */}
                    <span
                      className={`ml-2 text-xs sm:text-sm font-medium transition-all duration-300`}
                      style={{
                        minWidth: "60px",
                        display: "inline-block",
                        transitionProperty: "opacity, min-width, margin-left",
                      }}
                    >
                      {item.label}
                    </span>
                  </button>
                ))}
              </nav>
              {/* Menu on right side */}
              <div className="relative ml-2" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center justify-center px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-neutral-900 rounded-lg shadow-lg border border-gray-100 dark:border-neutral-800 z-50">
                    {menuItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          item.action();
                          setMenuOpen(false);
                        }}
                        className="w-full flex items-center px-3 py-1.5 gap-2 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition"
                      >
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Horizontal line below nav bar */}
            <div className="w-full h-[1px] bg-gray-200 dark:bg-neutral-800 mb-1" />
          </div>
        </header>

        {/* Tab content with smooth animation */}
        <main className="flex-1 w-full transition-all duration-300 relative z-0 pt-2 sm:pt-4">
          <div
            key={activeTab}
            className="tab-content-animate"
            style={{
              minHeight: "60vh",
              position: "relative",
            }}
          >
            {activeTab === "overview" &&
              (user && dataLoaded ? (
                <OverviewTab
                  user={user}
                  jobs={jobs}
                  setActiveTab={setActiveTab}
                />
              ) : (
                <DotLoader />
              ))}
            {activeTab === "applications" && <ApplicationsTab />}
            {activeTab === "deadlines" &&
              (user && dataLoaded ? (
                <DeadlinesTab jobs={jobs} onStatusUpdate={handleStatusChange} />
              ) : (
                <DotLoader />
              ))}
          </div>
        </main>
      </div>

      <ConfirmModal
        open={logoutModalOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />

      {/* Fade-in and slide animation for tab content */}
      <style jsx global>{`
        .tab-content-animate {
          animation: tabfadein 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes tabfadein {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
