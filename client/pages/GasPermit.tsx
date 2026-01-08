import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ModernPagination } from "@/components/ui/modern-pagination";
import {
  StepSection,
  SignaturePad,
  StepActions,
} from "@/components/permit/ht/components";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import GasPermitPreview from "@/components/permit/gas/GasPermitPreview";
import { ApproverGLPermitDetailsSection } from "@/pages/ApproverPermitDetails";
import { SafetyGLPermitDetailsSection } from "@/pages/SafetyPermitDetails";

type ChecklistRow = {
  id: number;
  activity: string;
  answer: "yes" | "na" | "";
  remarks: string;
};

const checklistItems: ChecklistRow[] = [
  {
    id: 1,
    activity:
      "Are persons authorized (trained & competent) to enter / work in the gas proximity area?",
    answer: "",
    remarks: "",
  },
  {
    id: 2,
    activity: "Certified that the gas lines / equipment positively isolated?",
    answer: "",
    remarks: "",
  },
  {
    id: 3,
    activity:
      "Certified that the isolated gas lines / equipment completely purged by Nitrogen gas?",
    answer: "",
    remarks: "",
  },
  {
    id: 4,
    activity:
      "Are chemical analysis carried out of the sample taken after purging by Nitrogen gas?",
    answer: "",
    remarks: "",
  },
  {
    id: 5,
    activity:
      "Are the emergency escape routes checked & ensured? And Emergency Response plan in place?",
    answer: "",
    remarks: "",
  },
  {
    id: 6,
    activity:
      "Are all the PPEs, & firefighting equipment available, appropriate & in good condition?",
    answer: "",
    remarks: "",
  },
  {
    id: 7,
    activity: "Are the Breathing Apparatus Set etc. Available?",
    answer: "",
    remarks: "",
  },
  {
    id: 8,
    activity:
      "Are non-sparking tools or intrinsically safe electrical fittings and portable hand lamp used?",
    answer: "",
    remarks: "",
  },
  {
    id: 9,
    activity: "Are all mobile phones prohibited at work place?",
    answer: "",
    remarks: "",
  },
  {
    id: 10,
    activity:
      "Are required personal gas monitors available with persons working in the area?",
    answer: "",
    remarks: "",
  },
  {
    id: 11,
    activity:
      "Ensured that during operating the bleeder the gas is not allowed to blow over any person?",
    answer: "",
    remarks: "",
  },
  {
    id: 12,
    activity:
      "Ensured that the work will be started after checking the concentration of CO / toxic gases?",
    answer: "",
    remarks: "",
  },
];

const gasTable = [
  ["Ammonia", "25 ppm", "16.0%", "25.0%"],
  ["BF Gas", "50 PPM", "45%", "70%"],
  ["Carbon Monoxide (CO)", "50 PPM", "12.50%", "74%"],
  ["Corex Gas", "50 PPM", "10%", "72%"],
  ["Coke Oven Gas", "50 PPM", "6.00%", "30%"],
  ["Chlorine (Cl)", "0.5 ppm", "—", "—"],
  ["DRI Tail Gas", "50 PPM", "27%", "87%"],
  ["Hydrogen (H)", "—", "4.0%", "74.0%"],
  ["Hydrogen Sulphide (H s)", "10 ppm", "4%", "46%"],
  ["LPG", "1000 ppm", "2.2%", "9.9%"],
  ["Methane / Natural Gas", "1000 ppm", "5.9%", "14.0%"],
];

function GasSafetyTable() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-md">
        <thead className="bg-[#f8fafc]">
          <tr className="text-left">
            <th className="p-2 border">Gas</th>
            <th className="p-2 border">Safe Conc. For 8 Hrs.</th>
            <th className="p-2 border">Lower-Flammable Limit</th>
            <th className="p-2 border">Upper-Flammable Limit</th>
          </tr>
        </thead>
        <tbody>
          {gasTable.map((row, idx) => (
            <tr key={idx} className={cn(idx % 2 ? "bg-white" : "bg-gray-50")}>
              <td className="p-2 border font-medium">{row[0]}</td>
              <td className="p-2 border">{row[1]}</td>
              <td className="p-2 border">{row[2]}</td>
              <td className="p-2 border">{row[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GasPermit() {
  const steps = useMemo(
    () => [
      { id: "auth", name: "Authorization (Part A)" },
      { id: "safety", name: "Safety Checklist (Part B)" },
      { id: "limits", name: "Gas Safety Limits (Part C)" },
      { id: "permit", name: "Permit Authorization (Part D)" },
      { id: "closure", name: "Work Completion (Part E)" },
      { id: "details", name: "Permit Details" },
    ],
    [],
  );

  const [current, setCurrent] = useState(0);
  // Role-based restriction: approver and safety officers should only see Permit Details
  const isRestricted = useMemo(() => {
    try {
      const role =
        typeof window !== "undefined" ? localStorage.getItem("dps_role") : null;
      return role === "approver" || role === "safety";
    } catch {
      return false;
    }
  }, []);

  // Explicit role for conditional UI
  const role = useMemo(() => {
    try {
      return typeof window !== "undefined"
        ? localStorage.getItem("dps_role")
        : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (isRestricted && current !== 5) setCurrent(5);
  }, [isRestricted, current]);

  const uiSteps = isRestricted ? [steps[5]] : steps;
  const uiCurrent = isRestricted ? 0 : current;
  const [showPreview, setShowPreview] = useState(false);
  const [newRequesterComment, setNewRequesterComment] = useState("");
  const [newRequesterSafetyComment, setNewRequesterSafetyComment] =
    useState("");
  const storageKey = "gas-permit-draft";

  const [form, setForm] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw
        ? JSON.parse(raw)
        : {
            header: { certificateNo: "", permitNo: "" },
            permitDetails: {
              permitRequester: "",
              permitApprover1: "",
              permitApprover2: "",
              safetyManager: "",
              permitIssueDate: "",
              expectedReturnDate: "",
              requesterRequireUrgent: false,
              requesterSafetyManagerApproval: false,
              requesterPlannedShutdown: false,
              requesterPlannedShutdownDate: "",
              requesterCustomComments: [],
              requesterSafetyRequireUrgent: false,
              requesterSafetySafetyManagerApproval: false,
              requesterSafetyPlannedShutdown: false,
              requesterSafetyPlannedShutdownDate: "",
              requesterSafetyCustomComments: [],
            },
            partA: {
              issuerName: "",
              crossRef: "",
              department: "",
              location: "",
              description: "",
              fromDate: "",
              fromTime: "",
              toDate: "",
              toTime: "",
            },
            partB: checklistItems,
            partC: {},
            partD: {
              confirmation: false,
              issuerName: "",
              issuerSignature: "",
              issuerContact: "",
              issuerDate: "",
              issuerTime: "",
            },
            partE: {
              acceptor: {
                authority: "",
                name: "",
                signature: "",
                contact: "",
                date: "",
                time: "",
              },
              issuer: {
                authority: "",
                name: "",
                signature: "",
                contact: "",
                date: "",
                time: "",
              },
              acceptorConfirmed: false,
              workCompleted: false,
            },
          };
    } catch (e) {
      return {
        header: { certificateNo: "", permitNo: "" },
        permitDetails: {
          permitRequester: "",
          permitApprover1: "",
          permitApprover2: "",
          safetyManager: "",
          permitIssueDate: "",
          expectedReturnDate: "",
          requesterRequireUrgent: false,
          requesterSafetyManagerApproval: false,
          requesterPlannedShutdown: false,
          requesterPlannedShutdownDate: "",
          requesterCustomComments: [],
          requesterSafetyRequireUrgent: false,
          requesterSafetySafetyManagerApproval: false,
          requesterSafetyPlannedShutdown: false,
          requesterSafetyPlannedShutdownDate: "",
          requesterSafetyCustomComments: [],
        },
        partA: {
          issuerName: "",
          crossRef: "",
          department: "",
          location: "",
          description: "",
          fromDate: "",
          fromTime: "",
          toDate: "",
          toTime: "",
        },
        partB: checklistItems,
        partC: {},
        partD: {
          confirmation: false,
          issuerName: "",
          issuerSignature: "",
          issuerContact: "",
          issuerDate: "",
          issuerTime: "",
        },
        partE: {
          acceptor: {
            authority: "",
            name: "",
            signature: "",
            contact: "",
            date: "",
            time: "",
          },
          issuer: {
            authority: "",
            name: "",
            signature: "",
            contact: "",
            date: "",
            time: "",
          },
          acceptorConfirmed: false,
          workCompleted: false,
        },
      };
    }
  });

  // autosave interval
  useEffect(() => {
    const id = setInterval(() => {
      localStorage.setItem(storageKey, JSON.stringify(form));
    }, 30000);
    return () => clearInterval(id);
  }, [form]);

  // persist on change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(form));
  }, [form]);

  // Persist requester comments (for Approver view)
  useEffect(() => {
    try {
      const d = form.permitDetails || {};
      const payload = {
        requesterRequireUrgent: !!d.requesterRequireUrgent,
        requesterSafetyManagerApproval: !!d.requesterSafetyManagerApproval,
        requesterPlannedShutdown: !!d.requesterPlannedShutdown,
        requesterPlannedShutdownDate: d.requesterPlannedShutdownDate || "",
        requesterCustomComments: d.requesterCustomComments || [],
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "dps_requester_comments_gas",
          JSON.stringify(payload),
        );
      }
    } catch {}
  }, [
    form.permitDetails?.requesterRequireUrgent,
    form.permitDetails?.requesterSafetyManagerApproval,
    form.permitDetails?.requesterPlannedShutdown,
    form.permitDetails?.requesterPlannedShutdownDate,
    form.permitDetails?.requesterCustomComments,
  ]);

  // Persist requester Safety Officer comments — Gas Permit only
  useEffect(() => {
    try {
      const d = form.permitDetails || {};
      const payload = {
        requesterSafetyRequireUrgent: !!d.requesterSafetyRequireUrgent,
        requesterSafetySafetyManagerApproval:
          !!d.requesterSafetySafetyManagerApproval,
        requesterSafetyPlannedShutdown: !!d.requesterSafetyPlannedShutdown,
        requesterSafetyPlannedShutdownDate:
          d.requesterSafetyPlannedShutdownDate || "",
        requesterSafetyCustomComments: d.requesterSafetyCustomComments || [],
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "dps_requester_safety_comments_gas",
          JSON.stringify(payload),
        );
      }
    } catch {}
  }, [
    form.permitDetails?.requesterSafetyRequireUrgent,
    form.permitDetails?.requesterSafetySafetyManagerApproval,
    form.permitDetails?.requesterSafetyPlannedShutdown,
    form.permitDetails?.requesterSafetyPlannedShutdownDate,
    form.permitDetails?.requesterSafetyCustomComments,
  ]);

  // Load preview data from localStorage if in preview mode from SafetyOfficerApprovalQueue
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has("preview")) {
        const headerStr = localStorage.getItem("dps_permit_header");
        if (headerStr) {
          const header = JSON.parse(headerStr);
          // Update form with header data for gas permit
          if (header.permitNumber) {
            update("permitNo", header.permitNumber);
          }
          if (header.certificateNumber) {
            update("certificateNo", header.certificateNumber);
          }
          if (header.permitRequester) {
            update("requester", header.permitRequester);
          }
        }
        // Load requester comments for gas permit
        const requesterStr = localStorage.getItem(
          "dps_requester_safety_comments_gas",
        );
        if (requesterStr) {
          const requesterData = JSON.parse(requesterStr);
          // These comments can be displayed in the preview
        }
      }
    } catch {}
  }, []);

  // Auto-open preview modal if URL contains ?preview
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has("preview")) {
        setShowPreview(true);
      }
    } catch {}
  }, []);

  const handleClosePreview = () => {
    setShowPreview(false);
    // If preview was opened from ApproverPermitDetails or SafetyOfficerApprovalQueue, navigate back
    try {
      const sp = new URLSearchParams(window.location.search);
      const from = sp.get("from");
      if (from === "approver") {
        navigate("/approver-permit-details");
      } else if (from === "safety") {
        navigate("/safety-officer-approval-queue");
      }
    } catch {}
  };

  const update = (path: string, value: any) => {
    setForm((f: any) => {
      const copy = JSON.parse(JSON.stringify(f));
      const parts = path.split(".");
      let cur: any = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return copy;
    });
  };

  const validatePartA = () => {
    const a = form.partA || {};
    return (
      !!a.issuerName &&
      !!a.crossRef &&
      !!a.department &&
      !!a.location &&
      !!a.description &&
      !!a.fromDate
    );
  };

  const validatePartB = () => {
    const rows: ChecklistRow[] = form.partB || [];
    return (
      rows.length === 12 &&
      rows.every((r) => r.answer === "yes" || r.answer === "na")
    );
  };

  const validatePartD = () => {
    const d = form.partD || {};
    return (
      !!d.issuerName &&
      (!!d.issuerSignature || !!d.issuerContact) &&
      !!d.confirmation
    );
  };

  const validatePartE = () => {
    const e = form.partE || {};
    return (
      !!e.acceptorConfirmed &&
      !!e.workCompleted &&
      !!e.acceptor?.name &&
      !!e.issuer?.name
    );
  };

  const canNext = () => {
    if (current === 0) return validatePartA();
    if (current === 1) return validatePartB();
    if (current === 2) return true;
    if (current === 3) return validatePartD();
    if (current === 4) return validatePartE();
    if (current === 5) return true;
    return true;
  };

  const next = () => {
    setCurrent((c) => Math.min(steps.length - 1, c + 1));
  };
  const back = () => setCurrent((c) => Math.max(0, c - 1));

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="mb-4 flex items-center justify-between w-full px-4 pt-6">
        <div>
          <h1 className="text-[20px] font-semibold">
            Gas Line Work Permit Form
          </h1>
          <div className="text-sm text-gray-500">
            <p>
              <span className="text-sm">{`WCS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-700">
              <p>
                <strong>Work Permit Form Type:</strong>
              </p>
            </div>
            <div className="w-[220px]">
              <Select
                value={"gasLine"}
                onValueChange={(v) => {
                  if (v === "work") {
                    const role =
                      typeof window !== "undefined"
                        ? localStorage.getItem("dps_role")
                        : null;
                    if (role === "approver") {
                      navigate("/approver-permit-details");
                    } else if (role === "safety") {
                      navigate("/safety-permit-details");
                    } else {
                      navigate("/permit-details");
                    }
                    return;
                  }
                  if (v === "gasLine") return;
                  if (v === "highTension") navigate("/ht-permit");
                }}
              >
                <SelectTrigger aria-label="Select permit form">
                  <SelectValue placeholder="Permit form" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work Permit</SelectItem>
                  <SelectItem value="highTension">
                    High Tension Line Work Permit
                  </SelectItem>
                  <SelectItem value="gasLine">Gas Line Work Permit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {/* Preview requester form button for approver and safety officer users only */}
          {(role === "approver" || role === "safety") && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Preview Requester Form
            </button>
          )}
        </div>
      </header>
      <div className="w-full px-4 pb-6 space-y-6">
        {!isRestricted && (
          <ModernPagination
            steps={uiSteps.map((s) => s.name)}
            currentStep={uiCurrent}
            onStepChange={isRestricted ? () => {} : (i) => setCurrent(i)}
            showProgress
            allowClickNavigation
            variant="numbered"
          />
        )}

        <div className="bg-white mt-3">
          <div className="w-full px-4 py-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/placeholder.svg"
                alt="AM/NS INDIA logo"
                className="h-[60px] w-auto"
              />
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900">
                ArcelorMittal Nippon Steel India Limited
              </div>
              <div className="text-gray-600">HAZIRA</div>
              <div className="mt-1 text-[20px] font-bold text-gray-900">
                ADDITIONAL WORK PERMIT FOR GAS LINE / EQUIPMENT
              </div>
            </div>
            <div className="flex flex-col gap-2 w-[240px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate No.
                </label>
                <input
                  value={form.header.certificateNo}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      header: { ...prev.header, certificateNo: e.target.value },
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit No.
                </label>
                <input
                  value={form.header.permitNo}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      header: { ...prev.header, permitNo: e.target.value },
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {!isRestricted && current === 0 && (
          <StepSection
            title="Part - A: AUTHORISATION TO WORK"
            subtitle="(To be filled-up by Permit Issuer)"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">
                  Issuer Name <span className="text-red-600">*</span>
                </label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.partA.issuerName}
                  onChange={(e) => update("partA.issuerName", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Cross Ref. Permit No <span className="text-red-600">*</span>
                </label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.partA.crossRef}
                  onChange={(e) => update("partA.crossRef", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Department <span className="text-red-600">*</span>
                </label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.partA.department}
                  onChange={(e) => update("partA.department", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">
                  Location <span className="text-red-600">*</span>
                </label>
                <input
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  value={form.partA.location}
                  onChange={(e) => update("partA.location", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Description of the Job <span className="text-red-600">*</span>
                </label>
                <textarea
                  className="w-full rounded-md border px-3 py-2 text-sm h-24"
                  value={form.partA.description}
                  onChange={(e) => update("partA.description", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Validity <span className="text-red-600">*</span>
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">From</span>
                    <input
                      type="date"
                      className="rounded-md border px-3 py-2 text-sm"
                      value={form.partA.fromDate || ""}
                      onChange={(e) => update("partA.fromDate", e.target.value)}
                    />
                    <input
                      type="time"
                      className="rounded-md border px-3 py-2 text-sm"
                      value={form.partA.fromTime || ""}
                      onChange={(e) => update("partA.fromTime", e.target.value)}
                    />
                    <span className="text-sm font-medium">to</span>
                    <input
                      type="date"
                      className="rounded-md border px-3 py-2 text-sm"
                      value={form.partA.toDate || ""}
                      onChange={(e) => update("partA.toDate", e.target.value)}
                    />
                    <input
                      type="time"
                      className="rounded-md border px-3 py-2 text-sm"
                      value={form.partA.toTime || ""}
                      onChange={(e) => update("partA.toTime", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </StepSection>
        )}

        {!isRestricted && current === 1 && (
          <StepSection
            title="Part - B: MANDATORY CONDITIONS"
            subtitle="(To be filled-up Jointly by Permit Issuer & Acceptor)"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Checklist completion:{" "}
                {(form.partB || []).filter((r: any) => r.answer).length}/
                {(form.partB || []).length}
              </p>
              <div
                className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden"
                aria-label="Checklist progress"
              >
                <div
                  className="h-2 bg-[#2563eb]"
                  style={{
                    width: `${Math.round(
                      ((form.partB || []).filter((r: any) => r.answer).length /
                        (form.partB || []).length) *
                        100,
                    )}%`,
                  }}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-md">
                <thead style={{ background: "#f8fafc" }}>
                  <tr className="text-left">
                    <th className="p-2 border w-12">S/N</th>
                    <th className="p-2 border">Activity</th>
                    <th className="p-2 border w-24 text-center">Yes</th>
                    <th className="p-2 border w-24 text-center">N/A</th>
                    <th className="p-2 border w-64">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(form.partB || []).map((row: any, idx: number) => (
                    <tr
                      key={row.id}
                      className={cn(idx % 2 ? "bg-white" : "bg-gray-50")}
                    >
                      <td className="p-2 border align-top">{row.id}</td>
                      <td className="p-2 border align-top text-sm text-gray-800">
                        {row.activity}
                      </td>
                      <td className="p-2 border align-top text-center">
                        <button
                          type="button"
                          aria-pressed={row.answer === "yes"}
                          onClick={() => {
                            const next = row.answer === "yes" ? "" : "yes";
                            update(`partB.${idx}.answer`, next);
                          }}
                          className={cn(
                            "mx-auto h-6 w-6 rounded-md border flex items-center justify-center",
                            row.answer === "yes"
                              ? "bg-green-600 text-white border-green-600"
                              : "bg-white",
                          )}
                        >
                          {row.answer === "yes" ? "✓" : ""}
                        </button>
                      </td>
                      <td className="p-2 border align-top text-center">
                        <button
                          type="button"
                          aria-pressed={row.answer === "na"}
                          onClick={() => {
                            const next = row.answer === "na" ? "" : "na";
                            update(`partB.${idx}.answer`, next);
                          }}
                          className={cn(
                            "mx-auto h-6 w-6 rounded-md border flex items-center justify-center",
                            row.answer === "na"
                              ? "bg-gray-600 text-white border-gray-600"
                              : "bg-white",
                          )}
                        >
                          {row.answer === "na" ? "✓" : ""}
                        </button>
                      </td>
                      <td className="p-2 border align-top">
                        <input
                          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          value={row.remarks || ""}
                          onChange={(e) =>
                            update(`partB.${idx}.remarks`, e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </StepSection>
        )}

        {!isRestricted && current === 2 && (
          <StepSection
            title="Part - C: SAFE LIMITS OF GASES / VAPOURS"
            subtitle="(To be checked By Permit Issuer & Permit Acceptor)"
          >
            <GasSafetyTable />
          </StepSection>
        )}

        {!isRestricted && current === 3 && (
          <StepSection
            title="Part - D: PERMIT AUTHORISATION"
            subtitle="(To be filled-up by Permit Issuer)"
          >
            <div className="mb-4">
              <label className="inline-flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={!!form.partD.confirmation}
                  onChange={(e) =>
                    update("partD.confirmation", e.target.checked)
                  }
                  className="mt-1"
                />
                <span className="text-sm text-gray-800">
                  I confirm that the above location have been examined, the
                  safety precautions taken as per the check list. The permission
                  is authorized for this work. I also accept responsibility for
                  the work to be carried out safely.
                </span>
              </label>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-md">
                <thead className="bg-[#f8fafc]">
                  <tr className="text-left">
                    <th className="p-2 border">Authority</th>
                    <th className="p-2 border">Name</th>
                    <th className="p-2 border">Signature</th>
                    <th className="p-2 border">Contact No.</th>
                    <th className="p-2 border">Date</th>
                    <th className="p-2 border">Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="p-2 border align-top">
                      <div className="text-sm font-medium text-gray-800">
                        Permit Issuer
                      </div>
                    </td>
                    <td className="p-2 border align-top">
                      <input
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={form.partD.issuerName || ""}
                        onChange={(e) =>
                          update("partD.issuerName", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 border align-top">
                      <SignaturePad
                        value={form.partD.issuerSignature}
                        onChange={(v) => update("partD.issuerSignature", v)}
                      />
                    </td>
                    <td className="p-2 border align-top">
                      <input
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={form.partD.issuerContact || ""}
                        onChange={(e) =>
                          update("partD.issuerContact", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 border align-top">
                      <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={form.partD.issuerDate || ""}
                        onChange={(e) =>
                          update("partD.issuerDate", e.target.value)
                        }
                      />
                    </td>
                    <td className="p-2 border align-top">
                      <input
                        type="time"
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        value={form.partD.issuerTime || ""}
                        onChange={(e) =>
                          update("partD.issuerTime", e.target.value)
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </StepSection>
        )}

        {!isRestricted && current === 4 && (
          <StepSection
            title="Part - E: Work Permit Closure"
            subtitle="(To be signed by Permit Issuer & Permit Acceptor)"
          >
            <div className="space-y-4">
              {/* First checkbox */}
              <label className="inline-flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={!!form.partE.acceptorConfirmed}
                  onChange={(e) =>
                    update("partE.acceptorConfirmed", e.target.checked)
                  }
                  className="mt-1"
                />
                <span className="text-sm text-gray-800">
                  I confirm that the work has been completed / partially
                  completed, checked by myself and the area is left in a safe
                  condition.
                </span>
              </label>

              {/* Combined Table with both Permit Acceptor and Permit Issuer */}
              <div>
                <table className="w-full border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="border border-gray-300 p-2 w-32">
                        Authority
                      </th>
                      <th className="border border-gray-300 p-2">Name</th>
                      <th className="border border-gray-300 p-2">Signature</th>
                      <th className="border border-gray-300 p-2">
                        Contact No.
                      </th>
                      <th className="border border-gray-300 p-2">Date</th>
                      <th className="border border-gray-300 p-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 align-top font-semibold">
                        Permit Acceptor
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <input
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={form.partE.acceptor.name}
                          onChange={(e) =>
                            update("partE.acceptor.name", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <SignaturePad
                          value={form.partE.acceptor.signature}
                          onChange={(v) =>
                            update("partE.acceptor.signature", v)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <input
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={form.partE.acceptor.contact}
                          onChange={(e) =>
                            update("partE.acceptor.contact", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <input
                          type="date"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={form.partE.acceptor.date}
                          onChange={(e) =>
                            update("partE.acceptor.date", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <input
                          type="time"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={form.partE.acceptor.time}
                          onChange={(e) =>
                            update("partE.acceptor.time", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Second checkbox */}
              <label className="inline-flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={!!form.partE.workCompleted}
                  onChange={(e) =>
                    update("partE.workCompleted", e.target.checked)
                  }
                  className="mt-1"
                />
                <span className="text-sm text-gray-800">
                  I have inspected the finished work and hereby cancel / Close
                  this permit.
                </span>
              </label>

              {/* Continue with Permit Issuer table */}
              <div>
                <table className="w-full border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="border border-gray-300 p-2 w-32">
                        Authority
                      </th>
                      <th className="border border-gray-300 p-2">Name</th>
                      <th className="border border-gray-300 p-2">Signature</th>
                      <th className="border border-gray-300 p-2">
                        Contact No.
                      </th>
                      <th className="border border-gray-300 p-2">Date</th>
                      <th className="border border-gray-300 p-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 align-top font-semibold">
                        Permit Issuer
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <input
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={form.partE.issuer.name}
                          onChange={(e) =>
                            update("partE.issuer.name", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <SignaturePad
                          value={form.partE.issuer.signature}
                          onChange={(v) => update("partE.issuer.signature", v)}
                        />
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <input
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={form.partE.issuer.contact}
                          onChange={(e) =>
                            update("partE.issuer.contact", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <input
                          type="date"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={form.partE.issuer.date}
                          onChange={(e) =>
                            update("partE.issuer.date", e.target.value)
                          }
                        />
                      </td>
                      <td className="border border-gray-300 p-2 align-top">
                        <input
                          type="time"
                          className="w-full rounded-md border px-3 py-2 text-sm"
                          value={form.partE.issuer.time}
                          onChange={(e) =>
                            update("partE.issuer.time", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Legend */}
              <div className="mt-4" role="group" aria-label="Legend">
                <div className="border border-gray-300 rounded">
                  <div className="flex divide-x divide-gray-300">
                    <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide">
                      Legend
                    </div>
                    <div className="px-3 py-2 text-sm flex items-center gap-2">
                      <span className="font-bold">✓</span>
                      <span>Measures Taken</span>
                    </div>
                    <div className="px-3 py-2 text-sm flex items-center gap-2">
                      <span className="font-bold">✖</span>
                      <span>Measures Not Required</span>
                    </div>
                    <div className="px-3 py-2 text-sm">NA</div>
                    <div className="px-3 py-2 text-sm">Not applicable</div>
                  </div>
                </div>
              </div>
            </div>
          </StepSection>
        )}

        {(isRestricted || current === 5) &&
          (() => {
            try {
              const role =
                typeof window !== "undefined"
                  ? localStorage.getItem("dps_role")
                  : null;
              if (role === "approver") {
                return <ApproverGLPermitDetailsSection />;
              }
              if (role === "safety") {
                // Embed the same Safety Officer Details section here for Gas permit
                return <SafetyGLPermitDetailsSection />;
              }
            } catch {}
            // Default (requester) shows the embedded section
            return (
              <StepSection title="Details of such permit">
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                    <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
                      Details of such permit
                    </div>
                    <div className="mt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500">
                            Permit Requester
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              placeholder="Search user..."
                              className="w-full rounded border px-3 py-2 text-sm"
                              value={form.permitDetails?.permitRequester || ""}
                              onChange={(e) =>
                                update(
                                  "permitDetails.permitRequester",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">
                            Permit Approver 1
                          </div>
                          <input
                            aria-label="Permit Approver 1"
                            value={form.permitDetails?.permitApprover1 || ""}
                            onChange={(e) =>
                              update(
                                "permitDetails.permitApprover1",
                                e.target.value,
                              )
                            }
                            className="w-full mt-1 rounded border px-3 py-2 text-sm"
                            placeholder="Approver name or role"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">
                            Permit Approver 2
                          </div>
                          <input
                            aria-label="Permit Approver 2"
                            value={form.permitDetails?.permitApprover2 || ""}
                            onChange={(e) =>
                              update(
                                "permitDetails.permitApprover2",
                                e.target.value,
                              )
                            }
                            className="w-full mt-1 rounded border px-3 py-2 text-sm"
                            placeholder="Approver name or role"
                          />
                        </div>

                        <div>
                          <div className="text-xs text-gray-500">
                            Safety Manager
                          </div>
                          <input
                            aria-label="Safety Manager"
                            value={form.permitDetails?.safetyManager || ""}
                            onChange={(e) =>
                              update(
                                "permitDetails.safetyManager",
                                e.target.value,
                              )
                            }
                            className="w-full mt-1 rounded border px-3 py-2 text-sm"
                            placeholder="Safety Manager name/department"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-500">
                            Permit Issue Date
                          </label>
                          <input
                            type="date"
                            value={form.permitDetails?.permitIssueDate || ""}
                            onChange={(e) =>
                              update(
                                "permitDetails.permitIssueDate",
                                e.target.value,
                              )
                            }
                            className="w-full mt-1 rounded border px-3 py-2 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">
                            Expected Return Date
                          </label>
                          <input
                            type="date"
                            value={form.permitDetails?.expectedReturnDate || ""}
                            onChange={(e) =>
                              update(
                                "permitDetails.expectedReturnDate",
                                e.target.value,
                              )
                            }
                            className="w-full mt-1 rounded border px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      {/* Approver comments (read-only for requester) */}
                      {(() => {
                        try {
                          const raw =
                            typeof window !== "undefined"
                              ? localStorage.getItem(
                                  "dps_approver_comments_gas",
                                )
                              : null;
                          const aData = raw ? JSON.parse(raw) : null;
                          const hasAny = !!(
                            aData &&
                            (aData.approverRequireUrgent ||
                              aData.approverSafetyManagerApproval ||
                              aData.approverPlannedShutdown ||
                              (aData.approverCustomComments || []).length > 0)
                          );
                          return (
                            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                              <div className="text-md font-medium">
                                Comments from Approver:
                              </div>
                              <div className="mt-2 space-y-1 text-sm">
                                {hasAny ? (
                                  <>
                                    {aData?.approverRequireUrgent && (
                                      <div>Require on urgent basis</div>
                                    )}
                                    {aData?.approverSafetyManagerApproval && (
                                      <div>
                                        Safety Manager approval required
                                      </div>
                                    )}
                                    {(aData?.approverPlannedShutdown ||
                                      aData?.approverPlannedShutdownDate) && (
                                      <div>
                                        Planned shutdown on:{" "}
                                        {aData?.approverPlannedShutdownDate ||
                                          ""}
                                      </div>
                                    )}
                                    {(aData?.approverCustomComments || []).map(
                                      (it: any, i: number) => (
                                        <div key={i}>
                                          -{" "}
                                          {typeof it === "string"
                                            ? it
                                            : it.text}
                                        </div>
                                      ),
                                    )}
                                  </>
                                ) : (
                                  <div className="text-gray-500">
                                    No comments from approver yet
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } catch (e) {
                          return (
                            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                              <div className="text-md font-medium">
                                Comments from Approver:
                              </div>
                              <div className="mt-2 space-y-1 text-sm text-gray-500">
                                No comments from approver yet
                              </div>
                            </div>
                          );
                        }
                      })()}

                      {/* Safety Officer comments (read-only) — Gas requester view */}
                      {(() => {
                        try {
                          const raw =
                            typeof window !== "undefined"
                              ? localStorage.getItem(
                                  "dps_safety_to_requester_comments_gas",
                                )
                              : null;
                          const sData = raw ? JSON.parse(raw) : null;
                          const sHasAny = !!(
                            sData &&
                            (sData.safetyToRequesterRequireUrgent ||
                              sData.safetyToRequesterSafetyManagerApproval ||
                              sData.safetyToRequesterPlannedShutdown ||
                              (sData.safetyToRequesterCustomComments || [])
                                .length > 0)
                          );
                          return (
                            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                              <div className="text-md font-medium">
                                Comments from Safety Officer:
                              </div>
                              <div className="mt-2 space-y-1 text-sm">
                                {sHasAny ? (
                                  <>
                                    {sData?.safetyToRequesterRequireUrgent && (
                                      <div>Require on urgent basis</div>
                                    )}
                                    {sData?.safetyToRequesterSafetyManagerApproval && (
                                      <div>
                                        Safety Manager approval required
                                      </div>
                                    )}
                                    {(sData?.safetyToRequesterPlannedShutdown ||
                                      sData?.safetyToRequesterPlannedShutdownDate) && (
                                      <div>
                                        Planned shutdown on:{" "}
                                        {sData?.safetyToRequesterPlannedShutdownDate ||
                                          ""}
                                      </div>
                                    )}
                                    {(
                                      sData?.safetyToRequesterCustomComments ||
                                      []
                                    ).map((it: any, i: number) => (
                                      <div key={i}>
                                        -{" "}
                                        {typeof it === "string" ? it : it.text}
                                      </div>
                                    ))}
                                  </>
                                ) : (
                                  <div className="text-gray-500">
                                    No comments from safety officer yet
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        } catch (e) {
                          return (
                            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                              <div className="text-md font-medium">
                                Comments from Safety Officer:
                              </div>
                              <div className="mt-2 space-y-1 text-sm text-gray-500">
                                No comments from safety officer yet
                              </div>
                            </div>
                          );
                        }
                      })()}

                      {/* Editable comments sections - MOVED TO BOTTOM */}
                      <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                        <div className="text-md font-medium">
                          Comments for Approver:
                        </div>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={
                              !!form.permitDetails?.requesterRequireUrgent
                            }
                            onChange={(e) =>
                              update(
                                "permitDetails.requesterRequireUrgent",
                                e.target.checked,
                              )
                            }
                          />
                          Require on urgent basis
                        </label>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={
                              !!form.permitDetails
                                ?.requesterSafetyManagerApproval
                            }
                            onChange={(e) =>
                              update(
                                "permitDetails.requesterSafetyManagerApproval",
                                e.target.checked,
                              )
                            }
                          />
                          Safety Manager approval required
                        </label>
                        <div className="mt-2 text-md flex items-center gap-2">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                !!form.permitDetails?.requesterPlannedShutdown
                              }
                              onChange={(e) =>
                                update(
                                  "permitDetails.requesterPlannedShutdown",
                                  e.target.checked,
                                )
                              }
                            />
                            <span>Planned shutdown on:</span>
                          </label>
                          <input
                            type="date"
                            className="rounded border px-2 py-1 text-sm"
                            value={
                              form.permitDetails
                                ?.requesterPlannedShutdownDate || ""
                            }
                            onChange={(e) =>
                              update(
                                "permitDetails.requesterPlannedShutdownDate",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        {/* Custom comments section */}
                        <div className="mt-3">
                          <div className="mt-2 space-y-1">
                            {(
                              form.permitDetails?.requesterCustomComments || []
                            ).map((item: any, idx: number) => {
                              const text =
                                typeof item === "string" ? item : item.text;
                              const checked =
                                typeof item === "string"
                                  ? false
                                  : !!item.checked;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-2 w-full"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        const prev =
                                          form.permitDetails
                                            ?.requesterCustomComments || [];
                                        const next = prev.map(
                                          (it: any, i: number) => {
                                            if (i !== idx) return it;
                                            if (typeof it === "string")
                                              return {
                                                text: it,
                                                checked: e.target.checked,
                                              };
                                            return {
                                              ...it,
                                              checked: e.target.checked,
                                            };
                                          },
                                        );
                                        update(
                                          "permitDetails.requesterCustomComments",
                                          next,
                                        );
                                      }}
                                    />
                                    <span className="text-sm">{text}</span>
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      aria-label={`Delete comment ${idx + 1}`}
                                      onClick={() => {
                                        const prev =
                                          form.permitDetails
                                            ?.requesterCustomComments || [];
                                        const next = prev.filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        update(
                                          "permitDetails.requesterCustomComments",
                                          next,
                                        );
                                      }}
                                      className="text-xs text-red-600 hover:underline px-2 py-1"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <p className="text-xs font-medium mt-2">
                            Add comment
                          </p>
                          <div className="flex gap-2 mt-2">
                            <input
                              placeholder="Add comment"
                              className="flex-1 rounded border px-3 py-2 text-sm"
                              value={newRequesterComment}
                              onChange={(e) =>
                                setNewRequesterComment(e.target.value)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const v = newRequesterComment.trim();
                                if (!v) return;
                                const prev =
                                  form.permitDetails?.requesterCustomComments ||
                                  [];
                                update(
                                  "permitDetails.requesterCustomComments",
                                  [...prev, { text: v, checked: false }],
                                );
                                setNewRequesterComment("");
                              }}
                              className="px-3 py-1 rounded bg-white border text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Comments for Safety Officer */}
                      <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                        <div className="text-md font-medium">
                          Comments for Safety Officer:
                        </div>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={
                              !!form.permitDetails?.requesterSafetyRequireUrgent
                            }
                            onChange={(e) =>
                              update(
                                "permitDetails.requesterSafetyRequireUrgent",
                                e.target.checked,
                              )
                            }
                          />
                          Require on urgent basis
                        </label>
                        <label className="flex items-center gap-2 mt-2">
                          <input
                            type="checkbox"
                            checked={
                              !!form.permitDetails
                                ?.requesterSafetySafetyManagerApproval
                            }
                            onChange={(e) =>
                              update(
                                "permitDetails.requesterSafetySafetyManagerApproval",
                                e.target.checked,
                              )
                            }
                          />
                          Approver approval required
                        </label>
                        <div className="mt-2 text-md flex items-center gap-2">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={
                                !!form.permitDetails
                                  ?.requesterSafetyPlannedShutdown
                              }
                              onChange={(e) =>
                                update(
                                  "permitDetails.requesterSafetyPlannedShutdown",
                                  e.target.checked,
                                )
                              }
                            />
                            <span>Planned shutdown on:</span>
                          </label>
                          <input
                            type="date"
                            className="rounded border px-2 py-1 text-sm"
                            value={
                              form.permitDetails
                                ?.requesterSafetyPlannedShutdownDate || ""
                            }
                            onChange={(e) =>
                              update(
                                "permitDetails.requesterSafetyPlannedShutdownDate",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        {/* Safety custom comments */}
                        <div className="mt-3">
                          <div className="mt-2 space-y-1">
                            {(
                              form.permitDetails
                                ?.requesterSafetyCustomComments || []
                            ).map((item: any, idx: number) => {
                              const text =
                                typeof item === "string" ? item : item.text;
                              const checked =
                                typeof item === "string"
                                  ? false
                                  : !!item.checked;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between gap-2 w-full"
                                >
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => {
                                        const prev =
                                          form.permitDetails
                                            ?.requesterSafetyCustomComments ||
                                          [];
                                        const next = prev.map(
                                          (it: any, i: number) => {
                                            if (i !== idx) return it;
                                            if (typeof it === "string")
                                              return {
                                                text: it,
                                                checked: e.target.checked,
                                              };
                                            return {
                                              ...it,
                                              checked: e.target.checked,
                                            };
                                          },
                                        );
                                        update(
                                          "permitDetails.requesterSafetyCustomComments",
                                          next,
                                        );
                                      }}
                                    />
                                    <span className="text-sm">{text}</span>
                                  </div>
                                  <div>
                                    <button
                                      type="button"
                                      aria-label={`Delete comment ${idx + 1}`}
                                      onClick={() => {
                                        const prev =
                                          form.permitDetails
                                            ?.requesterSafetyCustomComments ||
                                          [];
                                        const next = prev.filter(
                                          (_: any, i: number) => i !== idx,
                                        );
                                        update(
                                          "permitDetails.requesterSafetyCustomComments",
                                          next,
                                        );
                                      }}
                                      className="text-xs text-red-600 hover:underline px-2 py-1"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <p className="text-xs font-medium mt-2">
                            Add comment
                          </p>
                          <div className="flex gap-2 mt-2">
                            <input
                              placeholder="Add comment"
                              className="flex-1 rounded border px-3 py-2 text-sm"
                              value={newRequesterSafetyComment}
                              onChange={(e) =>
                                setNewRequesterSafetyComment(e.target.value)
                              }
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const v = newRequesterSafetyComment.trim();
                                if (!v) return;
                                const prev =
                                  form.permitDetails
                                    ?.requesterSafetyCustomComments || [];
                                update(
                                  "permitDetails.requesterSafetyCustomComments",
                                  [...prev, { text: v, checked: false }],
                                );
                                setNewRequesterSafetyComment("");
                              }}
                              className="px-3 py-1 rounded bg-white border text-sm"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </StepSection>
            );
          })()}

        <StepActions
          onBack={back}
          onSave={() => localStorage.setItem(storageKey, JSON.stringify(form))}
          onNext={() => (current === steps.length - 1 ? null : next())}
          nextLabel={current === steps.length - 1 ? "Submit" : "Next Step"}
          disableNext={!canNext()}
          isFirst={current === 0}
          isLast={current === steps.length - 1}
          onPreview={() => setShowPreview(true)}
          previewLabel="Preview"
        />
        {showPreview && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/100 backdrop-blur-md"
              onClick={() => handleClosePreview()}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <div
              className="relative z-10 bg-white rounded-md shadow-xl w-[95vw] max-w-[1100px] max-h-[90vh] overflow-hidden"
              style={{ padding: 16 }}
            >
              <div
                className="overflow-auto bg-white"
                style={{ maxHeight: "calc(90vh - 32px)", padding: 12 }}
              >
                <div
                  style={{
                    transform: "scale(0.92)",
                    transformOrigin: "top center",
                  }}
                >
                  <GasPermitPreview data={form as any} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
