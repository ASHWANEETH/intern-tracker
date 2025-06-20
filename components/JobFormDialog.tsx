"use client";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

interface JobFormDialogProps {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  handleAddOrUpdateJob: (e: React.FormEvent) => void;
  editJobId: string | null;
  companyName: string;
  setCompanyName: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  ctc: string;
  setCtc: (value: string) => void;
  requirements: string;
  setRequirements: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  lastDateToApply: string;
  setLastDateToApply: (value: string) => void;
  appliedDate: string;
  setAppliedDate: (value: string) => void;
  examDate: string;
  setExamDate: (value: string) => void;
}

export default function JobFormDialog({
  modalOpen,
  setModalOpen,
  handleAddOrUpdateJob,
  editJobId,
  companyName,
  setCompanyName,
  role,
  setRole,
  ctc,
  setCtc,
  requirements,
  setRequirements,
  status,
  setStatus,
  lastDateToApply,
  setLastDateToApply,
  appliedDate,
  setAppliedDate,
  examDate,
  setExamDate,
}: JobFormDialogProps) {
  return (
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
            {editJobId ? "Edit Job Application" : "Add Job Application"}
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
            <p className="font-semibold mb-1">Tip for Formatting Notes</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Separate with <span className="font-medium">commas</span> to make
                bullet points
              </li>
              <li>
                Use <span className="font-medium">#</span> to create a new sticky
                note
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
  );
}
