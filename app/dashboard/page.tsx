"use client";

import { useState, useEffect } from "react";
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


import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/lib/supabaseClient";
import { ConfirmModal } from "@/components/ConfirmModal";
import Dock from "@/components/DockBar";

import OverviewTab from "./OverviewTab";
import ApplicationsTab from "./ApplicationsTab";
import DeadlinesTab from "./DeadlinesTab";
import { Job } from "@/app/types/job";
import { Sun, Moon } from "lucide-react";

const supabase = createClient();

export default function Dashboard() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("overview");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const panelHeight = isMobile ? 35 : 40;
  const baseItemSize = isMobile ? 40 : 45;
  const magnification = isMobile ? 45 : 50;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    if (hour < 21) return "Good evening";
    return "Good night";
  };

  const name = user?.full_name ?? user?.email ?? "there";
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    setHydrated(true);

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

  const dockItems = [
    {
      key: "overview",
      icon: hydrated && <VscHome size={20} />,
      label: "Overview",
      onClick: () => setActiveTab("overview"),
    },
    {
      key: "applications",
      icon: hydrated && <VscArchive size={20} />,
      label: "Applications",
      onClick: () => setActiveTab("applications"),
    },
    {
      key: "deadlines",
      icon: hydrated && <VscCalendar size={20} />,
      label: "Deadlines",
      onClick: () => setActiveTab("deadlines"),
    },
    {
      key: "settings",
      icon: hydrated && <VscSettingsGear size={20} />,
      label: "Settings",
      onClick: () => alert("Coming Soon"),
    },
    {
      key: "theme",
      icon:
        hydrated &&
        (darkMode ? (
          <Sun size={20} className="text-yellow-600" />
        ) : (
          <Moon size={20} className="text-blue-600" />
        )),
      label: darkMode ? "Light Mode" : "Dark Mode",
      onClick: toggleDarkMode,
    },
    {
      key: "logout",
      icon: hydrated && <VscSignOut size={20} className="text-red-400" />,
      label: "Logout",
      onClick: () => setLogoutModalOpen(true),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0d0d0d] text-gray-900 dark:text-gray-100 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-4 flex-1 flex flex-col">
        <header className="sticky z-50 top-0 bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-md w-full transition-all mb-2">
          <div className="w-full max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2">
            {/* Top: Logo+Text and Dock */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              {/* Logo + Text: always in a row */}
              <div className="flex items-center gap-3 justify-center sm:justify-start text-center sm:text-left mr-2">
                <Image
                  src={darkMode ? "/logod.svg" : "/logo.svg"}
                  alt="Intern Tracker Logo"
                  width={48}
                  height={48}
                  priority
                  className="w-8 h-8 pb-1 sm:w-8 sm:h-10"
                />
                <div>
                  <h1 className="text-xl font-semibold tracking-tight ">
                    Intern Tracker
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mt-1 hidden sm:block">
                    Track applications with ease...
                  </p>
                </div>
              </div>

              {/* Dock */}
              <div className="relative z-10 flex items-center justify-center mt-3">
                {hydrated && (
                  <Dock
                    items={dockItems}
                    panelHeight={panelHeight}
                    baseItemSize={baseItemSize}
                    magnification={magnification}
                    activeKey={activeTab}
                  />
                )}
              </div>
            </div>

            {/* Greeting */}
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-center sm:text-left">
              Hello {name}!{" "}
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {greeting}.
              </span>
            </h2>
          </div>
        </header>

        <main className="flex-1 w-full">
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
          {activeTab === "applications" && <ApplicationsTab/>}
          {activeTab === "deadlines" &&
            (user && dataLoaded ? <DeadlinesTab jobs={jobs} onStatusUpdate={handleStatusChange} /> : <DotLoader />)}
        </main>
      </div>

      <ConfirmModal
        open={logoutModalOpen}
        title="Logout"
        message="Are you sure you want to logout?"
        onCancel={() => setLogoutModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
