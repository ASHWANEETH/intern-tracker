"use client";

import { Job } from "@/app/types/job";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import JobFormDialog from "@/components/JobFormDialog";
import JobTile from "@/components/JobTile";
import { ConfirmModal } from "@/components/ConfirmModal";
import confetti from "canvas-confetti";
import Image from "next/image";
import AnimatedList from "@/components/reactbits/AnimatedList";

export default function ApplicationsTab() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<{
    id: string;
    email: string;
    full_name?: string;
  } | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [ctc, setCtc] = useState("");
  const [requirements, setRequirements] = useState("");
  const [status, setStatus] = useState("to-apply");
  const [lastDateToApply, setLastDateToApply] = useState("");
  const [appliedDate, setAppliedDate] = useState("");
  const [examDate, setExamDate] = useState("");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [logoRefreshKey, setLogoRefreshKey] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{
    action: "delete" | "duplicate" | null;
    job: Job | null;
  }>({ action: null, job: null });

  const filteredJobs = jobs.filter((job) =>
    [job.company_name, job.role]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
      await supabase
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
    } else {
      const { data } = await supabase
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

      if (data) {
        const newJobs = Array.isArray(data) ? data : [data];
        setJobs((prev) => [...newJobs, ...prev]);
      }
    }

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

  const handleDelete = async (jobId: string) => {
    await supabase.from("job_applications").delete().eq("id", jobId);
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  const handleDuplicate = async (job: Job) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at, ...rest } = job;
    const { data } = await supabase
      .from("job_applications")
      .insert({
        ...rest,
        status: "to-apply",
        user_id: user?.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (data) {
      setJobs((prev) => [data, ...prev]);
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

  const toggleExpand = (id: string) => {
    setExpandedJobId((prev) => (prev === id ? null : id));
  };

  const closeModal = () => setConfirmModal({ action: null, job: null });

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
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-x-2 flex">
          <div className="w-4 h-4 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.45s]" />
          <div className="w-4 h-4 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-4 h-4 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-4 h-4 bg-violet-400 rounded-full animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full sm:px-4 md:px-4 md:mt-0 mt-0 sm:mt-0 text-gray-800 dark:text-gray-100">
      <ConfirmModal
        open={!!confirmModal.action}
        title={
          confirmModal.action === "delete"
            ? "Confirm Delete"
            : "Confirm Duplicate"
        }
        message={
          confirmModal.action === "delete"
            ? "Are you sure you want to delete this application?"
            : "Do you want to duplicate this application?"
        }
        onConfirm={() => {
          if (confirmModal.action === "delete" && confirmModal.job)
            handleDelete(confirmModal.job.id);
          if (confirmModal.action === "duplicate" && confirmModal.job)
            handleDuplicate(confirmModal.job);
          closeModal();
        }}
        onCancel={closeModal}
      />

      <div className="sticky md:top-32.3 md:pt-1 sm:top-31.5 top-30 z-10 pb-3 sm:pb-4 bg-white/90 dark:bg-[#0d0d0d]/90 backdrop-blur-md">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3 px-1">
          <h2 className="text-xl sm:text-xl font-semibold">Applications</h2>
          <JobFormDialog
            modalOpen={modalOpen}
            setModalOpen={setModalOpen}
            handleAddOrUpdateJob={handleAddOrUpdateJob}
            editJobId={editJobId}
            setEditJobId={setEditJobId}
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

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search by company or role..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm dark:text-white"
        />
      </div>

      {/* Animated Job List */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-4">
        {filteredJobs.length > 0 ? (
          <AnimatedList
            items={filteredJobs.map((job) => (
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
            className="min-h-[600px]"
            showGradients={false}
            enableArrowNavigation={false}
            displayScrollbar={false}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-20 space-y-6">
            <Image
              src="/emptypage.svg"
              alt="Empty state"
              width={240}
              height={240}
              className="opacity-70 dark:opacity-50"
              priority
            />
            <p className="text-sm sm:text-base font-medium">
              No applications yet — let&apos;s change that! 🚀
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Hit &quot;Add New +&quot; to begin tracking your journey.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
