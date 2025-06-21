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

const statusColors: Record<string, string> = {
  "to-apply": "bg-gray-300 text-gray-800",
  applied: "bg-blue-200 text-blue-800",
  waiting: "bg-yellow-200 text-yellow-800",
  rejected: "bg-red-200 text-red-800",
  approved: "bg-green-200 text-green-800",
};

const statusGradients: Record<string, string> = {
  "to-apply": "from-gray-100/90 to-gray-50/80 border-gray-200",
  applied: "from-blue-100/90 to-blue-50/80 border-blue-200",
  waiting: "from-yellow-100/90 to-yellow-50/80 border-yellow-200",
  rejected: "from-red-100/90 to-red-50/80 border-red-200",
  approved: "from-green-100/90 to-green-50/80 border-green-200",
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

  const gradientClasses = statusGradients[job.status] ?? "from-gray-100/90 to-gray-50/80 border-gray-200";

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
    return job.exam_date
      ? new Date(job.exam_date).toLocaleDateString()
      : "-";
  }, [job.exam_date]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className={`
        rounded-2xl px-5 py-3
        md:mx-4 
        shadow-xl 
        bg-gradient-to-br ${gradientClasses} 
        backdrop-blur-md 
        transition cursor-pointer relative
      `}
    >
      {/* Header Row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CompanyLogo key={logoRefreshKey} companyName={job.company_name} />
          <h3 className="text-lg font-semibold capitalize text-gray-900">
            {job.company_name}
          </h3>
        </div>
        <Select
          value={job.status}
          onValueChange={(value) => onStatusChange(job.id, value)}
        >
          <SelectTrigger
            className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer transition-colors duration-200 ease-in-out ${
              statusColors[job.status] || "bg-gray-300 text-gray-800"
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
      <p className="text-gray-700 mt-1 font-medium">{job.role}</p>
      <p className="text-gray-700">
        {job.ctc?.toLowerCase().includes("lpa") ? "CTC" : "Stipend"}:{" "}
        <strong>{job.ctc}</strong>
      </p>

      {/* Expandable section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden mt-2 text-sm text-gray-600 space-y-1"
          >
            {job.status === "to-apply" ? (
              <p>
                Last Date to Apply: <strong>{formattedLastDateToApply}</strong>
              </p>
            ) : (
              <>
                <p>
                  Applied on: <strong>{formattedAppliedDate}</strong>
                </p>
                <p>
                  Exam / Interview Date: <strong>{formattedExamDate}</strong>
                </p>
              </>
            )}

            {/* Notes */}
            {job.requirements && (
              <>
                <button
                  onClick={toggleNotes}
                  className="flex items-center gap-1 text-black font-medium text-sm hover:underline"
                >
                  {showNotes ? "Hide Notes" : "Notes"}
                  {showNotes ? (
                    <FiChevronUp className="w-4 h-4" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {showNotes && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="mt-2 overflow-hidden"
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
          <FiEdit className="w-4 h-4" />
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

      {/* Toggle Dropdown Icon */}
      <div
        className="absolute bottom-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        onClick={() => onToggleExpand(job.id)}
      >
        {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </div>
    </motion.div>
  );
}
