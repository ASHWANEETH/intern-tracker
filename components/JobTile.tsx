"use client";

import {
  FiEdit,
  FiCopy,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import CompanyLogo from "@/components/CompanyLogo";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Notes from "@/components/Notes";
import { useState, useCallback, useMemo } from "react";
import { Job } from "@/app/types/job";
import { AnimatePresence, motion } from "framer-motion";

// Status background gradients and badges
const statusGradients: Record<string, string> = {
  "to-apply":
    "bg-gradient-to-r from-gray-100 to-white border border-gray-200 dark:from-white/10 dark:to-transparent dark:border-none",
  applied:
    "bg-gradient-to-r from-blue-100 to-white border border-blue-200 dark:from-blue-600/20 dark:to-transparent dark:border-none",
  waiting:
    "bg-gradient-to-r from-yellow-100 to-white border border-yellow-200 dark:from-yellow-600/20 dark:to-transparent dark:border-none",
  rejected:
    "bg-gradient-to-r from-red-100 to-white border border-red-200 dark:from-red-600/20 dark:to-transparent dark:border-none",
  approved:
    "bg-gradient-to-r from-green-100 to-white border border-green-200 dark:from-green-600/20 dark:to-transparent dark:border-none",
};

const statusColors: Record<string, string> = {
  "to-apply": "bg-gray-300 text-gray-800 dark:text-white",
  applied: "bg-blue-200 text-blue-800",
  waiting: "bg-yellow-200 text-yellow-800",
  rejected: "bg-red-200 text-red-800",
  approved: "bg-green-200 text-green-800",
};

type Props = {
  job: Job;
  expandedJobId: string | null;
  onToggleExpand: (id: string) => void;
  onEditClick: (job: Job) => void;
  onConfirmDelete: (job: Job) => void;
  onConfirmDuplicate: (job: Job) => void;
  onStatusChange: (jobId: string, newStatus: string) => void;
  logoRefreshKey: number;
};

export default function JobTile({
  job,
  expandedJobId,
  onToggleExpand,
  onEditClick,
  onConfirmDelete,
  onConfirmDuplicate,
  onStatusChange,
  logoRefreshKey,
}: Props) {
  const [showNotes, setShowNotes] = useState(false);
  const isExpanded = expandedJobId === job.id;

  const gradientClasses =
    statusGradients[job.status] ??
    "bg-gradient-to-tr from-gray-100 to-white border border-gray-200";

  const toggleNotes = useCallback(() => {
    setShowNotes((prev) => !prev);
  }, []);

  const formattedLastDateToApply = useMemo(() => {
    return job.last_date_to_apply
      ? new Date(job.last_date_to_apply).toLocaleDateString()
      : "-";
  }, [job.last_date_to_apply]);

  const formattedAppliedDate = useMemo(() => {
    return job.applied_date
      ? new Date(job.applied_date).toLocaleDateString()
      : job.created_at
      ? new Date(job.created_at).toLocaleDateString()
      : "-";
  }, [job.applied_date, job.created_at]);

  const formattedExamDate = useMemo(() => {
    return job.exam_date ? new Date(job.exam_date).toLocaleDateString() : "-";
  }, [job.exam_date]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`rounded-2xl px-4 py-3 sm:py-3 shadow-xl ${gradientClasses} backdrop-blur-md transition cursor-pointer relative`}
    >
      {/* Header Row */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <CompanyLogo key={logoRefreshKey} companyName={job.company_name} />
          <h3 className="text-sm sm:text-base font-medium capitalize text-gray-900 dark:text-gray-100">
            {job.company_name}
          </h3>
        </div>
        <Select
          value={job.status}
          onValueChange={(value) => onStatusChange(job.id, value)}
        >
          <SelectTrigger
            className={`px-2 py-0.5 rounded-full text-xs font-semibold dark:border-none ${
              statusColors[job.status] || "bg-gray-300 text-white"
            }`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-w-xs dark:bg-neutral-800 dark:text-white">
            <SelectItem value="to-apply">To Apply</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium">
        {job.role}
      </p>
      <p className="text-sm sm:text-sm text-gray-700 dark:text-gray-300">
        {job.ctc?.toLowerCase().includes("lpa") ? "CTC" : "Stipend"}:{" "}
        <span className="font-semibold dark:text-white">{job.ctc}</span>
      </p>

      {/* Expandable Section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1"
          >
            {job.status === "to-apply" ? (
              <p>
                Last Date to Apply:{" "}
                <span className="font-medium dark:text-white">
                  {formattedLastDateToApply}
                </span>
              </p>
            ) : (
              <>
                <p>
                  Applied on:{" "}
                  <span className="font-medium dark:text-white">
                    {formattedAppliedDate}
                  </span>
                </p>
                <p>
                  Exam / Interview Date:{" "}
                  <span className="font-medium dark:text-white">
                    {formattedExamDate}
                  </span>
                </p>
              </>
            )}

            {/* Notes */}
            {job.requirements && (
              <>
                <button
                  onClick={toggleNotes}
                  className="flex items-center gap-1 font-medium text-sm text-gray-800 dark:text-gray-200 hover:underline mt-2"
                >
                  Notes {showNotes ? <FiChevronUp /> : <FiChevronDown />}
                </button>

                <AnimatePresence initial={false}>
                  {showNotes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="w-[75%]"
                    >
                      <Notes requirements={job.requirements} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <Button size="sm" onClick={() => onEditClick(job)}>
          <FiEdit className="w-3 h-3" />
        </Button>
        <Button size="sm" onClick={() => onConfirmDuplicate(job)}>
          <FiCopy className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onConfirmDelete(job)}
        >
          <FiTrash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Expand/Collapse Icon */}
      <div
        className="absolute bottom-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white cursor-pointer"
        onClick={() => onToggleExpand(job.id)}
      >
        {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </div>
    </motion.div>
  );
}
