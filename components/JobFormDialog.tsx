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
import { useState, useEffect, useRef, useMemo, useCallback } from "react";

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

  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [ctcType, setCtcType] = useState<"ctc" | "stipend">("ctc");
  const [ctcAmount, setCtcAmount] = useState<string>("");

  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);

  const companyInputRef = useRef<HTMLInputElement>(null);
  const roleInputRef = useRef<HTMLInputElement>(null);

  // Memoize role options
  const allRoles = useMemo(() => jobRoles, []);

  // Handle ctc parsing
  useEffect(() => {
    if (ctc.includes("/month")) {
      setCtcType("stipend");
      setCtcAmount(ctc.replace("/month", "").trim());
    } else if (ctc.includes("LPA")) {
      setCtcType("ctc");
      setCtcAmount(ctc.replace("LPA", "").trim());
    } else {
      setCtcAmount(ctc);
    }
  }, [ctc]);

  const handleCtcChange = useCallback((type: "ctc" | "stipend", amount: string) => {
    setCtcType(type);
    setCtcAmount(amount);
    if (type === "ctc") {
      setCtc(amount ? `${amount} LPA` : "");
    } else {
      setCtc(amount ? `${amount} /month` : "");
    }
  }, [setCtcType, setCtcAmount, setCtc]);

  // Debounced company suggestions
  useEffect(() => {
    if (companyName.length < 1 || !isEditingCompany) {
      setCompanySuggestions([]);
      return;
    }

    const controller = new AbortController();

    const fetchCompanySuggestions = async () => {
      try {
        const res = await fetch(
          `https://autocomplete.clearbit.com/v1/companies/suggest?query=${companyName}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setCompanySuggestions(data);
      } catch (err) {
        if (typeof err === "object" && err !== null && "name" in err && (err as { name?: string }).name !== "AbortError") {
          console.error("Error fetching company suggestions:", err);
        }
      }
    };

    const debounce = setTimeout(() => {
      fetchCompanySuggestions();
    }, 200);

    return () => {
      controller.abort();
      clearTimeout(debounce);
    };
  }, [companyName, isEditingCompany]);

  // Filter role suggestions
  useEffect(() => {
    if (role.length < 1 || !isEditingRole) {
      setRoleSuggestions([]);
    } else {
      const filtered = allRoles.filter((r) =>
        r.toLowerCase().includes(role.toLowerCase())
      );
      setRoleSuggestions(filtered.slice(0, 5));
    }
  }, [role, isEditingRole, allRoles]);

  const handleCompanySelect = (name: string) => {
    setCompanyName(name);
    setCompanySuggestions([]);
    setIsEditingCompany(false);
    companyInputRef.current?.blur();
  };

  const handleRoleSelect = (name: string) => {
    setRole(name);
    setRoleSuggestions([]);
    setIsEditingRole(false);
    roleInputRef.current?.blur();
  };

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
          className="flex flex-col gap-3 relative"
        >
          {/* Company Name */}
          <div className="relative">
            <Input
              ref={companyInputRef}
              placeholder="Company Name"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value);
                setIsEditingCompany(true);
              }}
              required
            />
            {companySuggestions.length > 0 && (
              <div className="absolute z-20 bg-white border border-gray-200 rounded mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                {companySuggestions.slice(0, 3).map((item, index) => (
                  <div
                    key={index}
                    className="p-1 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => handleCompanySelect(item.name)}
                    onTouchStart={() => handleCompanySelect(item.name)}
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
              ref={roleInputRef}
              placeholder="Role"
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setIsEditingRole(true);
              }}
              required
            />
            {roleSuggestions.length > 0 && (
              <div className="absolute z-20 bg-white border border-gray-200 rounded mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                {roleSuggestions.map((item, index) => (
                  <div
                    key={index}
                    className="p-1 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={() => handleRoleSelect(item)}
                    onTouchStart={() => handleRoleSelect(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CTC / Stipend */}
          <div className="flex gap-2 items-center">
            <Select
              value={ctcType}
              onValueChange={(v) =>
                handleCtcChange(v as "ctc" | "stipend", ctcAmount)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ctc">CTC</SelectItem>
                <SelectItem value="stipend">Stipend</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="text"
              value={ctcAmount}
              onChange={(e) => handleCtcChange(ctcType, e.target.value)}
              placeholder="Amount"
              className="flex-1"
            />

            <div className="text-gray-500 text-sm min-w-[40px]">
              {ctcType === "ctc" ? "LPA" : "/month"}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 text-sm rounded-xl px-3 py-1 shadow-sm">
            <p className="font-semibold mb-1">Tip for Formatting Notes</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Separate with <span className="font-medium">commas</span> to make bullet points
              </li>
              <li>
                Use <span className="font-medium">#</span> to create a new sticky note
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
              <label className="font-medium text-gray-700">Last Date to Apply</label>
              <Input
                type="date"
                value={lastDateToApply}
                onChange={(e) => setLastDateToApply(e.target.value)}
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
              />

              <label className="font-medium text-gray-700 mt-2">Exam / Interview Date</label>
              <Input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
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
