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

import { useIsMobile } from "@/hooks/use-mobile";
import { createClient } from "@/lib/supabaseClient";
import { ConfirmModal } from "@/components/ConfirmModal";
import Dock from "@/components/DockBar";

import OverviewTab from "./OverviewTab";
import ApplicationsTab from "./ApplicationsTab";
import DeadlinesTab from "./DeadlinesTab";
import { Job } from "@/app/types/job";

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

  const [jobs, setJobs] = useState<Job[]>([]);
  const [hydrated, setHydrated] = useState(false); // 👈 hydration state
  const [dataLoaded, setDataLoaded] = useState(false); // 👈 avoid showing "0" apps on first render

  const panelHeight = isMobile ? 35 : 45;
  const baseItemSize = isMobile ? 40 : 52;
  const magnification = isMobile ? 45 : 60;

  // Ensure hydration before rendering icons (fix icon flicker)
  useEffect(() => {
    setHydrated(true);
  }, []);

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
        setDataLoaded(true); // ✅ jobs fetched
      }
    };

    fetchUserAndJobs();
  }, []);

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
              className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-violet-300"
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
      icon: hydrated && <VscHome size={20} />, // ✅ hydrate-safe
      label: "Overview",
      onClick: () => setActiveTab("overview"),
    },
    {
      icon: hydrated && <VscArchive size={20} />,
      label: "Applications",
      onClick: () => setActiveTab("applications"),
    },
    {
      icon: hydrated && <VscCalendar size={20} />,
      label: "Deadlines",
      onClick: () => setActiveTab("deadlines"),
    },
    {
      icon: hydrated && <VscSettingsGear size={20} />,
      label: "Settings",
      onClick: () => alert("Coming Soon"),
    },
    {
      icon: hydrated && <VscSignOut size={20} className="text-red-500" />,
      label: "Logout",
      onClick: () => setLogoutModalOpen(true),
      className: "hover:bg-red-100",
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky z-100 top-0 bg-white/90 backdrop-blur-md py-3 px-4 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-2 transition-all">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.svg"
            alt="Intern Tracker Logo"
            width={48}
            height={48}
            priority
            className="sm:w-8 sm:h-10 w-10 h-10 pb-2"
          />
          <h1 className="text-xl font-semibold tracking-tight text-gray-800">
            Intern Tracker
          </h1>
        </div>
        <div className="relative z-10 flex items-center justify-center mt-2 mb-3 h-[90px]">
          {hydrated && (
            <Dock
              items={dockItems}
              panelHeight={panelHeight}
              baseItemSize={baseItemSize}
              magnification={magnification}
            />
          )}
        </div>
      </header>

      <main className="flex-1 px-4">
        {activeTab === "overview" &&
          (user && dataLoaded ? (
            <OverviewTab user={user} jobs={jobs} />
          ) : (
            <DotLoader />
          ))}
        {activeTab === "applications" && <ApplicationsTab />}
        {activeTab === "deadlines" && <DeadlinesTab />}
      </main>

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
