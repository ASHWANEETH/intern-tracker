"use client";

import Image from "next/image";
import {
  FiEdit,
  FiCopy,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import DashboardGreeting from "@/components/DashboardGreet";
import CompanyLogo from "@/components/CompanyLogo";
import { ConfirmModal } from "@/components/ConfirmModal";
import confetti from "canvas-confetti";
import FooterWithModals from "@/components/Footer";
import Notes from "@/components/Notes";

type Job = {
  id: string;
  company_name: string;
  role: string;
  ctc: string;
  requirements?: string | null;
  status: string;
  last_date_to_apply?: string | null;
  applied_date?: string | null;
  exam_date?: string | null;
  created_at?: string;
  user_id: string;
};

const statusColors: Record<string, string> = {
  "to-apply": "bg-gray-300 text-gray-800",
  applied: "bg-blue-200 text-blue-800",
  waiting: "bg-yellow-200 text-yellow-800",
  rejected: "bg-red-200 text-red-800",
  approved: "bg-green-200 text-green-800",
};

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
    action: "delete" | "duplicate" | null;
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

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      router.push("/");
    }
  };

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

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="p-4 max-w-3xl mx-auto">
          <div className="sticky top-0 pt-2 z-50 bg-white">
            <div className="w-full px-2 sm:px-4 pb-3">
              <header className="max-w-6xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Image
                    src="/logo.svg"
                    alt="Intern Tracker Logo"
                    width={28}
                    height={28}
                    priority
                    className="w-7 h-7 sm:w-8 sm:h-8"
                  />
                  <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                    Intern Tracker
                  </h1>
                </div>

                <Button variant="outline" onClick={handleLogout} size="sm">
                  Logout
                </Button>
              </header>
            </div>
            {user && <DashboardGreeting user={user} jobs={jobs} />}

            <div className="flex justify-between items-center my-6 mx-3 pb-3">
              <h2 className="text-2xl font-semibold text-gray-900">
                Intern Applications
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
                          Use <span className="font-medium">~</span> to create a
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
            {jobs.map((job) => {
              const isExpanded = expandedJobId === job.id;
              return (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-indigo-200 hover:border-indigo-200 transition cursor-pointer relative"
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CompanyLogo
                        key={logoRefreshKey}
                        companyName={job.company_name}
                      />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {job.company_name}
                      </h3>
                    </div>
                    <Select
                      value={job.status}
                      onValueChange={(value) =>
                        handleStatusChange(job.id, value)
                      }
                    >
                      <SelectTrigger
                        className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 ease-in-out ${
                          statusColors[job.status] ||
                          "bg-gray-300 text-gray-800"
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-w-xs">
                        <SelectItem value="to-apply">To Apply</SelectItem>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="waiting">Waiting</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Summary */}
                  <p className="text-gray-700 mt-2 font-medium">{job.role}</p>
                  <p className="text-gray-700 font-semibold">
                    CTC / Stipend: {job.ctc}
                  </p>

                  {/* Expanded Info */}
                  {isExpanded && (
                    <div className="mt-4 text-sm text-gray-600 space-y-1">
                      {job.status === "to-apply" ? (
                        <p>
                          Last Date to Apply:
                          <strong>
                            {" "}
                            {job.last_date_to_apply
                              ? new Date(
                                  job.last_date_to_apply
                                ).toLocaleDateString()
                              : "-"}
                          </strong>
                        </p>
                      ) : (
                        <>
                          <p>
                            Applied on:
                            <strong>
                              {" "}
                              {job.applied_date
                                ? new Date(
                                    job.applied_date
                                  ).toLocaleDateString()
                                : job.created_at
                                ? new Date(job.created_at).toLocaleDateString()
                                : "-"}
                            </strong>
                          </p>
                          <p>
                            Exam / Interview Date:
                            <strong>
                              {" "}
                              {job.exam_date
                                ? new Date(job.exam_date).toLocaleDateString()
                                : "-"}
                            </strong>
                          </p>
                        </>
                      )}
                      {/* Notes */}
                      {job.requirements && (
                        <Notes requirements={job.requirements} />
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" onClick={() => handleEditClick(job)}>
                      <FiEdit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        setConfirmModal({ action: "duplicate", job })
                      }
                    >
                      <FiCopy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setConfirmModal({ action: "delete", job })}
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Toggle Dropdown Icon */}
                  <div
                    className="absolute bottom-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
                    onClick={() => toggleExpand(job.id)}
                  >
                    {isExpanded ? (
                      <FiChevronUp size={20} />
                    ) : (
                      <FiChevronDown size={20} />
                    )}
                  </div>
                </div>
              );
            })}

            <ConfirmModal
              open={!!confirmModal.job}
              message={`Are you sure you want to ${confirmModal.action} the job at ${confirmModal.job?.company_name}?`}
              onConfirm={handleConfirm}
              onCancel={closeModal}
            />
          </div>
        </div>
      </main>

      <FooterWithModals />
    </div>
  );
}
