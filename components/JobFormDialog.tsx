"use client";

import { jobRoles } from "@/app/types/jobRoles";

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
import { useState, useEffect } from "react";

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
  interface CompanySuggestion {
    name: string;
    domain: string;
  }

  const [companySuggestions, setCompanySuggestions] = useState<
    CompanySuggestion[]
  >([]);

  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const fetchCompanySuggestions = async () => {
      if (companyName.length < 1) {
        setCompanySuggestions([]);
        return;
      }

      try {
        const res = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${companyName}`
        );
        const data = await res.json();
        setCompanySuggestions(data); // array of {name, domain}
      } catch (err) {
        console.error("Error fetching company suggestions:", err);
      }
    };

    const debounce = setTimeout(() => {
      fetchCompanySuggestions();
    }, 50);

    return () => clearTimeout(debounce);
  }, [companyName]);

  useEffect(() => {
    // Static "role" autocomplete — you can replace with API later if needed
    const allRoles = jobRoles;

    if (role.length < 1) {
      setRoleSuggestions([]);
    } else {
      const filtered = allRoles.filter((r) =>
        r.toLowerCase().includes(role.toLowerCase())
      );
      setRoleSuggestions(filtered);
    }
  }, [role]);

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
          className="flex flex-col gap-4 mt-4 relative"
        >
          {/* Company Name */}
          <div className="relative">
            <Input
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            {companySuggestions.length > 0 && (
              <div className="absolute z-20 bg-white border border-gray-200 rounded mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                {companySuggestions.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCompanyName(item.name);
                      setCompanySuggestions([]);
                    }}
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role */}
          <div className="relative">
            <Input
              placeholder="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            />
            {roleSuggestions.length > 0 && (
              <div className="absolute z-20 bg-white border border-gray-200 rounded mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                {roleSuggestions.map((item, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setRole(item);
                      setRoleSuggestions([]);
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTC */}
          <Input
            placeholder="CTC / Stipend"
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
            required
          />

          {/* Notes */}
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-xl px-3 py-1 shadow-sm">
            <p className="font-semibold mb-1">Tip for Formatting Notes</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Separate with <span className="font-medium">commas</span> to
                make bullet points
              </li>
              <li>
                Use <span className="font-medium">#</span> to create a new
                sticky note
              </li>
            </ul>
          </div>

          <Input
            placeholder="Notes"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />

          {/* Status */}
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

          {/* Conditional Dates */}
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
              <label className="font-medium text-gray-700">Applied Date</label>
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

          {/* Submit Button */}
          <Button type="submit" className="mt-2">
            {editJobId ? "Update" : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
