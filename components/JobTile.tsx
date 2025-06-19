"use client";

import { FiEdit, FiCopy, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import CompanyLogo from "@/components/CompanyLogo";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import Notes from "@/components/Notes";
import { useState } from "react";
import { Job } from "@/app/types/job"; // assuming you have this type

const statusColors: Record<string, string> = {
  "to-apply": "bg-gray-300 text-gray-800",
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

  return (
    <div className="border border-gray-200 rounded-2xl px-5 py-4 shadow-lg hover:shadow-indigo-200 hover:border-indigo-200 transition cursor-pointer relative">
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
        CTC/Stipend: <strong>{job.ctc}</strong>
      </p>

      {/* Expanded Info */}
      {isExpanded && (
        <div className="mt-3 text-sm text-gray-600 space-y-1">
          {job.status === "to-apply" ? (
            <p>
              Last Date to Apply:
              <strong>
                {" "}
                {job.last_date_to_apply
                  ? new Date(job.last_date_to_apply).toLocaleDateString()
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
                    ? new Date(job.applied_date).toLocaleDateString()
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

          {/* Toggle Notes */}
          {job.requirements && (
            <div>
              <button
                onClick={() => setShowNotes((prev) => !prev)}
                className="flex items-center gap-1 text-black font-medium text-sm hover:underline"
              >
                {showNotes ? "Hide Notes" : "Notes"}
                {showNotes ? (
                  <FiChevronUp className="w-4 h-4" />
                ) : (
                  <FiChevronDown className="w-4 h-4" />
                )}
              </button>

              {showNotes && (
                <div className="mt-2">
                  <Notes requirements={job.requirements} />
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
        {isExpanded ? (
          <FiChevronUp size={20} />
        ) : (
          <FiChevronDown size={20} />
        )}
      </div>
    </div>
  );
}
