"use client";

import { Job } from "@/app/types/job";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import JobFormDialog from "@/components/JobFormDialog";
import JobTile from "@/components/JobTile";
import DashboardGreeting from "@/components/DashboardGreet";
import { ConfirmModal } from "@/components/ConfirmModal";
import confetti from "canvas-confetti";

export default function Dashboard() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [ctc, setCtc] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState("to-apply");
  const [lastDateToApply, setLastDateToApply] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [examDate, setExamDate] = useState("");
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    action: "delete" | "duplicate" | "logout" | null;
    job: Job | null;
  }>({ action: null, job: null });
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [logoRefreshKey, setLogoRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredJobs = jobs.filter(
    (job) =>
      job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const closeModal = () => setConfirmModal({ action: null, job: null });

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  function launchConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  const handleConfirm = () => {
    if (!confirmModal.job) return;
    if (confirmModal.action === "delete") {
      handleDelete(confirmModal.job.id);
    } else if (confirmModal.action === "duplicate") {
      handleDuplicate(confirmModal.job);
    }
    closeModal();
  };

  const toggleExpand = (id: string) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  const handleEditClick = (job: Job) => {
    setEditJobId(job.id);
    setCompanyName(job.company_name);
    setRole(job.role);
    setCtc(job.ctc);
    setRequirements(job.requirements || "");
    setStatus(job.status);
    setLastDateToApply(job.last_date_to_apply || "");
    setAppliedDate(job.applied_date || "");
    setExamDate(job.exam_date || "");
    setModalOpen(true);
  };

  const handleAddOrUpdateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (editJobId) {
      const { error } = await supabase
        .from("job_applications")
        .update({
          company_name: companyName,
          role,
          ctc,
          requirements: requirements || null,
          status,
          last_date_to_apply: lastDateToApply || null,
          applied_date: appliedDate || null,
          exam_date: examDate || null,
        })
        .eq("id", editJobId);

      if (!error) {
        setJobs((prev) =>
          prev.map((job) =>
            job.id === editJobId
              ? {
                  ...job,
                  company_name: companyName,
                  role,
                  ctc,
                  requirements,
                  status,
                  last_date_to_apply: lastDateToApply,
                  applied_date: appliedDate,
                  exam_date: examDate,
                }
              : job
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from("job_applications")
        .insert({
          company_name: companyName,
          role,
          ctc,
          requirements: requirements || null,
          status,
          last_date_to_apply: lastDateToApply || null,
          applied_date: appliedDate || null,
          exam_date: examDate || null,
          user_id: user.id,
        })
        .select();

      if (!error && data) {
        const newJobs = Array.isArray(data) ? data : [data];
        setJobs((prev) => [...newJobs, ...prev]);
      }
    }

    // Reset form state
    setCompanyName("");
    setRole("");
    setCtc("");
    setRequirements("");
    setStatus("to-apply");
    setLastDateToApply("");
    setAppliedDate("");
    setExamDate("");
    setEditJobId(null);
    setModalOpen(false);

    setLogoRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const getSessionAndFetchJobs = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.push("/");
        return;
      }

      const currentUser = session.user;
      setUser({
        id: currentUser.id,
        email: currentUser.email ?? "",
        full_name: (currentUser.user_metadata as { full_name?: string })
          ?.full_name,
      });

      const { data: jobsData } = await supabase
        .from("job_applications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      setJobs(jobsData ?? []);
      setLoading(false);
    };

    getSessionAndFetchJobs();
  }, [supabase, router]);

  async function handleDuplicate(jobToDuplicate: Job) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, ...rest } = jobToDuplicate; // remove id and created_at so DB can assign new ones

      // Prepare the new job object, you can reset status or dates if needed
      const newJob = {
        ...rest,
        status: "to-apply", // for example, reset status
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("job_applications")
        .insert([newJob])
        .select()
        .single();

      if (error) throw error;

      // Update your local state with the new job record from DB
      setJobs((prevJobs) => [data, ...prevJobs]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to duplicate job:", error.message);
      } else {
        console.error("Failed to duplicate job:", error);
      }
    }
  }

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
      launchConfetti(); // Call your confetti function here
    }
  };

  const handleDelete = async (jobId: string) => {
    await supabase.from("job_applications").delete().eq("id", jobId);
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-violet-300/90 rounded-full animate-bounce [animation-delay:-0.45s]"></div>
          <div className="w-4 h-4 bg-violet-300/90 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-4 h-4 bg-violet-300/90 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-4 h-4 bg-violet-300/90 rounded-full animate-bounce"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <ConfirmModal
        open={!!confirmModal.action && confirmModal.action !== "logout"}
        title={
          confirmModal.action === "delete"
            ? "Confirm Delete"
            : confirmModal.action === "duplicate"
            ? "Confirm Duplicate"
            : ""
        }
        message={
          confirmModal.action === "delete"
            ? "Are you sure you want to delete this application?"
            : confirmModal.action === "duplicate"
            ? "Do you want to duplicate this application?"
            : ""
        }
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />

      <main className="flex-grow">
        {/* Sticky block for mobile */}
        <div className="md:hidden sticky top-0 z-30 bg-white w-full">
          <div className="px-4 pt-3 pb-1 flex flex-col gap-2">
            {user && <DashboardGreeting user={user} jobs={jobs} />}

            <div className="flex justify-between items-center pt-2 pb-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Applications
                </h2>

                {/* Search Icon */}
                <button
                  onClick={() => setShowMobileSearch(true)}
                  className="p-1 text-gray-600 rounded-md hover:bg-gray-100 "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                </button>
              </div>

              {/* Add Job Button */}
              <JobFormDialog
                modalOpen={modalOpen}
                setModalOpen={setModalOpen}
                handleAddOrUpdateJob={handleAddOrUpdateJob}
                editJobId={editJobId}
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
            </div>

            {/* Mobile Search Box — toggled below Applications bar */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                showMobileSearch
                  ? "max-h-20 opacity-100 scale-100 pb-2"
                  : "max-h-0 opacity-0 scale-95"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-300 focus:border-violet-300 text-sm"
                />
                <button
                  onClick={() => {
                    setShowMobileSearch(false);
                    setSearchTerm("");
                  }}
                  className="p-2 text-gray-600 rounded-md hover:bg-gray-100 border border-gray-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="w-full flex flex-col md:flex-row md:items-start md:gap-6 md:px-8 px-4">
          {/* Left: Dashboard Greet on desktop */}
          <div className="hidden md:block md:w-1/3 md:py-1 sticky top-4 self-start z-30">
            {user && <DashboardGreeting user={user} jobs={jobs} />}
          </div>

          {/* Right: Applications + Job Tiles */}
          <div className="w-full md:w-2/3 flex flex-col gap-4 md:pt-0">
            <div className="hidden md:block sticky top-0 z-20 bg-white">
              <div className="flex justify-between items-center pt-3 px-4 md:px-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Applications
                </h2>
                <JobFormDialog
                  modalOpen={modalOpen}
                  setModalOpen={setModalOpen}
                  handleAddOrUpdateJob={handleAddOrUpdateJob}
                  editJobId={editJobId}
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
              </div>

              {/* Desktop Search Box */}
              <div className="px-4 md:px-6 py-3">
                <input
                  type="text"
                  placeholder="Search by company or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-300 focus:border-violet-300 text-sm"
                />
              </div>
            </div>

            {/* Job Tiles */}
            <div className="flex flex-col gap-4 pb-2 md:pb-2">
              {filteredJobs.map((job) => (
                <JobTile
                  key={job.id}
                  job={job}
                  expandedJobId={expandedJobId}
                  onToggleExpand={toggleExpand}
                  onEditClick={handleEditClick}
                  onStatusChange={handleStatusChange}
                  onConfirmDelete={(job) =>
                    setConfirmModal({ action: "delete", job })
                  }
                  onConfirmDuplicate={(job) =>
                    setConfirmModal({ action: "duplicate", job })
                  }
                  logoRefreshKey={logoRefreshKey}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="sticky bottom-0 z-40 w-full bg-white/70 backdrop-blur-md border-t text-center py-1 text-sm text-gray-600">
        <span>© {new Date().getFullYear()} Intern Tracker</span>
      </footer>
    </div>
  );
}
