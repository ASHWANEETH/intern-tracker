"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";

import Dock from "@/components/DockBar";
import { ConfirmModal } from "@/components/ConfirmModal";
import OverviewTab from "./OverviewTab";
import ApplicationsTab from "./ApplicationsTab";
import DeadlinesTab from "./DeadlinesTab";

const supabase = createClient();

export default function Dashboard() {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [activeTab, setActiveTab] = useState("overview");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const panelHeight = isMobile ? 35 : 45;
  const baseItemSize = isMobile ? 40 : 52;
  const magnification = isMobile ? 45 : 60;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const dockItems = [
    {
      icon: <VscHome size={20} />,
      label: "Overview",
      onClick: () => setActiveTab("overview"),
    },
    {
      icon: <VscArchive size={20} />,
      label: "Applications",
      onClick: () => setActiveTab("applications"),
    },
    {
      icon: <VscCalendar size={20} />,
      label: "Deadlines",
      onClick: () => setActiveTab("deadlines"),
    },
    {
      icon: <VscSettingsGear size={20} />,
      label: "Settings",
      onClick: () => alert("Coming Soon"),
    },
    ...(isMobile
      ? [
          {
            icon: <VscSignOut size={20} className="text-red-500" />,
            label: "Logout",
            onClick: () => setLogoutModalOpen(true),
            className: "hover:bg-red-100",
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md py-3 px-4 w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-2 transition-all">
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

        {!isMobile && (
          <Button
            onClick={() => setLogoutModalOpen(true)}
            className="hover:bg-red-100 hover:text-black"
          >
            <VscSignOut size={18} />
          </Button>
        )}
      </header>

      <div className="relative z-10 flex items-center justify-center mt-2 mb-3 h-[90px]">
        <Dock
          items={dockItems}
          panelHeight={panelHeight}
          baseItemSize={baseItemSize}
          magnification={magnification}
        />
      </div>

      <main className="flex-1 px-4">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "applications" && <ApplicationsTab />}
        {activeTab === "deadlines" && <DeadlinesTab />}
      </main>

      {/* Confirm Logout Modal */}
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
