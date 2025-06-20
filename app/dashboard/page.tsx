"use client";

import { Job } from "@/app/types/job";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JobTile from "@/components/JobTile";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DashboardGreeting from "@/components/DashboardGreet";
import { ConfirmModal } from "@/components/ConfirmModal";
import confetti from "canvas-confetti";
// import FooterWithModals from "@/components/Footer";

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

  const closeModal = () => setConfirmModal({ action: null, job: null });

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
      <div className="flex items-center justify-center p-6">
        <svg
          className="animate-spin h-6 w-6 text-blue-600 mr-2"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span>Loading...</span>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="px-4 max-w-3xl mx-auto">
          <div className="sticky top-0 pt-2 z-50 bg-white">
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

            {user && <DashboardGreeting user={user} jobs={jobs} />}

            <div className="flex justify-between items-center mt-4 mx-3 pb-3 ">
              <h2 className="text-2xl font-semibold text-gray-900">
                Applications
              </h2>
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setCompanyName("");
                      setRole("");
                      setCtc("");
                      setRequirements("");
                      setStatus("to-apply");
                      setLastDateToApply("");
                      setAppliedDate("");
                      setExamDate("");
                      setModalOpen(true);
                    }}
                  >
                    New Application
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editJobId
                        ? "Edit Job Application"
                        : "Add Job Application"}
                    </DialogTitle>
                  </DialogHeader>
                  <form
                    onSubmit={handleAddOrUpdateJob}
                    className="flex flex-col gap-4 mt-4"
                  >
                    <Input
                      placeholder="Company Name"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="CTC / Stipend"
                      value={ctc}
                      onChange={(e) => setCtc(e.target.value)}
                      required
                    />
                    <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-xl px-3 py-1 shadow-sm">
                      <p className="font-semibold mb-1">
                        Tip for Formatting Notes
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          Separate with{" "}
                          <span className="font-medium">commas</span> to make
                          bullet points
                        </li>
                        <li>
                          Use <span className="font-medium">#</span> to create a
                          new sticky note
                        </li>
                      </ul>
                    </div>
                    <Input
                      placeholder="Notes"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                    />

                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="to-apply">To Apply</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>

                    {status === "to-apply" ? (
                      <>
                        <label className="font-medium text-gray-700">
                          Last Date to Apply
                        </label>
                        <Input
                          type="date"
                          value={lastDateToApply}
                          onChange={(e) => setLastDateToApply(e.target.value)}
                          placeholder="Select last date to apply"
                          required
                        />
                      </>
                    ) : (
                      <>
                        <label className="font-medium text-gray-700">
                          Applied Date
                        </label>
                        <Input
                          type="date"
                          value={appliedDate}
                          onChange={(e) => setAppliedDate(e.target.value)}
                          placeholder="Select applied date"
                        />

                        <label className="font-medium text-gray-700 mt-2">
                          Exam / Interview Date
                        </label>
                        <Input
                          type="date"
                          value={examDate}
                          onChange={(e) => setExamDate(e.target.value)}
                          placeholder="Select exam/interview date"
                        />
                      </>
                    )}

                    <Button type="submit" className="mt-2">
                      {editJobId ? "Update" : "Submit"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex flex-col gap-6 mx-2">
            {jobs.map((job) => (
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
      </main>
      <footer className="sticky bottom-0 z-40 w-full bg-white/70 backdrop-blur-md border-t text-center py-1 text-sm text-gray-600">
        <span>© {new Date().getFullYear()} Intern Tracker</span>
      </footer>
    </div>
  );
}
