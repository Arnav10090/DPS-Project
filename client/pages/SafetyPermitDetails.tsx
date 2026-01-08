import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PermitPreview from "@/components/permit/PermitPreview";
import HTPermitPreview from "@/components/permit/ht/HTPermitPreview";
import GasPermitPreview from "@/components/permit/gas/GasPermitPreview";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type SafetyOfficerPermitForm = {
  // Requester-side flags (read-only here, shown as plain text)
  requesterRequireUrgent?: boolean;
  requesterSafetyManagerApproval?: boolean;
  requesterPlannedShutdown?: boolean;
  requesterPlannedShutdownDate?: string;
  requesterCustomComments?: Array<string | { text: string; checked?: boolean }>;
  // Approver comments (read-only shown here)
  approverRequireUrgent?: boolean;
  approverSafetyManagerApproval?: boolean;
  approverPlannedShutdown?: boolean;
  approverPlannedShutdownDate?: string;
  approverCustomComments?: Array<string | { text: string; checked?: boolean }>;
  // Approver -> Safety comments (read-only shown here)
  approverToSafetyRequireUrgent?: boolean;
  approverToSafetySafetyManagerApproval?: boolean;
  approverToSafetyPlannedShutdown?: boolean;
  approverToSafetyPlannedShutdownDate?: string;
  approverToSafetyCustomComments?: Array<
    string | { text: string; checked?: boolean }
  >;

  // SafetyOfficer -> Approver flags (editable)
  safetyToApproverRequireUrgent?: boolean;
  safetyToApproverSafetyManagerApproval?: boolean;
  safetyToApproverPlannedShutdown?: boolean;
  safetyToApproverPlannedShutdownDate?: string;
  safetyToApproverCustomComments?: Array<
    string | { text: string; checked?: boolean }
  >;

  // SafetyOfficer comments for Safety Officer (editable)
  SafetyOfficerRequireUrgent?: boolean;
  SafetyOfficerSafetyManagerApproval?: boolean;
  SafetyOfficerPlannedShutdown?: boolean;
  SafetyOfficerPlannedShutdownDate?: string;
  SafetyOfficerCustomComments?: Array<
    string | { text: string; checked?: boolean }
  >; // checkbox list
  // Local-only selection for work permit type
  permitType?: "hot" | "cold";
  // Local-only Work Permit Form Type selection (mirrors main page)
  permitDocType?: "work" | "highTension" | "gasLine";
  // Header fields
  permitRequester?: string;
  permitApprover1?: string;
  permitApprover2?: string;
  safetyManager?: string;
  permitIssueDate?: string;
  expectedReturnDate?: string;
  certificateNumber?: string;
  permitNumber?: string;
};

const DEFAULT_FORM: SafetyOfficerPermitForm = {
  requesterRequireUrgent: false,
  requesterSafetyManagerApproval: false,
  requesterPlannedShutdown: false,
  requesterPlannedShutdownDate: "",
  requesterCustomComments: [],
  approverRequireUrgent: false,
  approverSafetyManagerApproval: false,
  approverPlannedShutdown: false,
  approverPlannedShutdownDate: "",
  approverCustomComments: [],
  approverToSafetyRequireUrgent: false,
  approverToSafetySafetyManagerApproval: false,
  approverToSafetyPlannedShutdown: false,
  approverToSafetyPlannedShutdownDate: "",
  approverToSafetyCustomComments: [],

  safetyToApproverRequireUrgent: false,
  safetyToApproverSafetyManagerApproval: false,
  safetyToApproverPlannedShutdown: false,
  safetyToApproverPlannedShutdownDate: "",
  safetyToApproverCustomComments: [],
  SafetyOfficerRequireUrgent: false,
  SafetyOfficerSafetyManagerApproval: false,
  SafetyOfficerPlannedShutdown: false,
  SafetyOfficerPlannedShutdownDate: "",
  SafetyOfficerCustomComments: [],
  permitType: "hot",
  permitDocType: "work",
  permitRequester: "",
  permitApprover1: "",
  permitApprover2: "",
  safetyManager: "",
  permitIssueDate: "",
  expectedReturnDate: "",
  certificateNumber: "",
  permitNumber: "",
};

export default function SafetyOfficerPermitDetails() {
  const [form, setForm] = useState<SafetyOfficerPermitForm>(() => DEFAULT_FORM);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [newSafetyOfficerComment, setNewSafetyOfficerComment] = useState("");
  const [newSafetyToApproverComment, setNewSafetyToApproverComment] =
    useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (showPreviewModal) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setShowPreviewModal(false);
      };
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
    return;
  }, [showPreviewModal]);

  useEffect(() => {
    // Force safety role for this page
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("dps_role", "safety");
      }
    } catch (e) {
      /* ignore */
    }
  }, []);

  // Load requester & approver comments and header fields persisted from other pages
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      // Load requester -> Safety specific comments for WORK form only
      const rawSafety = localStorage.getItem(
        "dps_requester_safety_comments_work",
      );
      if (rawSafety) {
        const d = JSON.parse(rawSafety);
        update({
          requesterRequireUrgent: !!d.requesterSafetyRequireUrgent,
          requesterSafetyManagerApproval:
            !!d.requesterSafetySafetyManagerApproval,
          requesterPlannedShutdown: !!d.requesterSafetyPlannedShutdown,
          requesterPlannedShutdownDate:
            d.requesterSafetyPlannedShutdownDate || "",
          requesterCustomComments: d.requesterSafetyCustomComments || [],
        });
      }
      // Approver base comments (WORK form only)
      // Migration: if work-specific key missing but generic exists, migrate
      if (!localStorage.getItem("dps_approver_comments_work")) {
        const legacy = localStorage.getItem("dps_approver_comments");
        if (legacy) {
          localStorage.setItem("dps_approver_comments_work", legacy);
        }
      }
      const rawApprover = localStorage.getItem("dps_approver_comments_work");
      if (rawApprover) {
        const a = JSON.parse(rawApprover);
        update({
          approverRequireUrgent: !!a.approverRequireUrgent,
          approverSafetyManagerApproval: !!a.approverSafetyManagerApproval,
          approverPlannedShutdown: !!a.approverPlannedShutdown,
          approverPlannedShutdownDate: a.approverPlannedShutdownDate || "",
          approverCustomComments: a.approverCustomComments || [],
        });
      }
      // Approver -> Safety comments (WORK form only)
      // Migration: if work-specific key missing but generic exists, migrate
      if (!localStorage.getItem("dps_approver_to_safety_comments_work")) {
        const legacyATS = localStorage.getItem(
          "dps_approver_to_safety_comments",
        );
        if (legacyATS) {
          localStorage.setItem(
            "dps_approver_to_safety_comments_work",
            legacyATS,
          );
        }
      }
      const rawATS = localStorage.getItem(
        "dps_approver_to_safety_comments_work",
      );
      if (rawATS) {
        const s = JSON.parse(rawATS);
        update({
          approverToSafetyRequireUrgent: !!s.approverToSafetyRequireUrgent,
          approverToSafetySafetyManagerApproval:
            !!s.approverToSafetySafetyManagerApproval,
          approverToSafetyPlannedShutdown: !!s.approverToSafetyPlannedShutdown,
          approverToSafetyPlannedShutdownDate:
            s.approverToSafetyPlannedShutdownDate || "",
          approverToSafetyCustomComments:
            s.approverToSafetyCustomComments || [],
        });
      }
      // Header fields
      const header = localStorage.getItem("dps_permit_header");
      if (header) {
        const h = JSON.parse(header);
        update({
          // ensure permitDocType is honored so HT/Gas views render correctly
          permitDocType: h.permitDocType || "work",
          permitRequester: h.permitRequester || "",
          permitApprover1: h.permitApprover1 || "",
          permitApprover2: h.permitApprover2 || "",
          safetyManager: h.safetyManager || "",
          permitIssueDate: h.permitIssueDate || "",
          expectedReturnDate: h.expectedReturnDate || "",
          certificateNumber: h.certificateNumber || "",
          permitNumber: h.permitNumber || "",
        });
      }
    } catch (e) {
      // ignore
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<SafetyOfficerPermitForm>) =>
    setForm((s) => ({ ...s, ...patch }));

  // Persist SafetyOfficer comments for Safety Officer section
  useEffect(() => {
    try {
      const payload = {
        SafetyOfficerRequireUrgent: !!form.SafetyOfficerRequireUrgent,
        SafetyOfficerSafetyManagerApproval:
          !!form.SafetyOfficerSafetyManagerApproval,
        SafetyOfficerPlannedShutdown: !!form.SafetyOfficerPlannedShutdown,
        SafetyOfficerPlannedShutdownDate:
          form.SafetyOfficerPlannedShutdownDate || "",
        SafetyOfficerCustomComments: form.SafetyOfficerCustomComments || [],
      };
      // Write to work-specific key so Approver Work view can read it
      localStorage.setItem(
        "dps_SafetyOfficer_comments_work",
        JSON.stringify(payload),
      );
      // Legacy write for backward compatibility
      localStorage.setItem(
        "dps_SafetyOfficer_comments",
        JSON.stringify(payload),
      );
    } catch (e) {
      // ignore
    }
  }, [
    form.SafetyOfficerRequireUrgent,
    form.SafetyOfficerSafetyManagerApproval,
    form.SafetyOfficerPlannedShutdown,
    form.SafetyOfficerPlannedShutdownDate,
    form.SafetyOfficerCustomComments,
  ]);

  // Persist SafetyOfficer -> Approver comments
  useEffect(() => {
    try {
      const payload = {
        safetyToApproverRequireUrgent: !!form.safetyToApproverRequireUrgent,
        safetyToApproverSafetyManagerApproval:
          !!form.safetyToApproverSafetyManagerApproval,
        safetyToApproverPlannedShutdown: !!form.safetyToApproverPlannedShutdown,
        safetyToApproverPlannedShutdownDate:
          form.safetyToApproverPlannedShutdownDate || "",
        safetyToApproverCustomComments:
          form.safetyToApproverCustomComments || [],
      };
      // Write HT-specific key so Approver HT view can read it
      localStorage.setItem(
        "dps_safety_to_approver_comments_ht",
        JSON.stringify(payload),
      );
      // Legacy write for backward compatibility
      localStorage.setItem(
        "dps_safety_to_approver_comments",
        JSON.stringify(payload),
      );

      // Additionally, persist a Requester-specific copy for Work permit view
      // so that the Requester can see "Comments from Safety Officer" in their form
      const requesterPayload = {
        safetyToRequesterRequireUrgent: !!form.safetyToApproverRequireUrgent,
        safetyToRequesterSafetyManagerApproval:
          !!form.safetyToApproverSafetyManagerApproval,
        safetyToRequesterPlannedShutdown:
          !!form.safetyToApproverPlannedShutdown,
        safetyToRequesterPlannedShutdownDate:
          form.safetyToApproverPlannedShutdownDate || "",
        safetyToRequesterCustomComments:
          form.safetyToApproverCustomComments || [],
      };
      // Write Work-specific key for Requester page consumption
      localStorage.setItem(
        "dps_safety_to_requester_comments_work",
        JSON.stringify(requesterPayload),
      );
      // Legacy generic key for any non-work specific consumers
      localStorage.setItem(
        "dps_safety_to_requester_comments",
        JSON.stringify(requesterPayload),
      );
    } catch (e) {
      // ignore
    }
  }, [
    form.safetyToApproverRequireUrgent,
    form.safetyToApproverSafetyManagerApproval,
    form.safetyToApproverPlannedShutdown,
    form.safetyToApproverPlannedShutdownDate,
    form.safetyToApproverCustomComments,
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 pb-6 space-y-6">
        {/* Section 1: Permit Overview - Detached */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
                Details of such permit
              </div>

              {/* Permit Header */}
              <div className="mt-6 mb-6">
                <div>
                  <div className="text-sm text-slate-600 font-bold">
                    Permit Type
                  </div>
                  <div className="text-sm text-slate-600">
                    {form.permitDocType === "highTension"
                      ? "High Tension Line Work Permit"
                      : form.permitDocType === "gasLine"
                        ? "Gas Line Work Permit"
                        : "Work Permit"}
                  </div>
                </div>
              </div>

              {/* Permit Details in 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-600 mb-1 font-bold">
                    Work Description
                  </div>
                  <div className="text-sm text-slate-700">
                    {form.permitDocType === "work"
                      ? "Welding work near fuel line"
                      : form.permitDocType === "highTension"
                        ? "High-voltage panel maintenance"
                        : "Gas line inspection and testing"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1 font-bold">
                    Location
                  </div>
                  <div className="text-sm text-slate-700">Plant A - Bay 3</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1 font-bold">
                    Estimated Duration
                  </div>
                  <div className="text-sm text-slate-700">3 hrs</div>
                </div>
                <div>
                  <div className="text-xs text-slate-600 mb-1 font-bold">
                    Requester
                  </div>
                  <div className="text-sm text-slate-700">
                    {form.permitRequester || "Jane Doe"} • Maintenance
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company header under progress for Safety Officer */}
        <div className="bg-white border-b">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-start justify-between gap-4">
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
                {form.permitDocType === "highTension"
                  ? "ADDITIONAL WORK PERMIT FOR HIGH TENSION LINE/Equipment"
                  : form.permitDocType === "gasLine"
                    ? "ADDITIONAL WORK PERMIT FOR GAS LINE"
                    : "PERMIT TO WORK"}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-[240px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Certificate No.
                </label>
                <input
                  value={form.certificateNumber || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    update({ certificateNumber: v });
                    try {
                      const header = JSON.parse(
                        localStorage.getItem("dps_permit_header") || "{}",
                      );
                      header.certificateNumber = v;
                      localStorage.setItem(
                        "dps_permit_header",
                        JSON.stringify(header),
                      );
                    } catch {}
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permit No.
                </label>
                <input
                  value={form.permitNumber || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    update({ permitNumber: v });
                    try {
                      const header = JSON.parse(
                        localStorage.getItem("dps_permit_header") || "{}",
                      );
                      header.permitNumber = v;
                      localStorage.setItem(
                        "dps_permit_header",
                        JSON.stringify(header),
                      );
                    } catch {}
                  }}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Requester Form Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Preview Requester Form
          </button>
        </div>

        {showPreviewModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/100 backdrop-blur-md"
              onClick={() => setShowPreviewModal(false)}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />

            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div />
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreviewModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Render the appropriate preview component */}
              {form.permitDocType === "highTension" ? (
                <HTPermitPreview />
              ) : form.permitDocType === "gasLine" ? (
                (() => {
                  const gasData = {
                    header: {
                      certificateNo: form.certificateNumber || "",
                      permitNo: form.permitNumber || "",
                    },
                    partA: {
                      issuerName: form.permitRequester || "",
                      crossRef: "",
                      department: form.safetyManager || "",
                      location: "Plant A - Bay 3",
                      description: "Gas line work",
                      fromDate: form.permitIssueDate || "",
                      fromTime: "08:00",
                      toDate: form.expectedReturnDate || "",
                      toTime: "17:00",
                    },
                    partB: [],
                    partD: { confirmation: false },
                    partE: {
                      acceptor: {},
                      issuer: {},
                      acceptorConfirmed: false,
                      closed: false,
                    },
                  } as any;
                  return <GasPermitPreview data={gasData} />;
                })()
              ) : (
                <PermitPreview
                  form={{
                    permitNumber: form.permitNumber || "",
                    certificateNumber: form.certificateNumber || "",
                    permitType: form.permitType === "hot" ? "hot" : "cold",
                    title: "Permit Preview",
                    attachments: [],
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* Section 2: Permit Details & Comments */}
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="mt-6 space-y-4">
                {/* Top requester/approver fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-600 mb-1 font-bold">
                      Permit Requester
                    </div>
                    <input
                      type="text"
                      placeholder="Search user..."
                      className="w-full rounded border px-3 py-2"
                      value={form.permitRequester || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        update({ permitRequester: v });
                        try {
                          const header = JSON.parse(
                            localStorage.getItem("dps_permit_header") || "{}",
                          );
                          header.permitRequester = v;
                          localStorage.setItem(
                            "dps_permit_header",
                            JSON.stringify(header),
                          );
                        } catch {}
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1 font-bold">
                      Permit Approver 1
                    </div>
                    <input
                      type="text"
                      placeholder="Approver name or role"
                      className="w-full rounded border px-3 py-2"
                      value={form.permitApprover1 || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        update({ permitApprover1: v });
                        try {
                          const header = JSON.parse(
                            localStorage.getItem("dps_permit_header") || "{}",
                          );
                          header.permitApprover1 = v;
                          localStorage.setItem(
                            "dps_permit_header",
                            JSON.stringify(header),
                          );
                        } catch {}
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1 font-bold">
                      Permit Approver 2
                    </div>
                    <input
                      type="text"
                      placeholder="Approver name or role"
                      className="w-full rounded border px-3 py-2"
                      value={form.permitApprover2 || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        update({ permitApprover2: v });
                        try {
                          const header = JSON.parse(
                            localStorage.getItem("dps_permit_header") || "{}",
                          );
                          header.permitApprover2 = v;
                          localStorage.setItem(
                            "dps_permit_header",
                            JSON.stringify(header),
                          );
                        } catch {}
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1 font-bold">
                      Safety Manager
                    </div>
                    <input
                      type="text"
                      placeholder="Safety Manager name/department"
                      className="w-full rounded border px-3 py-2"
                      value={form.safetyManager || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        update({ safetyManager: v });
                        try {
                          const header = JSON.parse(
                            localStorage.getItem("dps_permit_header") || "{}",
                          );
                          header.safetyManager = v;
                          localStorage.setItem(
                            "dps_permit_header",
                            JSON.stringify(header),
                          );
                        } catch {}
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-600 mb-1 font-bold">
                      Permit Issue Date
                    </div>
                    <input
                      type="date"
                      className="w-full rounded border px-3 py-2"
                      value={form.permitIssueDate || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        update({ permitIssueDate: v });
                        try {
                          const header = JSON.parse(
                            localStorage.getItem("dps_permit_header") || "{}",
                          );
                          header.permitIssueDate = v;
                          localStorage.setItem(
                            "dps_permit_header",
                            JSON.stringify(header),
                          );
                        } catch {}
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1 font-bold">
                      Expected Return Date
                    </div>
                    <input
                      type="date"
                      className="w-full rounded border px-3 py-2"
                      value={form.expectedReturnDate || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        update({ expectedReturnDate: v });
                        try {
                          const header = JSON.parse(
                            localStorage.getItem("dps_permit_header") || "{}",
                          );
                          header.expectedReturnDate = v;
                          localStorage.setItem(
                            "dps_permit_header",
                            JSON.stringify(header),
                          );
                        } catch {}
                      }}
                    />
                  </div>
                </div>

                {/* Comments from Requester */}
                <div className="mt-2 bg-yellow-50 p-3 rounded-md">
                  <div className="text-md font-medium">
                    Comments from Requester:
                  </div>
                  <div className="mt-2 space-y-1 text-sm">
                    {form.requesterRequireUrgent && (
                      <div>Require on urgent basis</div>
                    )}
                    {form.requesterSafetyManagerApproval && (
                      <div>Safety Manager approval required</div>
                    )}
                    {(form.requesterPlannedShutdown ||
                      form.requesterPlannedShutdownDate) && (
                      <div>
                        Planned shutdown on:{" "}
                        {form.requesterPlannedShutdownDate || ""}
                      </div>
                    )}
                    {(form.requesterCustomComments || []).map((it, idx) => (
                      <div key={idx}>
                        - {typeof it === "string" ? it : it.text}
                      </div>
                    ))}
                    {!form.requesterRequireUrgent &&
                      !form.requesterSafetyManagerApproval &&
                      !(
                        form.requesterPlannedShutdown ||
                        form.requesterPlannedShutdownDate
                      ) &&
                      (form.requesterCustomComments || []).length === 0 && (
                        <div className="text-gray-500">
                          No comments from requester yet.
                        </div>
                      )}
                  </div>
                </div>

                {/* Specific Comments for Requester — SafetyOfficer can set */}
                <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                  <div className="text-md font-medium">
                    Comments for Requester:
                  </div>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={!!form.safetyToApproverRequireUrgent}
                      onChange={(e) =>
                        update({
                          safetyToApproverRequireUrgent: e.target.checked,
                        })
                      }
                    />
                    Require on urgent basis
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={!!form.safetyToApproverSafetyManagerApproval}
                      onChange={(e) =>
                        update({
                          safetyToApproverSafetyManagerApproval:
                            e.target.checked,
                        })
                      }
                    />
                    Safety Manager approval required
                  </label>
                  <div className="mt-2 text-md flex items-center gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!form.safetyToApproverPlannedShutdown}
                        onChange={(e) =>
                          update({
                            safetyToApproverPlannedShutdown: e.target.checked,
                          })
                        }
                      />
                      <span>Planned shutdown on:</span>
                    </label>
                    <input
                      type="date"
                      className="rounded border px-2 py-1 text-sm"
                      value={form.safetyToApproverPlannedShutdownDate || ""}
                      onChange={(e) =>
                        update({
                          safetyToApproverPlannedShutdownDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Safety -> Approver custom comments */}
                  <div className="mt-3">
                    <div className="mt-2 space-y-1">
                      {(form.safetyToApproverCustomComments || []).map(
                        (item: any, idx: number) => {
                          const text =
                            typeof item === "string" ? item : item.text;
                          const checked =
                            typeof item === "string" ? false : !!item.checked;
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
                                      form.safetyToApproverCustomComments || [];
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
                                    update({
                                      safetyToApproverCustomComments: next,
                                    });
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
                                      form.safetyToApproverCustomComments || [];
                                    const next = prev.filter(
                                      (_: any, i: number) => i !== idx,
                                    );
                                    update({
                                      safetyToApproverCustomComments: next,
                                    });
                                  }}
                                  className="text-xs text-red-600 hover:underline px-2 py-1"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {/* Add new comment input */}
                    <div className="text-xs font-medium mt-2">Add comment</div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add comment"
                        value={newSafetyToApproverComment}
                        onChange={(e) =>
                          setNewSafetyToApproverComment(e.target.value)
                        }
                        className="flex-1 border rounded px-2 py-1"
                      />
                      <button
                        className="px-3 py-1 rounded bg-white border text-sm"
                        onClick={() => {
                          const v = newSafetyToApproverComment.trim();
                          if (!v) return;
                          const prev =
                            form.safetyToApproverCustomComments || [];
                          const next = [...prev, { text: v, checked: false }];
                          update({ safetyToApproverCustomComments: next });
                          setNewSafetyToApproverComment("");
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specific Comments for Approver — SafetyOfficer can set */}
                <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                  <div className="text-md font-medium">
                    Comments for Approver:
                  </div>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={!!form.SafetyOfficerRequireUrgent}
                      onChange={(e) =>
                        update({ SafetyOfficerRequireUrgent: e.target.checked })
                      }
                    />
                    Require on urgent basis
                  </label>
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={!!form.SafetyOfficerSafetyManagerApproval}
                      onChange={(e) =>
                        update({
                          SafetyOfficerSafetyManagerApproval: e.target.checked,
                        })
                      }
                    />
                    Safety Manager approval required
                  </label>
                  <div className="mt-2 text-md flex items-center gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!form.SafetyOfficerPlannedShutdown}
                        onChange={(e) =>
                          update({
                            SafetyOfficerPlannedShutdown: e.target.checked,
                          })
                        }
                      />
                      <span>Planned shutdown on:</span>
                    </label>
                    <input
                      type="date"
                      className="rounded border px-2 py-1 text-sm"
                      value={form.SafetyOfficerPlannedShutdownDate || ""}
                      onChange={(e) =>
                        update({
                          SafetyOfficerPlannedShutdownDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* SafetyOfficer custom comments */}
                  <div className="mt-3">
                    <div className="mt-2 space-y-1">
                      {(form.SafetyOfficerCustomComments || []).map(
                        (item: any, idx: number) => {
                          const text =
                            typeof item === "string" ? item : item.text;
                          const checked =
                            typeof item === "string" ? false : !!item.checked;
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
                                      form.SafetyOfficerCustomComments || [];
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
                                    update({
                                      SafetyOfficerCustomComments: next,
                                    });
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
                                      form.SafetyOfficerCustomComments || [];
                                    const next = prev.filter(
                                      (_: any, i: number) => i !== idx,
                                    );
                                    update({
                                      SafetyOfficerCustomComments: next,
                                    });
                                  }}
                                  className="text-xs text-red-600 hover:underline px-2 py-1"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {/* Add new comment input */}
                    <div className="text-xs font-medium mt-2">Add comment</div>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add comment"
                        value={newSafetyOfficerComment}
                        onChange={(e) =>
                          setNewSafetyOfficerComment(e.target.value)
                        }
                        className="flex-1 border rounded px-2 py-1"
                      />
                      <button
                        className="px-3 py-1 rounded bg-white border text-sm"
                        onClick={() => {
                          const v = newSafetyOfficerComment.trim();
                          if (!v) return;
                          const prev = form.SafetyOfficerCustomComments || [];
                          const next = [...prev, { text: v, checked: false }];
                          update({ SafetyOfficerCustomComments: next });
                          setNewSafetyOfficerComment("");
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons at Bottom */}
      <div className="mx-auto max-w-7xl px-4 pb-6">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => alert("Approve (placeholder)")}
            className="px-4 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => alert("Reject (placeholder)")}
            disabled={!(() => {
              // Check if at least one comment is selected for Requester
              const requesterCommentChecked = (form.safetyToApproverCustomComments || []).some(
                (item: any) => typeof item === "object" && item.checked
              );

              // Check if at least one comment is selected for Approver
              const approverCommentChecked = (form.SafetyOfficerCustomComments || []).some(
                (item: any) => typeof item === "object" && item.checked
              );

              // Also include the boolean flags as valid selections
              const requesterHasSelection = requesterCommentChecked ||
                form.safetyToApproverRequireUrgent ||
                form.safetyToApproverSafetyManagerApproval ||
                form.safetyToApproverPlannedShutdown;

              const approverHasSelection = approverCommentChecked ||
                form.SafetyOfficerRequireUrgent ||
                form.SafetyOfficerSafetyManagerApproval ||
                form.SafetyOfficerPlannedShutdown;

              // Both sections must have at least one comment selected
              return requesterHasSelection && approverHasSelection;
            })()}
            className="px-4 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

// Reusable section for embedding (e.g., HT wizard)
export function SafetyHTPermitDetailsSection() {
  const [form, setForm] = useState<SafetyOfficerPermitForm>(() => DEFAULT_FORM);
  const [newSafetyOfficerComment, setNewSafetyOfficerComment] = useState("");
  const [newSafetyToApproverComment, setNewSafetyToApproverComment] =
    useState("");

  const update = (patch: Partial<SafetyOfficerPermitForm>) =>
    setForm((s) => ({ ...s, ...patch }));

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("dps_requester_safety_comments_ht");
      if (raw) {
        const data = JSON.parse(raw);
        update({
          requesterRequireUrgent: !!data.requesterSafetyRequireUrgent,
          requesterSafetyManagerApproval:
            !!data.requesterSafetySafetyManagerApproval,
          requesterPlannedShutdown: !!data.requesterSafetyPlannedShutdown,
          requesterPlannedShutdownDate:
            data.requesterSafetyPlannedShutdownDate || "",
          requesterCustomComments: data.requesterSafetyCustomComments || [],
        });
      }
      const rawApprover = localStorage.getItem("dps_approver_comments");
      if (rawApprover) {
        const a = JSON.parse(rawApprover);
        update({
          approverRequireUrgent: !!a.approverRequireUrgent,
          approverSafetyManagerApproval: !!a.approverSafetyManagerApproval,
          approverPlannedShutdown: !!a.approverPlannedShutdown,
          approverPlannedShutdownDate: a.approverPlannedShutdownDate || "",
          approverCustomComments: a.approverCustomComments || [],
        });
      }
      const rawATS = localStorage.getItem("dps_approver_to_safety_comments_ht");
      if (rawATS) {
        const s = JSON.parse(rawATS);
        update({
          approverToSafetyRequireUrgent: !!s.approverToSafetyRequireUrgent,
          approverToSafetySafetyManagerApproval:
            !!s.approverToSafetySafetyManagerApproval,
          approverToSafetyPlannedShutdown: !!s.approverToSafetyPlannedShutdown,
          approverToSafetyPlannedShutdownDate:
            s.approverToSafetyPlannedShutdownDate || "",
          approverToSafetyCustomComments:
            s.approverToSafetyCustomComments || [],
        });
      }
      const header = localStorage.getItem("dps_permit_header");
      if (header) {
        const h = JSON.parse(header);
        update({
          permitRequester: h.permitRequester || "",
          permitApprover1: h.permitApprover1 || "",
          permitApprover2: h.permitApprover2 || "",
          safetyManager: h.safetyManager || "",
          permitIssueDate: h.permitIssueDate || "",
          expectedReturnDate: h.expectedReturnDate || "",
          certificateNumber: h.certificateNumber || "",
          permitNumber: h.permitNumber || "",
        });
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist SafetyOfficer comments for Safety Officer section
  useEffect(() => {
    try {
      const payload = {
        SafetyOfficerRequireUrgent: !!form.SafetyOfficerRequireUrgent,
        SafetyOfficerSafetyManagerApproval:
          !!form.SafetyOfficerSafetyManagerApproval,
        SafetyOfficerPlannedShutdown: !!form.SafetyOfficerPlannedShutdown,
        SafetyOfficerPlannedShutdownDate:
          form.SafetyOfficerPlannedShutdownDate || "",
        SafetyOfficerCustomComments: form.SafetyOfficerCustomComments || [],
      };
      // Write HT-specific key so Approver HT view can read it
      localStorage.setItem(
        "dps_SafetyOfficer_comments_ht",
        JSON.stringify(payload),
      );
      // Legacy write for backward compatibility
      localStorage.setItem(
        "dps_SafetyOfficer_comments",
        JSON.stringify(payload),
      );
    } catch (e) {
      // ignore
    }
  }, [
    form.SafetyOfficerRequireUrgent,
    form.SafetyOfficerSafetyManagerApproval,
    form.SafetyOfficerPlannedShutdown,
    form.SafetyOfficerPlannedShutdownDate,
    form.SafetyOfficerCustomComments,
  ]);

  // Persist SafetyOfficer -> Approver comments
  useEffect(() => {
    try {
      const payload = {
        safetyToApproverRequireUrgent: !!form.safetyToApproverRequireUrgent,
        safetyToApproverSafetyManagerApproval:
          !!form.safetyToApproverSafetyManagerApproval,
        safetyToApproverPlannedShutdown: !!form.safetyToApproverPlannedShutdown,
        safetyToApproverPlannedShutdownDate:
          form.safetyToApproverPlannedShutdownDate || "",
        safetyToApproverCustomComments:
          form.safetyToApproverCustomComments || [],
      };
      // Write HT-specific key so Approver HT view can read it
      localStorage.setItem(
        "dps_safety_to_approver_comments_ht",
        JSON.stringify(payload),
      );
      // Legacy write for backward compatibility
      localStorage.setItem(
        "dps_safety_to_approver_comments",
        JSON.stringify(payload),
      );

      // Additionally, persist a Requester-specific copy for HT permit view
      // so that the Requester can see "Comments from Safety Officer" in their HT form
      const requesterPayload = {
        safetyToRequesterRequireUrgent: !!form.SafetyOfficerRequireUrgent,
        safetyToRequesterSafetyManagerApproval:
          !!form.SafetyOfficerSafetyManagerApproval,
        safetyToRequesterPlannedShutdown: !!form.SafetyOfficerPlannedShutdown,
        safetyToRequesterPlannedShutdownDate:
          form.SafetyOfficerPlannedShutdownDate || "",
        safetyToRequesterCustomComments: form.SafetyOfficerCustomComments || [],
      };
      // Write HT-specific key for Requester page consumption
      localStorage.setItem(
        "dps_safety_to_requester_comments_ht",
        JSON.stringify(requesterPayload),
      );
      // Legacy generic key for any non-HT specific consumers
      localStorage.setItem(
        "dps_safety_to_requester_comments",
        JSON.stringify(requesterPayload),
      );
    } catch (e) {
      // ignore
    }
  }, [
    form.safetyToApproverRequireUrgent,
    form.safetyToApproverSafetyManagerApproval,
    form.safetyToApproverPlannedShutdown,
    form.safetyToApproverPlannedShutdownDate,
    form.safetyToApproverCustomComments,
    // Also depend on SafetyOfficer comments for requester
    form.SafetyOfficerRequireUrgent,
    form.SafetyOfficerSafetyManagerApproval,
    form.SafetyOfficerPlannedShutdown,
    form.SafetyOfficerPlannedShutdownDate,
    form.SafetyOfficerCustomComments,
  ]);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
            Details of such permit
          </div>

          <div className="mt-4 space-y-4">
            {/* Header fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Permit Requester
                </div>
                <input
                  type="text"
                  placeholder="Search user..."
                  className="w-full rounded border px-3 py-2"
                  value={form.permitRequester || ""}
                  onChange={(e) => update({ permitRequester: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Permit Approver 1
                </div>
                <input
                  type="text"
                  placeholder="Approver name or role"
                  className="w-full rounded border px-3 py-2"
                  value={form.permitApprover1 || ""}
                  onChange={(e) => update({ permitApprover1: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Permit Approver 2
                </div>
                <input
                  type="text"
                  placeholder="Approver name or role"
                  className="w-full rounded border px-3 py-2"
                  value={form.permitApprover2 || ""}
                  onChange={(e) => update({ permitApprover2: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Safety Manager
                </div>
                <input
                  type="text"
                  placeholder="Safety Manager name/department"
                  className="w-full rounded border px-3 py-2"
                  value={form.safetyManager || ""}
                  onChange={(e) => update({ safetyManager: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Permit Issue Date
                </div>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2"
                  value={form.permitIssueDate || ""}
                  onChange={(e) => update({ permitIssueDate: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Expected Return Date
                </div>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2"
                  value={form.expectedReturnDate || ""}
                  onChange={(e) =>
                    update({ expectedReturnDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Comments from Requester */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">
                Comments from Requester:
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {form.requesterRequireUrgent && (
                  <div>Require on urgent basis</div>
                )}
                {form.requesterSafetyManagerApproval && (
                  <div>Safety Manager approval required</div>
                )}
                {(form.requesterPlannedShutdown ||
                  form.requesterPlannedShutdownDate) && (
                  <div>
                    Planned shutdown on:{" "}
                    {form.requesterPlannedShutdownDate || ""}
                  </div>
                )}
                {(form.requesterCustomComments || []).map((it, idx) => (
                  <div key={idx}>- {typeof it === "string" ? it : it.text}</div>
                ))}
                {!form.requesterRequireUrgent &&
                  !form.requesterSafetyManagerApproval &&
                  !(
                    form.requesterPlannedShutdown ||
                    form.requesterPlannedShutdownDate
                  ) &&
                  (form.requesterCustomComments || []).length === 0 && (
                    <div className="text-gray-500">
                      No comments from requester yet.
                    </div>
                  )}
              </div>
            </div>

            {/* Comments from Approver — only Approver -> Safety for HT */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">Comments from Approver:</div>
              <div className="mt-2 space-y-1 text-sm">
                {form.approverToSafetyRequireUrgent && (
                  <div>Require on urgent basis</div>
                )}
                {form.approverToSafetySafetyManagerApproval && (
                  <div>Safety Manager approval required</div>
                )}
                {(form.approverToSafetyPlannedShutdown ||
                  form.approverToSafetyPlannedShutdownDate) && (
                  <div>
                    Planned shutdown on:{" "}
                    {form.approverToSafetyPlannedShutdownDate || ""}
                  </div>
                )}
                {(form.approverToSafetyCustomComments || []).map((it, idx) => (
                  <div key={`ats-${idx}`}>
                    - {typeof it === "string" ? it : it.text}
                  </div>
                ))}
                {!form.approverToSafetyRequireUrgent &&
                  !form.approverToSafetySafetyManagerApproval &&
                  !(
                    form.approverToSafetyPlannedShutdown ||
                    form.approverToSafetyPlannedShutdownDate
                  ) &&
                  (form.approverToSafetyCustomComments || []).length === 0 && (
                    <div className="text-gray-500">
                      No comments from approver yet.
                    </div>
                  )}
              </div>
            </div>

            {/* Comments from Safety Officer — editable */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">Comments for Requester:</div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.SafetyOfficerRequireUrgent}
                  onChange={(e) =>
                    update({ SafetyOfficerRequireUrgent: e.target.checked })
                  }
                />
                Require on urgent basis
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.SafetyOfficerSafetyManagerApproval}
                  onChange={(e) =>
                    update({
                      SafetyOfficerSafetyManagerApproval: e.target.checked,
                    })
                  }
                />
                Safety Manager approval required
              </label>
              <div className="mt-2 text-md flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.SafetyOfficerPlannedShutdown}
                    onChange={(e) =>
                      update({ SafetyOfficerPlannedShutdown: e.target.checked })
                    }
                  />
                  <span>Planned shutdown on:</span>
                </label>
                <input
                  type="date"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.SafetyOfficerPlannedShutdownDate || ""}
                  onChange={(e) =>
                    update({ SafetyOfficerPlannedShutdownDate: e.target.value })
                  }
                />
              </div>

              {/* SafetyOfficer custom comments */}
              <div className="mt-3">
                <div className="mt-2 space-y-1">
                  {(form.SafetyOfficerCustomComments || []).map(
                    (item: any, idx: number) => {
                      const text = typeof item === "string" ? item : item.text;
                      const checked =
                        typeof item === "string" ? false : !!item.checked;
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
                                  form.SafetyOfficerCustomComments || [];
                                const next = prev.map((it: any, i: number) => {
                                  if (i !== idx) return it;
                                  if (typeof it === "string")
                                    return {
                                      text: it,
                                      checked: e.target.checked,
                                    };
                                  return { ...it, checked: e.target.checked };
                                });
                                update({ SafetyOfficerCustomComments: next });
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
                                  form.SafetyOfficerCustomComments || [];
                                const next = prev.filter(
                                  (_: any, i: number) => i !== idx,
                                );
                                update({ SafetyOfficerCustomComments: next });
                              }}
                              className="text-xs text-red-600 hover:underline px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                <div className="text-xs font-medium mt-2">Add comment</div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add comment"
                    value={newSafetyOfficerComment}
                    onChange={(e) => setNewSafetyOfficerComment(e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                  />
                  <button
                    className="px-3 py-1 rounded bg-white border text-sm"
                    onClick={() => {
                      const v = newSafetyOfficerComment.trim();
                      if (!v) return;
                      const prev = form.SafetyOfficerCustomComments || [];
                      const next = [...prev, { text: v, checked: false }];
                      update({ SafetyOfficerCustomComments: next });
                      setNewSafetyOfficerComment("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Specific Comments for Approver — SafetyOfficer can set */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">Comments for Approver:</div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.safetyToApproverRequireUrgent}
                  onChange={(e) =>
                    update({ safetyToApproverRequireUrgent: e.target.checked })
                  }
                />
                Require on urgent basis
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.safetyToApproverSafetyManagerApproval}
                  onChange={(e) =>
                    update({
                      safetyToApproverSafetyManagerApproval: e.target.checked,
                    })
                  }
                />
                Safety Manager approval required
              </label>
              <div className="mt-2 text-md flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.safetyToApproverPlannedShutdown}
                    onChange={(e) =>
                      update({
                        safetyToApproverPlannedShutdown: e.target.checked,
                      })
                    }
                  />
                  <span>Planned shutdown on:</span>
                </label>
                <input
                  type="date"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.safetyToApproverPlannedShutdownDate || ""}
                  onChange={(e) =>
                    update({
                      safetyToApproverPlannedShutdownDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* Safety -> Approver custom comments */}
              <div className="mt-3">
                <div className="mt-2 space-y-1">
                  {(form.safetyToApproverCustomComments || []).map(
                    (item: any, idx: number) => {
                      const text = typeof item === "string" ? item : item.text;
                      const checked =
                        typeof item === "string" ? false : !!item.checked;
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
                                  form.safetyToApproverCustomComments || [];
                                const next = prev.map((it: any, i: number) => {
                                  if (i !== idx) return it;
                                  if (typeof it === "string")
                                    return {
                                      text: it,
                                      checked: e.target.checked,
                                    };
                                  return { ...it, checked: e.target.checked };
                                });
                                update({
                                  safetyToApproverCustomComments: next,
                                });
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
                                  form.safetyToApproverCustomComments || [];
                                const next = prev.filter(
                                  (_: any, i: number) => i !== idx,
                                );
                                update({
                                  safetyToApproverCustomComments: next,
                                });
                              }}
                              className="text-xs text-red-600 hover:underline px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
                <div className="text-xs font-medium mt-2">Add comment</div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add comment"
                    value={newSafetyToApproverComment}
                    onChange={(e) =>
                      setNewSafetyToApproverComment(e.target.value)
                    }
                    className="flex-1 border rounded px-2 py-1"
                  />
                  <button
                    className="px-3 py-1 rounded bg-white border text-sm"
                    onClick={() => {
                      const v = newSafetyToApproverComment.trim();
                      if (!v) return;
                      const prev = form.safetyToApproverCustomComments || [];
                      const next = [...prev, { text: v, checked: false }];
                      update({ safetyToApproverCustomComments: next });
                      setNewSafetyToApproverComment("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable section for Gas permit (GL = Gas Line)
export function SafetyGLPermitDetailsSection() {
  const [form, setForm] = useState<SafetyOfficerPermitForm>(() => DEFAULT_FORM);
  const [newSafetyOfficerComment, setNewSafetyOfficerComment] = useState("");
  const [newSafetyToApproverComment, setNewSafetyToApproverComment] =
    useState("");

  const update = (patch: Partial<SafetyOfficerPermitForm>) =>
    setForm((s) => ({ ...s, ...patch }));

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("dps_requester_safety_comments_gas");
      if (raw) {
        const data = JSON.parse(raw);
        update({
          requesterRequireUrgent: !!data.requesterSafetyRequireUrgent,
          requesterSafetyManagerApproval:
            !!data.requesterSafetySafetyManagerApproval,
          requesterPlannedShutdown: !!data.requesterSafetyPlannedShutdown,
          requesterPlannedShutdownDate:
            data.requesterSafetyPlannedShutdownDate || "",
          requesterCustomComments: data.requesterSafetyCustomComments || [],
        });
      }
      const rawApprover = localStorage.getItem("dps_approver_comments_gas");
      if (rawApprover) {
        const a = JSON.parse(rawApprover);
        update({
          approverRequireUrgent: !!a.approverRequireUrgent,
          approverSafetyManagerApproval: !!a.approverSafetyManagerApproval,
          approverPlannedShutdown: !!a.approverPlannedShutdown,
          approverPlannedShutdownDate: a.approverPlannedShutdownDate || "",
          approverCustomComments: a.approverCustomComments || [],
        });
      }
      const rawATS = localStorage.getItem(
        "dps_approver_to_safety_comments_gas",
      );
      if (rawATS) {
        const s = JSON.parse(rawATS);
        update({
          approverToSafetyRequireUrgent: !!s.approverToSafetyRequireUrgent,
          approverToSafetySafetyManagerApproval:
            !!s.approverToSafetySafetyManagerApproval,
          approverToSafetyPlannedShutdown: !!s.approverToSafetyPlannedShutdown,
          approverToSafetyPlannedShutdownDate:
            s.approverToSafetyPlannedShutdownDate || "",
          approverToSafetyCustomComments:
            s.approverToSafetyCustomComments || [],
        });
      }
      const header = localStorage.getItem("dps_permit_header");
      if (header) {
        const h = JSON.parse(header);
        update({
          permitRequester: h.permitRequester || "",
          permitApprover1: h.permitApprover1 || "",
          permitApprover2: h.permitApprover2 || "",
          safetyManager: h.safetyManager || "",
          permitIssueDate: h.permitIssueDate || "",
          expectedReturnDate: h.expectedReturnDate || "",
          certificateNumber: h.certificateNumber || "",
          permitNumber: h.permitNumber || "",
        });
      }
    } catch (e) {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist SafetyOfficer comments for Safety Officer section
  useEffect(() => {
    try {
      const payload = {
        SafetyOfficerRequireUrgent: !!form.SafetyOfficerRequireUrgent,
        SafetyOfficerSafetyManagerApproval:
          !!form.SafetyOfficerSafetyManagerApproval,
        SafetyOfficerPlannedShutdown: !!form.SafetyOfficerPlannedShutdown,
        SafetyOfficerPlannedShutdownDate:
          form.SafetyOfficerPlannedShutdownDate || "",
        SafetyOfficerCustomComments: form.SafetyOfficerCustomComments || [],
      };
      // Write gas-specific key so Approver gas view can read it
      localStorage.setItem(
        "dps_SafetyOfficer_comments_gas",
        JSON.stringify(payload),
      );
      // Legacy write for backward compatibility
      localStorage.setItem(
        "dps_SafetyOfficer_comments",
        JSON.stringify(payload),
      );
    } catch (e) {
      // ignore
    }
  }, [
    form.SafetyOfficerRequireUrgent,
    form.SafetyOfficerSafetyManagerApproval,
    form.SafetyOfficerPlannedShutdown,
    form.SafetyOfficerPlannedShutdownDate,
    form.SafetyOfficerCustomComments,
  ]);

  // Persist SafetyOfficer -> Approver comments
  useEffect(() => {
    try {
      const payload = {
        safetyToApproverRequireUrgent: !!form.safetyToApproverRequireUrgent,
        safetyToApproverSafetyManagerApproval:
          !!form.safetyToApproverSafetyManagerApproval,
        safetyToApproverPlannedShutdown: !!form.safetyToApproverPlannedShutdown,
        safetyToApproverPlannedShutdownDate:
          form.safetyToApproverPlannedShutdownDate || "",
        safetyToApproverCustomComments:
          form.safetyToApproverCustomComments || [],
      };
      // Write gas-specific key so Approver gas view can read it
      localStorage.setItem(
        "dps_safety_to_approver_comments_gas",
        JSON.stringify(payload),
      );
      // Legacy write for backward compatibility
      localStorage.setItem(
        "dps_safety_to_approver_comments",
        JSON.stringify(payload),
      );

      // Additionally, persist a Requester-specific copy for gas permit view
      // so that the Requester can see "Comments from Safety Officer" in their gas form
      const requesterPayload = {
        safetyToRequesterRequireUrgent: !!form.SafetyOfficerRequireUrgent,
        safetyToRequesterSafetyManagerApproval:
          !!form.SafetyOfficerSafetyManagerApproval,
        safetyToRequesterPlannedShutdown: !!form.SafetyOfficerPlannedShutdown,
        safetyToRequesterPlannedShutdownDate:
          form.SafetyOfficerPlannedShutdownDate || "",
        safetyToRequesterCustomComments: form.SafetyOfficerCustomComments || [],
      };
      // Write gas-specific key for Requester page consumption
      localStorage.setItem(
        "dps_safety_to_requester_comments_gas",
        JSON.stringify(requesterPayload),
      );
      // Legacy generic key for any non-gas specific consumers
      localStorage.setItem(
        "dps_safety_to_requester_comments",
        JSON.stringify(requesterPayload),
      );
    } catch (e) {
      // ignore
    }
  }, [
    form.safetyToApproverRequireUrgent,
    form.safetyToApproverSafetyManagerApproval,
    form.safetyToApproverPlannedShutdown,
    form.safetyToApproverPlannedShutdownDate,
    form.safetyToApproverCustomComments,
    // Also depend on SafetyOfficer comments for requester
    form.SafetyOfficerRequireUrgent,
    form.SafetyOfficerSafetyManagerApproval,
    form.SafetyOfficerPlannedShutdown,
    form.SafetyOfficerPlannedShutdownDate,
    form.SafetyOfficerCustomComments,
  ]);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
            Details of such permit
          </div>

          <div className="mt-4 space-y-4">
            {/* Header fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Permit Requester
                </div>
                <input
                  type="text"
                  placeholder="Search user..."
                  className="w-full rounded border px-3 py-2"
                  value={form.permitRequester || ""}
                  onChange={(e) => update({ permitRequester: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Permit Approver 1
                </div>
                <input
                  type="text"
                  placeholder="Approver name or role"
                  className="w-full rounded border px-3 py-2"
                  value={form.permitApprover1 || ""}
                  onChange={(e) => update({ permitApprover1: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Permit Approver 2
                </div>
                <input
                  type="text"
                  placeholder="Approver name or role"
                  className="w-full rounded border px-3 py-2"
                  value={form.permitApprover2 || ""}
                  onChange={(e) => update({ permitApprover2: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Safety Manager
                </div>
                <input
                  type="text"
                  placeholder="Safety Manager name/department"
                  className="w-full rounded border px-3 py-2"
                  value={form.safetyManager || ""}
                  onChange={(e) => update({ safetyManager: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Permit Issue Date
                </div>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2"
                  value={form.permitIssueDate || ""}
                  onChange={(e) => update({ permitIssueDate: e.target.value })}
                />
              </div>
              <div>
                <div className="text-xs text-slate-600 mb-1">
                  Expected Return Date
                </div>
                <input
                  type="date"
                  className="w-full rounded border px-3 py-2"
                  value={form.expectedReturnDate || ""}
                  onChange={(e) =>
                    update({ expectedReturnDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Comments from Requester */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">
                Comments from Requester:
              </div>
              <div className="mt-2 space-y-1 text-sm">
                {form.requesterRequireUrgent && (
                  <div>Require on urgent basis</div>
                )}
                {form.requesterSafetyManagerApproval && (
                  <div>Safety Manager approval required</div>
                )}
                {(form.requesterPlannedShutdown ||
                  form.requesterPlannedShutdownDate) && (
                  <div>
                    Planned shutdown on:{" "}
                    {form.requesterPlannedShutdownDate || ""}
                  </div>
                )}
                {(form.requesterCustomComments || []).map((it, idx) => (
                  <div key={idx}>- {typeof it === "string" ? it : it.text}</div>
                ))}
                {!form.requesterRequireUrgent &&
                  !form.requesterSafetyManagerApproval &&
                  !(
                    form.requesterPlannedShutdown ||
                    form.requesterPlannedShutdownDate
                  ) &&
                  (form.requesterCustomComments || []).length === 0 && (
                    <div className="text-gray-500">
                      No comments from requester yet.
                    </div>
                  )}
              </div>
            </div>

            {/* Comments from Approver — only Approver -> Safety for gas */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">Comments from Approver:</div>
              <div className="mt-2 space-y-1 text-sm">
                {form.approverToSafetyRequireUrgent && (
                  <div>Require on urgent basis</div>
                )}
                {form.approverToSafetySafetyManagerApproval && (
                  <div>Safety Manager approval required</div>
                )}
                {(form.approverToSafetyPlannedShutdown ||
                  form.approverToSafetyPlannedShutdownDate) && (
                  <div>
                    Planned shutdown on:{" "}
                    {form.approverToSafetyPlannedShutdownDate || ""}
                  </div>
                )}
                {(form.approverToSafetyCustomComments || []).map((it, idx) => (
                  <div key={`ats-${idx}`}>
                    - {typeof it === "string" ? it : it.text}
                  </div>
                ))}
                {!form.approverToSafetyRequireUrgent &&
                  !form.approverToSafetySafetyManagerApproval &&
                  !(
                    form.approverToSafetyPlannedShutdown ||
                    form.approverToSafetyPlannedShutdownDate
                  ) &&
                  (form.approverToSafetyCustomComments || []).length === 0 && (
                    <div className="text-gray-500">
                      No comments from approver yet.
                    </div>
                  )}
              </div>
            </div>

            {/* Comments from Safety Officer — editable */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">Comments for Requester:</div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.SafetyOfficerRequireUrgent}
                  onChange={(e) =>
                    update({ SafetyOfficerRequireUrgent: e.target.checked })
                  }
                />
                Require on urgent basis
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.SafetyOfficerSafetyManagerApproval}
                  onChange={(e) =>
                    update({
                      SafetyOfficerSafetyManagerApproval: e.target.checked,
                    })
                  }
                />
                Safety Manager approval required
              </label>
              <div className="mt-2 text-md flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.SafetyOfficerPlannedShutdown}
                    onChange={(e) =>
                      update({ SafetyOfficerPlannedShutdown: e.target.checked })
                    }
                  />
                  <span>Planned shutdown on:</span>
                </label>
                <input
                  type="date"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.SafetyOfficerPlannedShutdownDate || ""}
                  onChange={(e) =>
                    update({ SafetyOfficerPlannedShutdownDate: e.target.value })
                  }
                />
              </div>

              {/* SafetyOfficer custom comments */}
              <div className="mt-3">
                <div className="mt-2 space-y-1">
                  {(form.SafetyOfficerCustomComments || []).map(
                    (item: any, idx: number) => {
                      const text = typeof item === "string" ? item : item.text;
                      const checked =
                        typeof item === "string" ? false : !!item.checked;
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
                                  form.SafetyOfficerCustomComments || [];
                                const next = prev.map((it: any, i: number) => {
                                  if (i !== idx) return it;
                                  if (typeof it === "string")
                                    return {
                                      text: it,
                                      checked: e.target.checked,
                                    };
                                  return { ...it, checked: e.target.checked };
                                });
                                update({ SafetyOfficerCustomComments: next });
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
                                  form.SafetyOfficerCustomComments || [];
                                const next = prev.filter(
                                  (_: any, i: number) => i !== idx,
                                );
                                update({ SafetyOfficerCustomComments: next });
                              }}
                              className="text-xs text-red-600 hover:underline px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>

                <div className="text-xs font-medium mt-2">Add comment</div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add comment"
                    value={newSafetyOfficerComment}
                    onChange={(e) => setNewSafetyOfficerComment(e.target.value)}
                    className="flex-1 border rounded px-2 py-1"
                  />
                  <button
                    className="px-3 py-1 rounded bg-white border text-sm"
                    onClick={() => {
                      const v = newSafetyOfficerComment.trim();
                      if (!v) return;
                      const prev = form.SafetyOfficerCustomComments || [];
                      const next = [...prev, { text: v, checked: false }];
                      update({ SafetyOfficerCustomComments: next });
                      setNewSafetyOfficerComment("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Specific Comments for Approver — SafetyOfficer can set */}
            <div className="mt-4 bg-yellow-50 p-3 rounded-md">
              <div className="text-md font-medium">Comments for Approver:</div>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.safetyToApproverRequireUrgent}
                  onChange={(e) =>
                    update({ safetyToApproverRequireUrgent: e.target.checked })
                  }
                />
                Require on urgent basis
              </label>
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={!!form.safetyToApproverSafetyManagerApproval}
                  onChange={(e) =>
                    update({
                      safetyToApproverSafetyManagerApproval: e.target.checked,
                    })
                  }
                />
                Safety Manager approval required
              </label>
              <div className="mt-2 text-md flex items-center gap-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!form.safetyToApproverPlannedShutdown}
                    onChange={(e) =>
                      update({
                        safetyToApproverPlannedShutdown: e.target.checked,
                      })
                    }
                  />
                  <span>Planned shutdown on:</span>
                </label>
                <input
                  type="date"
                  className="rounded border px-2 py-1 text-sm"
                  value={form.safetyToApproverPlannedShutdownDate || ""}
                  onChange={(e) =>
                    update({
                      safetyToApproverPlannedShutdownDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* Safety -> Approver custom comments */}
              <div className="mt-3">
                <div className="mt-2 space-y-1">
                  {(form.safetyToApproverCustomComments || []).map(
                    (item: any, idx: number) => {
                      const text = typeof item === "string" ? item : item.text;
                      const checked =
                        typeof item === "string" ? false : !!item.checked;
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
                                  form.safetyToApproverCustomComments || [];
                                const next = prev.map((it: any, i: number) => {
                                  if (i !== idx) return it;
                                  if (typeof it === "string")
                                    return {
                                      text: it,
                                      checked: e.target.checked,
                                    };
                                  return { ...it, checked: e.target.checked };
                                });
                                update({
                                  safetyToApproverCustomComments: next,
                                });
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
                                  form.safetyToApproverCustomComments || [];
                                const next = prev.filter(
                                  (_: any, i: number) => i !== idx,
                                );
                                update({
                                  safetyToApproverCustomComments: next,
                                });
                              }}
                              className="text-xs text-red-600 hover:underline px-2 py-1"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
                <div className="text-xs font-medium mt-2">Add comment</div>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add comment"
                    value={newSafetyToApproverComment}
                    onChange={(e) =>
                      setNewSafetyToApproverComment(e.target.value)
                    }
                    className="flex-1 border rounded px-2 py-1"
                  />
                  <button
                    className="px-3 py-1 rounded bg-white border text-sm"
                    onClick={() => {
                      const v = newSafetyToApproverComment.trim();
                      if (!v) return;
                      const prev = form.safetyToApproverCustomComments || [];
                      const next = [...prev, { text: v, checked: false }];
                      update({ safetyToApproverCustomComments: next });
                      setNewSafetyToApproverComment("");
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
