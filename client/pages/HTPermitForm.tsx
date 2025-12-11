import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormWizard, HTPermitHeader } from "@/components/permit/ht/components";
import HTPermitPreview from "@/components/permit/ht/HTPermitPreview";
import type {
  PermitDraftEnvelope,
  PermitFormData,
} from "@/lib/ht-permit-types";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function createInitialData(): PermitFormData {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5);
  return {
    permitId: crypto.randomUUID(),
    certificateNo: "",
    permitNo: "",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stepData: {
      basic: {
        powerLine: "",
        affectedPlant: "",
        jobDescription: "",
        crossRefPermitNo: "",
        deptLocation: "",
        validity: {
          fromDate: today,
          fromTime: time,
          toDate: today,
          toTime: time,
        },
      },
      workAuth: {
        confirmation: false,
        rows: [
          {
            name: "",
            role: "Permit Requisitioner",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
          {
            name: "",
            role: "Permit Issuing Authority",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
        ],
      },
      deEnergize: {
        checklist: [
          {
            id: 1,
            activity: "All back feeding circuits checked & isolated",
            answer: "",
            remarks: "",
          },
          {
            id: 2,
            activity: "Control supply switched off",
            answer: "",
            remarks: "",
          },
          {
            id: 3,
            activity: "Breaker/MCC switched off & front lid opened",
            answer: "",
            remarks: "",
          },
          {
            id: 4,
            activity: "Breaker racked out & control plug removed",
            answer: "",
            remarks: "",
          },
          {
            id: 5,
            activity: "All fuses pulled out and kept at proper place",
            answer: "",
            remarks: "",
          },
          {
            id: 6,
            activity: "Back cover / lid of Breaker Panel opened",
            answer: "",
            remarks: "",
          },
          {
            id: 7,
            activity: "Breaker / MCC internals visually checked",
            answer: "",
            remarks: "",
          },
          {
            id: 8,
            activity:
              "No live voltage observed on Voltage Test using Voltage detector",
            answer: "",
            remarks: "",
          },
          {
            id: 9,
            activity: "Line discharged through Earth Rod",
            answer: "",
            remarks: "",
          },
          {
            id: 10,
            activity: "Temporary earthing provided",
            answer: "",
            remarks: "",
          },
          {
            id: 11,
            activity: "Breaker/ MCC backfront lids [covers] closed",
            answer: "",
            remarks: "",
          },
          {
            id: 12,
            activity: "LOTO performed on Breaker/MCC Module",
            answer: "",
            remarks: "",
          },
        ],
        confirmation: false,
        authorization: [
          {
            name: "",
            role: "Electrical Department",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
        ],
      },
      permitToWork: {
        workerName: "",
        equipmentType: "",
        timeRange: {
          fromDate: today,
          fromTime: time,
          toDate: today,
          toTime: time,
        },
        safetyConfirmed: false,
        authorization: [
          {
            name: "",
            role: "Permit Issuing Authority",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
        ],
      },
      preExecution: {
        checklist: [
          {
            id: 1,
            activity: "Breaker is in racked out position",
            answer: "",
            remarks: "",
          },
          {
            id: 2,
            activity:
              "No live voltage observed on cable discharged by grounding",
            answer: "",
            remarks: "",
          },
          {
            id: 3,
            activity:
              "No line voltage observed on Voltage Test using Voltage detector",
            answer: "",
            remarks: "",
          },
          {
            id: 4,
            activity: "Local earthing provided",
            answer: "",
            remarks: "",
          },
          {
            id: 5,
            activity: "LOTO done on Breaker/ MCC Module",
            answer: "",
            remarks: "",
          },
        ],
        confirmation: false,
        authorization: [
          {
            name: "",
            role: "Authorised Person",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
          {
            name: "",
            role: "Permit Requisitioner",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
        ],
      },
      jobCompletion: {
        status: "",
        safetyChecks: {
          toolsRemoved: false,
          manpowerEvacuated: false,
          groundsRemoved: false,
          areaSafe: false,
        },
        authorization: [
          {
            name: "",
            role: "Requisitioner / Executor",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
        ],
      },
      reEnergizeInstruction: {
        confirmations: {
          authorizationReceived: false,
          noConflicts: false,
          personnelNotified: false,
          systemReady: false,
        },
        authorization: [
          {
            name: "",
            role: "Permit Issuing Authority",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
        ],
      },
      reEnergizeAuthorization: {
        checklist: [
          {
            id: 1,
            activity: "Damaged internals of Breaker/ MCC rectified",
            answer: "",
            remarks: "",
          },
          {
            id: 2,
            activity: "Temporary earthing removed",
            answer: "",
            remarks: "",
          },
          {
            id: 3,
            activity: "IR Value of Cable/Equipment Checked-found O.K.",
            answer: "",
            remarks: "",
          },
          {
            id: 4,
            activity: "Back lid / cover of Breaker boxed up",
            answer: "",
            remarks: "",
          },
          {
            id: 5,
            activity: "All Locks & Tags of Breaker removed",
            answer: "",
            remarks: "",
          },
          {
            id: 6,
            activity: "All fuses put back in place",
            answer: "",
            remarks: "",
          },
          {
            id: 7,
            activity: "Breaker control plug put back in place",
            answer: "",
            remarks: "",
          },
          {
            id: 8,
            activity: "Breaker checked in test position & found O.K.",
            answer: "",
            remarks: "",
          },
          {
            id: 9,
            activity: "Trip circuit found healthy",
            answer: "",
            remarks: "",
          },
          {
            id: 10,
            activity: "Breaker racked in to service position",
            answer: "",
            remarks: "",
          },
          {
            id: 11,
            activity: "Control supply switched on",
            answer: "",
            remarks: "",
          },
          {
            id: 12,
            activity: "Breaker / MCC Module front door closed",
            answer: "",
            remarks: "",
          },
          {
            id: 13,
            activity: "MCC [MCU Module] switched on",
            answer: "",
            remarks: "",
          },
          {
            id: 14,
            activity: "All cables are dressed properly",
            answer: "",
            remarks: "",
          },
        ],
        finalConfirmation: false,
        authorization: [
          {
            name: "",
            role: "Electrical Department",
            contactNo: "",
            date: today,
            time,
            signatureImage: "",
          },
        ],
      },
    },
  };
}

export default function HTPermitForm() {
  const draftKeyBase = "ht-permit";
  const navigate = useNavigate();
  const [showPreview, setShowPreview] = useState(false);

  // Get user role for conditional UI
  const role = useMemo(() => {
    try {
      return typeof window !== "undefined"
        ? localStorage.getItem("dps_role")
        : null;
    } catch {
      return null;
    }
  }, []);

  // restore latest draft if any
  const initial = useMemo(() => {
    const latest = localStorage.getItem(draftKeyBase + "-latest");
    if (latest) {
      try {
        const env = JSON.parse(latest) as PermitDraftEnvelope;
        return env.data;
      } catch {}
    }
    return createInitialData();
  }, []);

  const onSaveDraft = (data: PermitFormData) => {
    const env: PermitDraftEnvelope = { data, auditTrail: [] };
    localStorage.setItem(`ht-permit-${data.permitId}`, JSON.stringify(env));
    localStorage.setItem("ht-permit-latest", JSON.stringify(env));
  };

  const onSubmit = (data: PermitFormData) => {
    const env: PermitDraftEnvelope = {
      data: { ...data, status: "submitted" },
      auditTrail: [],
    };
    localStorage.setItem(`ht-permit-${data.permitId}`, JSON.stringify(env));
    localStorage.setItem("ht-permit-latest", JSON.stringify(env));
    alert(
      "Permit submitted successfully. You can use the browser Print to save a PDF.",
    );
  };

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

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="mb-4 flex items-center justify-between mx-auto max-w-7xl px-4 pt-6">
        <div>
          <h1 className="text-[20px] font-semibold">
            High Tension Line Work Permit Form
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
                value={"highTension"}
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
                  if (v === "highTension") return;
                  if (v === "gasLine") navigate("/gas-permit");
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
      <div className="mx-auto max-w-7xl px-4 pb-6 space-y-6">
        <FormWizard
          initial={initial}
          onSaveDraft={onSaveDraft}
          onSubmit={onSubmit}
          renderHeader={() => <HTPermitHeader />}
          onPreviewRequest={() => setShowPreview(true)}
        />
        <div className="text-xs text-gray-500">
          Use Ctrl/Cmd+P to generate a print-ready PDF.
        </div>
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
                  {/* You'll need to import HTPermitPreview */}
                  <HTPermitPreview data={initial} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
