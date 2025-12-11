import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Calendar, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ModernPagination } from "../components/ui/modern-pagination";
import { StepActions, StepSection } from "@/components/permit/ht/components";
import PermitPreview from "../components/permit/PermitPreview";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

type PermitType = "hot" | "cold" | "other";

type PermitDocType = "work" | "highTension" | "gasLine";

type PermitForm = {
  permitNumber: string;
  certificateNumber?: string;
  permitType: PermitType;
  permitDocType: PermitDocType;
  title: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  plant?: string;
  location?: string;
  equipment?: string;
  equipmentName?: string;
  equipmentId?: string;
  description?: string;
  descriptionHtml?: string;
  applicantName?: string;
  authorizerName?: string;
  applicantSignature?: string | null;
  authorizerSignature?: string | null;
  signatureDataUrl?: string | null;
  idPhoto?: string | null;
  attachments: { name: string; url: string }[];
  // Safety table data for step 2
  safetyTable?: { left?: string; remark?: string; right?: string }[];
  // metadata and sign/name fields for safety table
  hiracNo?: string;
  sopNo?: string;
  tbtConducted?: string;
  operationsSign?: string;
  remarksSign?: string;
  precautionsSign?: string;
  operationsName?: string;
  remarksName?: string;
  precautionsName?: string;
  safetyApplicantName?: string;
  safetyApplicantSign?: string;
  safetyAuthorizerName?: string;
  safetyAuthorizerSign?: string;
  // PPE and fire precautions (step 3)
  ppeItems?: Record<string, { checked: boolean; remarks: string }>;
  firePrecautions?: Record<string, { checked: boolean; remarks: string }>;
  customItems?: {
    id: number;
    ppeItem: string;
    ppeRemarks: string;
    fireItem: string;
    fireRemarks: string;
  }[];
  // Certificates
  certificates?: Record<string, { checked: boolean; number: string }>;
  // Permit data for step 5
  permitData?: any;
  // Permit status for step 6
  permitStatus?: any;
  // Additional fields for modal
  permitApprover1?: string;
  permitApprover2?: string;
  safetyManager?: string;
  // Additional dates for final details section
  permitIssueDate?: string;
  expectedReturnDate?: string;
  requesterRequireUrgent?: boolean;
  requesterSafetyManagerApproval?: boolean;
  requesterPlannedShutdown?: boolean;
  requesterPlannedShutdownDate?: string;
  approverRequireUrgent?: boolean;
  approverSafetyManagerApproval?: boolean;
  approverPlannedShutdown?: boolean;
  approverPlannedShutdownDate?: string;
  requesterCustomComments?: any[];
  approverCustomComments?: any[];
  // Additional UI fields
  plannedWorkPrefix?: string;
  // Requester comments intended for Safety Officer
  requesterSafetyRequireUrgent?: boolean;
  requesterSafetySafetyManagerApproval?: boolean;
  requesterSafetyPlannedShutdown?: boolean;
  requesterSafetyPlannedShutdownDate?: string;
  requesterSafetyCustomComments?: any[];
};

const DEFAULT_FORM = (): PermitForm => ({
  permitNumber: `WCS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
  certificateNumber: "",
  permitType: "hot",
  permitDocType: "work",
  title: "",
  startDate: undefined,
  endDate: undefined,
  startTime: undefined,
  endTime: undefined,
  plant: "",
  location: "",
  equipment: "",
  equipmentName: "",
  equipmentId: "",
  description: "",
  descriptionHtml: "",
  applicantName: "",
  authorizerName: "",
  applicantSignature: null,
  authorizerSignature: null,
  signatureDataUrl: null,
  idPhoto: null,
  attachments: [],
  plannedWorkPrefix: "",
  // Additional dates for final details section
  permitIssueDate: "",
  expectedReturnDate: "",
  safetyTable: Array.from({ length: 3 }).map(() => ({
    left: "",
    remark: "",
    right: "",
  })),
  hiracNo: "",
  sopNo: "",
  tbtConducted: "",
  operationsSign: "",
  remarksSign: "",
  precautionsSign: "",
  operationsName: "",
  remarksName: "",
  precautionsName: "",
  safetyApplicantName: "",
  safetyApplicantSign: "",
  safetyAuthorizerName: "",
  safetyAuthorizerSign: "",
  ppeItems: {
    eyeProtection: { checked: false, remarks: "" },
    headProtection: { checked: false, remarks: "" },
    bodyProtection: { checked: false, remarks: "" },
    respiratoryProtection: { checked: false, remarks: "" },
    legProtection: { checked: false, remarks: "" },
    portableCOMeter: { checked: false, remarks: "" },
    roofLadder: { checked: false, remarks: "" },
    safeAccess: { checked: false, remarks: "" },
  },
  firePrecautions: {
    fireWatcher: { checked: false, remarks: "" },
    fireExtinguishers: { checked: false, remarks: "" },
    pressureFireHose: { checked: false, remarks: "" },
    fireTender: { checked: false, remarks: "" },
    screenOffArea: { checked: false, remarks: "" },
    explosiveTest: { checked: false, remarks: "" },
    carbonMonoxideTest: { checked: false, remarks: "" },
    oxygenTest: { checked: false, remarks: "" },
  },
  customItems: [
    { id: 1, ppeItem: "", ppeRemarks: "", fireItem: "", fireRemarks: "" },
    { id: 2, ppeItem: "", ppeRemarks: "", fireItem: "", fireRemarks: "" },
  ],
  certificates: {
    confinedSpace: { checked: false, number: "" },
    loto: { checked: false, number: "" },
    electrical: { checked: false, number: "" },
    workingAtHeight: { checked: false, number: "" },
    excavation: { checked: false, number: "" },
    heavyLift: { checked: false, number: "" },
    roadClosure: { checked: false, number: "" },
    radiography: { checked: false, number: "" },
    gasLine: { checked: false, number: "" },
    highTension: { checked: false, number: "" },
  },
  // Permit status and revalidation data
  permitStatus: {
    workComplete: {
      holder: { sign: null, name: "", date: "", time: "" },
      applicant: { sign: null, name: "", date: "", time: "" },
      authoriser: { sign: null, name: "", date: "", time: "" },
    },
    workNotComplete: {
      holder: { sign: null, name: "", date: "", time: "" },
      applicant: { sign: null, name: "", date: "", time: "" },
      authoriser: { sign: null, name: "", date: "", time: "" },
    },
    cancellation: {
      reason: "",
      sign: null,
      name: "",
      date: "",
      time: "",
    },
    revalidations: [
      {
        id: 1,
        date: "",
        timeFrom: "",
        timeTo: "",
        applicant: { sign: null, name: "" },
        holder: { sign: null, name: "" },
        authoriser: { sign: null, name: "" },
      },
    ],
  },
  requesterCustomComments: [],
  approverCustomComments: [],
  // Safety-specific requester comments defaults
  requesterSafetyRequireUrgent: false,
  requesterSafetySafetyManagerApproval: false,
  requesterSafetyPlannedShutdown: false,
  requesterSafetyPlannedShutdownDate: "",
  requesterSafetyCustomComments: [],
});

// Button component
function Button({
  children,
  variant = "default",
  className = "",
  onClick,
  ...props
}: any) {
  const baseClasses = "px-4 py-2 rounded-md font-medium transition-colors";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Badge component
function Badge({ children, variant = "default" }: any) {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    secondary: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}

function useAutoSave(key: string, value: PermitForm) {
  useEffect(() => {
    const handler = setInterval(() => {
      try {
        // Use in-memory storage instead of localStorage
        console.log("Auto-saving form data:", value);
      } catch (e) {
        // ignore
      }
    }, 30000);
    return () => clearInterval(handler);
  }, [key, value]);
}

function SignaturePad({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (d: string | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [showUpload, setShowUpload] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleFile = (e: any) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      setFilePreview(res);
    };
    reader.readAsDataURL(f);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#1e40af";
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (value) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, width, height);
        img.src = value;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [value]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastX = 0;
    let lastY = 0;

    const getPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const pointerDown = (e: PointerEvent) => {
      drawing.current = true;
      const p = getPointer(e);
      lastX = p.x;
      lastY = p.y;
    };
    const pointerMove = (e: PointerEvent) => {
      if (!drawing.current) return;
      const p = getPointer(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastX = p.x;
      lastY = p.y;
    };
    const pointerUp = () => {
      if (!drawing.current) return;
      drawing.current = false;
      try {
        const url = canvasRef.current?.toDataURL("image/png") || null;
        onChange(url);
      } catch (e) {
        onChange(null);
      }
    };

    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    window.addEventListener("pointerup", pointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      window.removeEventListener("pointerup", pointerUp);
    };
  }, [onChange]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };

  return (
    <div>
      <div className="border rounded-md overflow-hidden">
        <div className="bg-gray-100 px-3 py-1 text-xs">
          Signature (draw below)
        </div>
        <div className="h-40" style={{ position: "relative" }}>
          <canvas ref={canvasRef} className="w-full h-full touch-none" />
        </div>
      </div>
      <div className="mt-2">
        {/* Small screens: stack Clear, Upload, Save vertically to avoid overlap */}
        <div className="flex flex-col gap-2 lg:hidden">
          <Button variant="outline" onClick={clear}>
            Clear
          </Button>
          <Button variant="ghost" onClick={() => setShowUpload(true)}>
            Upload
          </Button>
          <Button
            onClick={() => {
              if (!canvasRef.current) return;
              try {
                onChange(canvasRef.current.toDataURL("image/png"));
              } catch (e) {
                // ignore
              }
            }}
          >
            Save
          </Button>
        </div>

        {/* Large+ screens: show Clear, Upload, Save inline with Upload between */}
        <div className="hidden lg:flex gap-2 items-center">
          <Button variant="outline" onClick={clear}>
            Clear
          </Button>
          <Button variant="ghost" onClick={() => setShowUpload(true)}>
            Upload
          </Button>
          <Button
            onClick={() => {
              if (!canvasRef.current) return;
              try {
                onChange(canvasRef.current.toDataURL("image/png"));
              } catch (e) {
                // ignore
              }
            }}
          >
            Save
          </Button>
        </div>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setShowUpload(false)}
          />
          <div className="relative bg-white rounded-lg shadow-lg p-4 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Upload Signature</div>
              <button
                onClick={() => setShowUpload(false)}
                className="text-gray-500"
              >
                ×
              </button>
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e)}
              />
            </div>
            {filePreview && (
              <div className="mt-3">
                <div className="border rounded p-2">
                  <img
                    src={filePreview}
                    alt="preview"
                    className="w-full object-contain"
                  />
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setFilePreview(null);
                      setShowUpload(false);
                    }}
                    className="px-3 py-1 rounded border text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onChange(filePreview);
                      setShowUpload(false);
                    }}
                    className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
                  >
                    Use Image
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CreatePermit() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PermitForm>(() => DEFAULT_FORM());
  const [newRequesterComment, setNewRequesterComment] = useState("");
  const [newRequesterSafetyComment, setNewRequesterSafetyComment] = useState("");
  const [newApproverComment, setNewApproverComment] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // If current role is Safety Officer, redirect to dedicated Safety page
  useEffect(() => {
    try {
      const role =
        typeof window !== "undefined" ? localStorage.getItem("dps_role") : null;
      if (role === "safety") {
        navigate("/safety-permit-details");
      }
    } catch {}
  }, [navigate]);

  useAutoSave("wcs_permit_draft", form);

  // Persist requester comments (for Approver view) — Work Permit only
  useEffect(() => {
    try {
      const payload = {
        requesterRequireUrgent: !!form.requesterRequireUrgent,
        requesterSafetyManagerApproval: !!form.requesterSafetyManagerApproval,
        requesterPlannedShutdown: !!form.requesterPlannedShutdown,
        requesterPlannedShutdownDate: form.requesterPlannedShutdownDate || "",
        requesterCustomComments: form.requesterCustomComments || [],
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("dps_requester_comments_work", JSON.stringify(payload));
      }
    } catch {}
  }, [
    form.requesterRequireUrgent,
    form.requesterSafetyManagerApproval,
    form.requesterPlannedShutdown,
    form.requesterPlannedShutdownDate,
    form.requesterCustomComments,
  ]);

  // Persist requester Safety Officer comments — Work Permit only
  useEffect(() => {
    try {
      const payload = {
        requesterSafetyRequireUrgent: !!form.requesterSafetyRequireUrgent,
        requesterSafetySafetyManagerApproval: !!form.requesterSafetySafetyManagerApproval,
        requesterSafetyPlannedShutdown: !!form.requesterSafetyPlannedShutdown,
        requesterSafetyPlannedShutdownDate:
          form.requesterSafetyPlannedShutdownDate || "",
        requesterSafetyCustomComments: form.requesterSafetyCustomComments || [],
      };
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "dps_requester_safety_comments_work",
          JSON.stringify(payload)
        );
      }
    } catch {}
  }, [
    form.requesterSafetyRequireUrgent,
    form.requesterSafetySafetyManagerApproval,
    form.requesterSafetyPlannedShutdown,
    form.requesterSafetyPlannedShutdownDate,
    form.requesterSafetyCustomComments,
  ]);

  const renderPreviewSection = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="space-y-2 text-sm text-slate-800">
            <div>
              <strong>Permit Form:</strong> {form.permitDocType}
            </div>
            <div>
              <strong>Permit Type:</strong> {form.permitType}
            </div>
            <div>
              <strong>Permit No:</strong> {form.permitNumber}
            </div>
            <div>
              <strong>Certificate No:</strong> {form.certificateNumber}
            </div>
            <div>
              <strong>Start:</strong>{" "}
              {`${form.startDate || ""} ${form.startTime || ""}`}
            </div>
            <div>
              <strong>End:</strong>{" "}
              {`${form.endDate || ""} ${form.endTime || ""}`}
            </div>
            <div>
              <strong>Plant:</strong> {form.plant}
            </div>
            <div>
              <strong>Location:</strong> {form.location}
            </div>
            <div>
              <strong>Equipment:</strong> {form.equipmentName} (
              {form.equipmentId})
            </div>
            <div>
              <strong>Work Description:</strong>
              <div
                className="mt-2 p-3 border rounded bg-white text-sm"
                dangerouslySetInnerHTML={{
                  __html: form.descriptionHtml || form.description || "",
                }}
              />
            </div>
            {form.attachments && form.attachments.length > 0 && (
              <div>
                <strong>Attachments</strong>
                <ul className="list-disc pl-5 mt-1 text-sm">
                  {form.attachments.map((a, i) => (
                    <li key={i} className="truncate">
                      <a
                        className="text-blue-600"
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {a.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-600">Applicant</div>
                <div className="font-medium">{form.applicantName}</div>
                {form.applicantSignature && (
                  <img
                    src={form.applicantSignature}
                    alt="applicant sign"
                    className="mt-2 max-h-20 object-contain border"
                  />
                )}
              </div>
              <div>
                <div className="text-xs text-slate-600">Authoriser</div>
                <div className="font-medium">{form.authorizerName}</div>
                {form.authorizerSignature && (
                  <img
                    src={form.authorizerSignature}
                    alt="authoriser sign"
                    className="mt-2 max-h-20 object-contain border"
                  />
                )}
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-2 text-sm text-slate-800">
            <div className="font-medium">Safety Table</div>
            <div className="space-y-1">
              {(form.safetyTable || []).map((r, i) => (
                <div key={i} className="p-2 border rounded bg-white">
                  <div className="text-xs text-slate-600">Row {i + 1}</div>
                  <div className="text-sm">
                    {r.left} — {r.remark} — {r.right}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm">
              <div>
                <strong>HIRAC No.</strong> {form.hiracNo}
              </div>
              <div>
                <strong>SOP No.</strong> {form.sopNo}
              </div>
              <div>
                <strong>TBT Conducted</strong> {form.tbtConducted}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-2 text-sm text-slate-800">
            <div className="font-medium">PPE Items</div>
            <ul className="list-disc pl-5">
              {Object.entries(form.ppeItems || {}).map(
                ([k, v]: any) =>
                  v.checked && (
                    <li key={k}>
                      {k} {v.remarks ? `— ${v.remarks}` : ""}
                    </li>
                  ),
              )}
            </ul>
            <div className="font-medium">Fire Precautions</div>
            <ul className="list-disc pl-5">
              {Object.entries(form.firePrecautions || {}).map(
                ([k, v]: any) =>
                  v.checked && (
                    <li key={k}>
                      {k} {v.remarks ? `— ${v.remarks}` : ""}
                    </li>
                  ),
              )}
            </ul>
            {form.customItems && form.customItems.length > 0 && (
              <div>
                <div className="font-medium">Custom Items</div>
                <ul className="list-disc pl-5">
                  {form.customItems.map((c: any) => (
                    <li key={c.id}>
                      {c.ppeItem} / {c.fireItem}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-2 text-sm text-slate-800">
            <div className="font-medium">Certificates</div>
            <ul className="list-disc pl-5">
              {Object.entries(form.certificates || {}).map(([k, v]: any) => (
                <li key={k}>
                  {k} — {v.checked ? "Yes" : "No"}{" "}
                  {v.number ? `(${v.number})` : ""}
                </li>
              ))}
            </ul>
          </div>
        );
      case 4:
        return (
          <div className="space-y-2 text-sm text-slate-800">
            <div className="font-medium">Permit Authorisation</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-slate-600">Applicant</div>
                <div>{(form.permitData as any)?.applicant?.name || ""}</div>
                {(form.permitData as any)?.applicant?.signature && (
                  <img
                    src={(form.permitData as any).applicant.signature}
                    alt="applicant"
                    className="mt-2 max-h-20 object-contain border"
                  />
                )}
              </div>
              <div>
                <div className="text-xs text-slate-600">Holder</div>
                <div>{(form.permitData as any)?.holder?.name || ""}</div>
                {(form.permitData as any)?.holder?.signature && (
                  <img
                    src={(form.permitData as any).holder.signature}
                    alt="holder"
                    className="mt-2 max-h-20 object-contain border"
                  />
                )}
              </div>
              <div>
                <div className="text-xs text-slate-600">Authoriser</div>
                <div>
                  {(form.permitData as any)?.authoriser?.contact?.name || ""}
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-2 text-sm text-slate-800">
            <div className="font-medium">Permit Returns & Revalidations</div>
            <div>
              <div className="text-xs">Work Complete</div>
              <pre className="p-2 bg-white border rounded text-sm">
                {JSON.stringify(
                  (form.permitStatus || {}).workComplete || {},
                  null,
                  2,
                )}
              </pre>
            </div>
            <div>
              <div className="text-xs">Work Not Complete</div>
              <pre className="p-2 bg-white border rounded text-sm">
                {JSON.stringify(
                  (form.permitStatus || {}).workNotComplete || {},
                  null,
                  2,
                )}
              </pre>
            </div>
            <div>
              <div className="text-xs">Revalidations</div>
              <div className="space-y-2">
                {((form.permitStatus as any)?.revalidations || []).map(
                  (r: any) => (
                    <div
                      key={r.id}
                      className="p-2 border rounded bg-white text-sm"
                    >
                      <div>
                        <strong>Date:</strong> {r.date} {r.timeFrom} -{" "}
                        {r.timeTo}
                      </div>
                      <div>
                        <strong>Applicant:</strong> {r.applicant?.name}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-2 text-sm text-slate-800">
            <div className="font-semibold">SAFE LIMIT OF GASES / VAPOURS</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="text-left px-2 py-2 border border-gray-300">
                      GAS
                    </th>
                    <th className="text-center px-2 py-2 border border-gray-300">
                      SAFE CONCENTRATION FOR 8 HRS DURATION
                    </th>
                    <th className="text-center px-2 py-2 border border-gray-300">
                      FLAMMABLE LIMITS (LOWER / UPPER)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-2 py-2 border border-gray-300">
                      CARBON MONOXIDE
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      50 PPM
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      12.5% / 74.2%
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-2 py-2 border border-gray-300">
                      HYDROGEN
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      -
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      4.0% / 75%
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-2 py-2 border border-gray-300">
                      METHANE / NATURAL GAS
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      1000 PPM
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      5.9% / 14%
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-2 py-2 border border-gray-300">
                      AMMONIA
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      25 PPM
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      16% / 23%
                    </td>
                  </tr>
                  <tr className="odd:bg-white even:bg-gray-50">
                    <td className="px-2 py-2 border border-gray-300">
                      CHLORINE
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      1 PPM
                    </td>
                    <td className="px-2 py-2 border border-gray-300 text-center">
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <div className="font-semibold">IMPORTANT INSTRUCTIONS:</div>
              <ol className="list-decimal list-inside mt-2 text-sm space-y-1 text-slate-700">
                <li>
                  A Permit-to-Work or Certificate is normally valid for one
                  shift only. However, it can be extended for a maximum of seven
                  days more with appropriate renewals.
                </li>
                <li>
                  Permit is not valid in the event, if conditions in the
                  incident area become Hazardous from conditions not existing
                  when this permit was issued or in the event of any Emergency /
                  Fire.
                </li>
                <li>The authorized person should issue permit only.</li>
                <li>
                  Work Instructions &amp; Protocol procedures are to be strictly
                  followed.
                </li>
                <li>
                  If job is not completed within the validity time period, the
                  authorized person incorporating necessary changes must extend
                  the permit.
                </li>
                <li>
                  Permit must be returned by the applicant to the issuing
                  authority after completion of the job.
                </li>
                <li>
                  When more than one agency is working at a place the concerned
                  agencies must co-ordinate among themselves for safety of the
                  persons working there.
                </li>
                <li>
                  No job should be attempted / to be done for which permit is
                  not issued.
                </li>
                <li>
                  Workers must be briefed about imminent dangers involved in the
                  job.
                </li>
                <li>
                  Persons working at height and Confined Space should be
                  medically checked for acrophobia and claustrophobia
                  respectively.
                </li>
                <li>
                  Separate Certificates are to be taken for the jobs involving
                  Excavation, Confined Space Entry, Working at Height,
                  Radiography, Electrical, LOTO, Road Closure &amp; Heavy Lift
                  jobs.
                </li>
                <li>
                  Results for the Confined Space Entry to be periodically
                  recorded in the Certificate.
                </li>
              </ol>

              <p className="mt-2 text-xs italic">
                NOTE: If the Applicant does not fill it, Authorizer can fill it
                up if necessary or write "NIL"
              </p>
            </div>

            <div className="mt-4 text-center">
              <div className="border p-3 rounded font-semibold text-center">
                BEFORE AUTHORISING THE PERMIT
                <br />
                <span className="block mt-2">
                  ENSURE THAT SITE IS SAFE TO WORK &amp; SAFE WORKING CONDITIONS
                  ARE MAINTAINED
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="font-semibold">Legend</div>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <div className="text-green-600 font-bold">✓</div>
                  <div>Measures Taken</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-red-600 font-bold">X</div>
                  <div>Measures Not Required</div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="font-semibold">NA</div>
                  <div>Not Applicable</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-2 text-sm text-slate-800">
            <div>
              <strong>Permit Approver 1:</strong>{" "}
              {(form as any).permitApprover1}
            </div>
            <div>
              <strong>Permit Approver 2:</strong>{" "}
              {(form as any).permitApprover2}
            </div>
            <div>
              <strong>Safety Manager:</strong> {(form as any).safetyManager}
            </div>
            <div>
              <strong>Requester Comments:</strong>
              <ul className="list-disc pl-5 mt-1">
                {(form.requesterCustomComments || []).map(
                  (c: any, i: number) => (
                    <li key={i}>{typeof c === "string" ? c : c.text}</li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <strong>Approver Comments:</strong>
              <ul className="list-disc pl-5 mt-1">
                {(form.approverCustomComments || []).map(
                  (c: any, i: number) => (
                    <li key={i}>{typeof c === "string" ? c : c.text}</li>
                  ),
                )}
              </ul>
            </div>
            {!isApprover && (
              <div>
                <strong>Progress:</strong> {completion}%
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const update = (patch: Partial<PermitForm>) =>
    setForm((s) => ({ ...s, ...patch }));

  const [currentStep, setCurrentStep] = useState(0);
  // Determine role to alter steps for approvers and safety officers
  const role =
    typeof window !== "undefined" ? localStorage.getItem("dps_role") : null;
  const isApprover = role === "approver";
  const isApproverOrSafety = isApprover || role === "safety";

  const defaultSteps = [
    {
      title: "Basic Details",
      description: "Permit information and work description",
    },
    {
      title: "Safety & Precautions",
      description: "Safety measures and hazard identification",
    },
    {
      title: "PPE & Fire Precautions",
      description: "Personal protective equipment and fire safety",
    },
    {
      title: "Certificates",
      description: "Required certificates and compliance",
    },
    {
      title: "Permits",
      description: "Permit authorization and signatures",
    },
    {
      title: "Returns & Revalidation",
      description: "Work completion and permit returns",
    },
    {
      title: "Important Instructions",
      description: "Safety instructions and gas limits",
    },
    {
      title: "Permit Details",
      description: "Final review and submission",
    },
  ];
  // For approver or safety role: collapse to only the final section, renamed as Section 1
  const steps = isApproverOrSafety
    ? [
        {
          title: "Section 1: Permit Details",
          description: "Final review and submission",
        },
      ]
    : defaultSteps;
  const safetyRef = useRef<HTMLDivElement | null>(null);

  // Map UI step to the original content index
  const effectiveStep = isApproverOrSafety ? 7 : currentStep;

  const completion = useMemo(() => {
    let completed = 0;
    let total = 10;

    if (form.permitNumber) completed++;
    if (form.certificateNumber) completed++;
    if (form.startDate && form.endDate) completed++;
    if (form.plant) completed++;
    if (form.location) completed++;
    if (form.equipmentName) completed++;
    if (form.description && form.description.length > 10) completed++;
    if (form.applicantSignature) completed++;
    if (form.authorizerSignature) completed++;
    if (form.applicantName && form.authorizerName) completed++;

    return Math.round((completed / total) * 100);
  }, [form]);

  const validateStep1 = () => {
    const missing: string[] = [];
    if (!form.permitType) missing.push("Permit Type");
    if (!form.permitNumber || !form.permitNumber.trim())
      missing.push("Permit No.");
    if (!form.certificateNumber || !form.certificateNumber.trim())
      missing.push("Certificate No.");
    if (!form.startDate || !form.endDate || !form.startTime || !form.endTime)
      missing.push("Start/End Date & Time");
    else {
      try {
        const start = new Date(`${form.startDate}T${form.startTime}`);
        const end = new Date(`${form.endDate}T${form.endTime}`);
        if (start.getTime() > end.getTime()) {
          alert("Start date/time must be before end date/time");
          return false;
        }
      } catch (e) {
        missing.push("Valid start/end");
      }
    }
    if (!form.plant || !form.plant.trim()) missing.push("Plant");
    if (!form.location || !form.location.trim()) missing.push("Location");
    if (!form.equipmentName || !form.equipmentName.trim())
      missing.push("Equipment Name");
    if (!form.equipmentId || !form.equipmentId.trim())
      missing.push("Equipment ID");
    if (!form.description || form.description.trim().length < 10)
      missing.push("Work Description");
    if (!form.applicantSignature) missing.push("Applicant Signature");
    if (!form.authorizerSignature) missing.push("Authorizer Signature");
    if (!form.applicantName || !form.applicantName.trim())
      missing.push("Applicant Name");
    if (!form.authorizerName || !form.authorizerName.trim())
      missing.push("Authorizer Name");

    if (missing.length > 0) {
      alert("Please complete required fields: " + missing.join(", "));
      return false;
    }
    return true;
  };

  const next = () => {
    setCurrentStep((s) => {
      const ns = Math.min(s + 1, steps.length - 1);
      if (ns === 1) {
        setTimeout(() => {
          if (safetyRef.current) {
            safetyRef.current.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }, 120);
      }
      return ns;
    });
  };
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const saveDraft = () => {
    try {
      console.log("Draft saved:", form);
      alert("Draft saved");
    } catch (e) {
      alert("Unable to save draft");
    }
  };

  const preview = () => {
    setShowPreviewModal(true);
  };

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

  // Auto-open preview modal if URL contains ?preview
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.has("preview")) {
        setShowPreviewModal(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    // If preview was opened from ApproverPermitDetails, navigate back
    try {
      const referrer = document.referrer;
      if (referrer && referrer.includes("/approver-permit-details")) {
        navigate("/approver-permit-details");
      }
    } catch (e) {
      // ignore
    }
  };

  const submit = () => {
    try {
      const payload = { ...form, submittedAt: new Date().toISOString() };
      console.log("Submitting permit", payload);
      alert(`Permit ${form.permitNumber} submitted`);
    } catch (e) {
      alert("Failed to submit");
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const descRef = useRef<HTMLDivElement | null>(null);

  // Persist requester comments & selections for approver view
  useEffect(() => {
    try {
      const payload = {
        requesterRequireUrgent: !!form.requesterRequireUrgent,
        requesterSafetyManagerApproval: !!form.requesterSafetyManagerApproval,
        requesterPlannedShutdown: !!form.requesterPlannedShutdown,
        requesterPlannedShutdownDate: form.requesterPlannedShutdownDate || "",
        requesterCustomComments: form.requesterCustomComments || [],
        // Include Safety-specific requester comments so SafetyOfficer can read them
        requesterSafetyRequireUrgent: !!(form as any).requesterSafetyRequireUrgent,
        requesterSafetySafetyManagerApproval: !!(form as any).requesterSafetySafetyManagerApproval,
        requesterSafetyPlannedShutdown: !!(form as any).requesterSafetyPlannedShutdown,
        requesterSafetyPlannedShutdownDate: (form as any).requesterSafetyPlannedShutdownDate || "",
        requesterSafetyCustomComments: (form as any).requesterSafetyCustomComments || [],
      };
      localStorage.setItem("dps_requester_comments", JSON.stringify(payload));
    } catch (e) {
      // ignore storage issues
    }
  }, [
    form.requesterRequireUrgent,
    form.requesterSafetyManagerApproval,
    form.requesterPlannedShutdown,
    form.requesterPlannedShutdownDate,
    form.requesterCustomComments,
    (form as any).requesterSafetyRequireUrgent,
    (form as any).requesterSafetySafetyManagerApproval,
    (form as any).requesterSafetyPlannedShutdown,
    (form as any).requesterSafetyPlannedShutdownDate,
    (form as any).requesterSafetyCustomComments,
  ]);

  // Load approver comments once so they appear under 'Comments from Approver'
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem("dps_approver_comments_work");
      if (!raw) return;
      const data = JSON.parse(raw);
      update({
        approverRequireUrgent: !!data.approverRequireUrgent,
        approverSafetyManagerApproval: !!data.approverSafetyManagerApproval,
        approverPlannedShutdown: !!data.approverPlannedShutdown,
        approverPlannedShutdownDate: data.approverPlannedShutdownDate || "",
        approverCustomComments: data.approverCustomComments || [],
      } as any);
    } catch (e) {
      // ignore
    }
    // run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      descRef.current &&
      descRef.current.innerHTML !== (form.descriptionHtml || "")
    ) {
      descRef.current.innerHTML = form.descriptionHtml || "";
    }
  }, [form.descriptionHtml]);

  const exec = (cmd: string) => {
    document.execCommand(cmd);
    if (descRef.current)
      update({
        descriptionHtml: descRef.current.innerHTML,
        description: descRef.current.innerText || "",
      });
  };

  const updateSafetyRow = (
    idx: number,
    key: "left" | "remark" | "right",
    value: string,
  ) => {
    const table = form.safetyTable
      ? [...form.safetyTable]
      : [{ left: "", remark: "", right: "" }];
    while (table.length <= idx) table.push({ left: "", remark: "", right: "" });
    table[idx] = { ...table[idx], [key]: value };
    update({ safetyTable: table });
  };

  // Step 3 helpers: PPE & Fire Precautions
  const togglePPE = (key: string) => {
    const items = { ...(form.ppeItems || {}) } as any;
    items[key] = items[key] || { checked: false, remarks: "" };
    items[key].checked = !items[key].checked;
    update({ ppeItems: items });
  };

  const toggleFire = (key: string) => {
    const items = { ...(form.firePrecautions || {}) } as any;
    items[key] = items[key] || { checked: false, remarks: "" };
    items[key].checked = !items[key].checked;
    update({ firePrecautions: items });
  };

  const updatePPERemarks = (key: string, value: string) => {
    const items = { ...(form.ppeItems || {}) } as any;
    items[key] = items[key] || { checked: false, remarks: "" };
    items[key].remarks = value;
    update({ ppeItems: items });
  };

  const updateFireRemarks = (key: string, value: string) => {
    const items = { ...(form.firePrecautions || {}) } as any;
    items[key] = items[key] || { checked: false, remarks: "" };
    items[key].remarks = value;
    update({ firePrecautions: items });
  };

  const updateCustomItem = (
    id: number,
    key: "ppeItem" | "ppeRemarks" | "fireItem" | "fireRemarks",
    value: string,
  ) => {
    const items = (form.customItems || []).slice();
    const idx = items.findIndex((c) => c.id === id);
    if (idx === -1) return;
    items[idx] = { ...items[idx], [key]: value };
    update({ customItems: items });
  };

  const addCustomItem = () => {
    const items = (form.customItems || []).slice();
    const nextId = items.length ? items[items.length - 1].id + 1 : 1;
    items.push({
      id: nextId,
      ppeItem: "",
      ppeRemarks: "",
      fireItem: "",
      fireRemarks: "",
    });
    update({ customItems: items });
  };

  const removeCustomItem = (id: number) => {
    const items = (form.customItems || []).slice();
    const idx = items.findIndex((c) => c.id === id);
    if (idx === -1) return;
    items.splice(idx, 1);
    update({ customItems: items });
  };

  const step3Progress = useMemo(() => {
    const ppe = form.ppeItems || ({} as any);
    const fire = form.firePrecautions || ({} as any);
    const keysPPE = Object.keys(ppe);
    const keysFire = Object.keys(fire);
    const total = keysPPE.length + keysFire.length;
    const done =
      keysPPE.filter((k) => ppe[k].checked).length +
      keysFire.filter((k) => fire[k].checked).length;
    return total ? Math.round((done / total) * 100) : 0;
  }, [form.ppeItems, form.firePrecautions]);

  // Step 4 helpers: Certificates (3C)
  const toggleCertificate = (key: string) => {
    const certs = { ...(form.certificates || {}) } as any;
    certs[key] = certs[key] || { checked: false, number: "" };
    certs[key].checked = !certs[key].checked;
    update({ certificates: certs });
    if (certs[key].checked) {
      setTimeout(() => {
        const el = document.getElementById(
          `cert-${key}`,
        ) as HTMLInputElement | null;
        if (el) el.focus();
      }, 50);
    }
  };

  const updateCertificateNumber = (key: string, value: string) => {
    const certs = { ...(form.certificates || {}) } as any;
    certs[key] = certs[key] || { checked: false, number: "" };
    certs[key].number = value;
    update({ certificates: certs });
  };

  const checkAllCertificates = () => {
    const certs = { ...(form.certificates || {}) } as any;
    Object.keys(certs).forEach((k) => (certs[k].checked = true));
    update({ certificates: certs });
  };

  const uncheckAllCertificates = () => {
    const certs = { ...(form.certificates || {}) } as any;
    Object.keys(certs).forEach((k) => (certs[k].checked = false));
    update({ certificates: certs });
  };

  // Permit status helpers
  const updatePermitStatusField = (path: string, value: any) => {
    const parts = path.split(".");
    const ps = { ...(form.permitStatus || {}) } as any;
    let cur: any = ps;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      cur[p] = { ...(cur[p] || {}) };
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
    update({ permitStatus: ps });
  };

  // Revalidations helpers
  const addRevalidationRow = () => {
    const ps = { ...(form.permitStatus || {}) } as any;
    const rows = (ps.revalidations || []).slice();
    const nextId = rows.length ? rows[rows.length - 1].id + 1 : 1;
    rows.push({
      id: nextId,
      date: "",
      timeFrom: "",
      timeTo: "",
      applicant: { sign: null, name: "" },
      holder: { sign: null, name: "" },
      authoriser: { sign: null, name: "" },
    });
    ps.revalidations = rows;
    update({ permitStatus: ps });
  };

  const removeRevalidationRow = (id: number) => {
    const ps = { ...(form.permitStatus || {}) } as any;
    const rows = (ps.revalidations || []).slice();
    const idx = rows.findIndex((r: any) => r.id === id);
    if (idx === -1) return;
    rows.splice(idx, 1);
    ps.revalidations = rows;
    update({ permitStatus: ps });
  };

  const updateRevalidationRow = (id: number, key: string, value: any) => {
    const ps = { ...(form.permitStatus || {}) } as any;
    const rows = (ps.revalidations || []).slice();
    const idx = rows.findIndex((r: any) => r.id === id);
    if (idx === -1) return;
    rows[idx] = { ...rows[idx], [key]: value };
    ps.revalidations = rows;
    update({ permitStatus: ps });
  };

  // Permit section helpers
  const updatePermitField = (path: string, value: any) => {
    const parts = path.split(".");
    const pd = { ...(form.permitData || {}) } as any;
    let cur: any = pd;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i];
      cur[p] = { ...(cur[p] || {}) };
      cur = cur[p];
    }
    cur[parts[parts.length - 1]] = value;
    update({ permitData: pd });
  };

  const saveApplicantSignature = (dataUrl: string | null) =>
    updatePermitField("applicant.signature", dataUrl);
  const saveHolderSignature = (dataUrl: string | null) =>
    updatePermitField("holder.signature", dataUrl);
  const saveAuthoriserSign = (dataUrl: string | null) =>
    updatePermitField("authoriser.contact.sign", dataUrl);
  const saveNomineeSign = (dataUrl: string | null) =>
    updatePermitField("authoriser.nominee.sign", dataUrl);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="mb-4 flex items-center justify-between mx-auto max-w-7xl px-4 pt-6">
        <div>
          <h1 className="text-[20px] font-semibold">Work Permit Form</h1>
          <div className="text-sm text-gray-500">
            <p>
              <span className="text-sm">{form.permitNumber}</span>
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
                value={form.permitDocType}
                onValueChange={(v) => {
                  if (v === "highTension") {
                    navigate("/ht-permit");
                  } else if (v === "gasLine") {
                    navigate("/gas-permit");
                  } else {
                    update({ permitDocType: v as any });
                  }
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
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 pb-6 space-y-6">

      <ModernPagination
        steps={steps}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        showProgress={!isApprover}
        allowClickNavigation={true}
        variant="numbered"
      />

      {/* Company header, matching HT header style (moved below progress) */}
      <div className="bg-white mt-3">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/placeholder.svg" alt="AM/NS INDIA logo" className="h-[60px] w-auto" />
          </div>
          <div className="text-center">
            <div className="font-bold text-gray-900">ArcelorMittal Nippon Steel India Limited</div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate No.</label>
              <input
                value={form.certificateNumber || ""}
                onChange={(e) => update({ certificateNumber: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Permit No.</label>
              <input
                value={form.permitNumber || ""}
                onChange={(e) => update({ permitNumber: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-2 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          />

          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto p-6 z-10">
            <div className="flex items-center justify-between mb-4" />

            <PermitPreview form={form} />

            <div className="w-full hidden" style={{ maxWidth: 900 }}>
              <div className="border border-black p-4 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-sm border">
                      Logo
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold">
                        ArcelorMittal Nippon Steel India Limited
                      </div>
                      <div className="text-xs">
                        (Formerly Essar Steel India Limited)
                      </div>
                      <div className="text-xs">Hazira</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs">AMNSIL/SAFE/F/01</div>
                    <div className="text-xs">Rev. No. 13</div>
                  </div>
                </div>

                {/* Title area */}
                <div className="text-center mt-3 mb-3">
                  <div className="text-xl font-bold">PERMIT TO WORK</div>
                </div>

                {/* Main info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Permit No.</div>
                    <div className="mt-1">{form.permitNumber}</div>
                  </div>
                  <div>
                    <div className="font-medium">Certificate No.</div>
                    <div className="mt-1">{form.certificateNumber || ""}</div>
                  </div>
                </div>

                {/* Application and work description */}
                <div className="mt-4 text-sm">
                  <div className="font-medium">
                    APPLICATION AND WORK DESCRIPTION (Filled by Applicant):
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-600">
                        Planned Work Schedule
                      </div>
                      <div className="mt-1">
                        From {form.startDate || ""} {form.startTime || ""} To{" "}
                        {form.endDate || ""} {form.endTime || ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">
                        Plant / Location
                      </div>
                      <div className="mt-1">
                        {form.plant || ""} / {form.location || ""}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs text-gray-600">
                      Work Description
                    </div>
                    <div className="mt-1 p-3 border rounded text-sm min-h-[60px]">
                      {form.description || ""}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                    <div>
                      <div className="text-xs text-gray-600">
                        Equipment Name
                      </div>
                      <div className="mt-1">
                        {form.equipmentName || form.equipment || ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">
                        Equipment ID No.
                      </div>
                      <div className="mt-1">{form.equipmentId || ""}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Applicant</div>
                      <div className="mt-1">{form.applicantName || ""}</div>
                    </div>
                  </div>
                </div>

                {/* Safety Measures table - render simplified grid */}
                <div className="mt-4 text-sm">
                  <div className="font-medium mb-2">
                    SAFETY MEASURES TAKEN / SPECIAL PRECAUTIONS & POTENTIAL
                    HAZARDS
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(form.safetyTable || []).map((r, i) => (
                      <div key={i} className="p-2 border rounded bg-gray-50">
                        <div className="text-xs text-gray-600">{`Item ${i + 1}`}</div>
                        <div className="text-sm">
                          {r.left} {r.remark ? ` - ${r.remark}` : ""}{" "}
                          {r.right ? ` - ${r.right}` : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PPE and Certificates summary */}
                <div className="mt-4 text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">PPE & Fire Precautions</div>
                    <ul className="list-disc pl-5 mt-2 text-sm">
                      {Object.entries(form.ppeItems || {}).map(
                        ([k, v]: any) =>
                          v.checked && (
                            <li key={k}>
                              {k}
                              {v.remarks ? ` - ${v.remarks}` : ""}
                            </li>
                          ),
                      )}
                      {Object.entries(form.firePrecautions || {}).map(
                        ([k, v]: any) =>
                          v.checked && (
                            <li key={k}>
                              {k}
                              {v.remarks ? ` - ${v.remarks}` : ""}
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Certificates</div>
                    <ul className="list-disc pl-5 mt-2 text-sm">
                      {Object.entries(form.certificates || {}).map(
                        ([k, v]: any) =>
                          v.checked && (
                            <li key={k}>
                              {k}
                              {v.number ? ` - ${v.number}` : ""}
                            </li>
                          ),
                      )}
                    </ul>
                  </div>
                </div>

                {/* Permit returns & revalidations (condensed) */}
                <div className="mt-4 text-sm">
                  <div className="font-medium">Permit Re-validations</div>
                  <div className="mt-2 grid grid-cols-1 gap-2">
                    {((form.permitStatus || {}).revalidations || []).map(
                      (rv: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-2 border rounded bg-gray-50"
                        >
                          <div className="text-xs text-gray-600">
                            {rv.date} {rv.timeFrom} - {rv.timeTo}
                          </div>
                          <div className="text-sm">
                            Applicant: {rv.applicant?.name || ""} | Holder:{" "}
                            {rv.holder?.name || ""} | Authoriser:{" "}
                            {rv.authoriser?.name || ""}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Safe Limits table and Important Instructions */}
                <div className="mt-6 border rounded p-4 bg-gray-50">
                  <div className="text-sm font-semibold">
                    SAFE LIMIT OF GASES / VAPOURS
                  </div>
                  <div className="mt-2 overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-800 text-white">
                          <th className="text-left px-2 py-2 border border-gray-300">
                            GAS
                          </th>
                          <th className="text-center px-2 py-2 border border-gray-300">
                            SAFE CONCENTRATION FOR 8 HRS DURATION
                          </th>
                          <th className="text-center px-2 py-2 border border-gray-300">
                            FLAMMABLE LIMITS (LOWER / UPPER)
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="odd:bg-white even:bg-gray-50">
                          <td className="px-2 py-2 border">CARBON MONOXIDE</td>
                          <td className="px-2 py-2 border text-center">
                            50 PPM
                          </td>
                          <td className="px-2 py-2 border text-center">
                            12.5% / 74.2%
                          </td>
                        </tr>
                        <tr className="odd:bg-white even:bg-gray-50">
                          <td className="px-2 py-2 border">HYDROGEN</td>
                          <td className="px-2 py-2 border text-center">
                            12.5% / 74.2%
                          </td>
                          <td className="px-2 py-2 border text-center">
                            4.0% / 75%
                          </td>
                        </tr>
                        <tr className="odd:bg-white even:bg-gray-50">
                          <td className="px-2 py-2 border">
                            METHANE / NATURAL GAS
                          </td>
                          <td className="px-2 py-2 border text-center">
                            1000 PPM
                          </td>
                          <td className="px-2 py-2 border text-center">
                            5.9% / 14%
                          </td>
                        </tr>
                        <tr className="odd:bg-white even:bg-gray-50">
                          <td className="px-2 py-2 border">AMMONIA</td>
                          <td className="px-2 py-2 border text-center">
                            25 PPM
                          </td>
                          <td className="px-2 py-2 border text-center">
                            16% / 23%
                          </td>
                        </tr>
                        <tr className="odd:bg-white even:bg-gray-50">
                          <td className="px-2 py-2 border">CHLORINE</td>
                          <td className="px-2 py-2 border text-center">
                            1 PPM
                          </td>
                          <td className="px-2 py-2 border text-center">
                            &nbsp;
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4">
                    <div className="font-semibold">IMPORTANT INSTRUCTIONS:</div>
                    <ol className="list-decimal list-inside mt-2 text-sm space-y-1 text-slate-700">
                      <li>
                        A Permit-to-Work or Certificate is normally valid for
                        one shift only. However, it can be extended for a
                        maximum of seven days more with appropriate renewals.
                      </li>
                      <li>
                        Permit is not valid in the event, if conditions in the
                        incident area become Hazardous from conditions not
                        existing when this permit was issued or in the event of
                        any Emergency / Fire.
                      </li>
                      <li>The authorized person should issue permit only.</li>
                      <li>
                        Work Instructions &amp; Protocol procedures are to be
                        strictly followed.
                      </li>
                      <li>
                        If job is not completed within the validity time period,
                        the authorized person incorporating necessary changes
                        must extend the permit.
                      </li>
                      <li>
                        Permit must be returned by the applicant to the issuing
                        authority after completion of the job.
                      </li>
                      <li>
                        When more than one agency is working at a place the
                        concerned agencies must co-ordinate among themselves for
                        safety of the persons working there.
                      </li>
                      <li>
                        No job should be attempted / to be done for which permit
                        is not issued.
                      </li>
                      <li>
                        Workers must be briefed about imminent dangers involved
                        in the job.
                      </li>
                      <li>
                        Persons working at height and Confined Space should be
                        medically checked for acrophobia and claustrophobia
                        respectively.
                      </li>
                      <li>
                        Separate Certificates are to be taken for the jobs
                        involving Excavation, Confined Space Entry, Working at
                        Height, Radiography, Electrical, LOTO, Road Closure
                        &amp; Heavy Lift jobs.
                      </li>
                      <li>
                        Results for the Confined Space Entry to be periodically
                        recorded in the Certificate.
                      </li>
                    </ol>

                    <p className="mt-2 text-xs italic">
                      NOTE: If the Applicant does not fill it, Authorizer can
                      fill it up if necessary or write "NIL"
                    </p>
                  </div>
                </div>

                {/* Footer signatures */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="border p-3 text-center">
                    <div className="text-xs text-gray-600">
                      Permit Applicant
                    </div>
                    <div className="font-medium mt-2">
                      {form.applicantName || ""}
                    </div>
                  </div>
                  <div className="border p-3 text-center">
                    <div className="text-xs text-gray-600">Permit Holder</div>
                    <div className="font-medium mt-2">
                      {(form.permitData as any)?.holder?.name || ""}
                    </div>
                  </div>
                  <div className="border p-3 text-center">
                    <div className="text-xs text-gray-600">Authoriser</div>
                    <div className="font-medium mt-2">
                      {form.authorizerName ||
                        (form.permitData as any)?.authoriser?.contact?.name ||
                        ""}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  Generated preview — printable layout
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-4 shadow-sm mt-6">
        {/* Step Content */}
        <div>
          {effectiveStep === 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-4 pb-14">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="mb-2 font-medium">Permit Type</div>
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 p-3 rounded border ${form.permitType === "hot" ? "bg-blue-50 border-blue-300" : "bg-white"}`}
                      onClick={() => update({ permitType: "hot" })}
                    >
                      <div className="font-semibold">Hot Work</div>
                      <div className="text-xs text-gray-500">
                        Use for welding, cutting, flame work
                      </div>
                    </button>
                    <button
                      className={`flex-1 p-3 rounded border ${form.permitType === "cold" ? "bg-blue-50 border-blue-300" : "bg-white"}`}
                      onClick={() => update({ permitType: "cold" })}
                    >
                      <div className="font-semibold">Cold Work</div>
                      <div className="text-xs text-gray-500">
                        Non-thermal mechanical work
                      </div>
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-white grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-gray-500">
                      Permit No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      aria-required
                      className="mt-1 w-full border rounded px-2 py-1"
                      value={form.permitNumber}
                      onChange={(e) => update({ permitNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">
                      Certificate No. <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      aria-required
                      className="mt-1 w-full border rounded px-2 py-1"
                      value={form.certificateNumber || ""}
                      onChange={(e) =>
                        update({ certificateNumber: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-white">
                  <div className="mb-2 font-medium flex items-center gap-1">
                    <div className="block font-medium">
                      <p className="m-0">Planned Work Schedule:</p>
                    </div>
                    <input
                      className="border border-gray-200 rounded px-2 py-1 w-36 block font-normal"
                      value={form.plannedWorkPrefix || ""}
                      onChange={(e) =>
                        update({ plannedWorkPrefix: e.target.value })
                      }
                      aria-label="Planned work schedule prefix"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-gray-500">
                          Date — Start <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          aria-required
                          type="date"
                          className="mt-1 w-full border rounded px-2 py-1"
                          value={form.startDate || ""}
                          onChange={(e) =>
                            update({ startDate: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Date — End <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          aria-required
                          type="date"
                          className="mt-1 w-full border rounded px-2 py-1"
                          value={form.endDate || ""}
                          onChange={(e) => update({ endDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Time — Start <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          aria-required
                          type="time"
                          className="mt-1 w-full border rounded px-2 py-1"
                          value={form.startTime || ""}
                          onChange={(e) =>
                            update({ startTime: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Time — End <span className="text-red-500">*</span>
                        </label>
                        <input
                          required
                          aria-required
                          type="time"
                          className="mt-1 w-full border rounded px-2 py-1"
                          value={form.endTime || ""}
                          onChange={(e) => update({ endTime: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Ensure start and end times are correct. Conflicts will be
                    highlighted on save.
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">
                        Plant <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        aria-required
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={form.plant || ""}
                        onChange={(e) => update({ plant: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        aria-required
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={form.location || ""}
                        onChange={(e) => update({ location: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500">
                        Equipment Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        aria-required
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={form.equipmentName || ""}
                        onChange={(e) =>
                          update({ equipmentName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">
                        Equipment ID No. <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        aria-required
                        className="mt-1 w-full border rounded px-2 py-1"
                        value={form.equipmentId || ""}
                        onChange={(e) =>
                          update({ equipmentId: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  <div className="mb-2 font-medium">
                    Work Description <span className="text-red-500">*</span>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => exec("bold")}
                      className="px-2 py-1 rounded border"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => exec("italic")}
                      className="px-2 py-1 rounded border"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => exec("insertUnorderedList")}
                      className="px-2 py-1 rounded border"
                    >
                      • List
                    </button>
                  </div>
                  <div
                    ref={descRef}
                    contentEditable
                    onInput={() =>
                      descRef.current &&
                      update({
                        descriptionHtml: descRef.current.innerHTML,
                        description: descRef.current.innerText || "",
                      })
                    }
                    className="min-h-[120px] border rounded p-3 bg-white"
                    aria-label="Work description"
                    suppressContentEditableWarning
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      Provide detailed description of work to be performed.
                    </div>
                    <div className="text-sm text-gray-500">
                      {(form.description || "").length}/2000
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs text-gray-500">Attachments</label>
                    <div
                      className="mt-2 border-dashed border-2 rounded p-4 text-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-sm">
                        Drag & drop files here or click to upload
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (!files) return;
                          const arr = Array.from(files);
                          arr.forEach((f) => {
                            const reader = new FileReader();
                            reader.onload = () =>
                              update({
                                attachments: [
                                  ...form.attachments,
                                  { name: f.name, url: String(reader.result) },
                                ],
                              });
                            reader.readAsDataURL(f);
                          });
                        }}
                      />
                    </div>
                    <div className="mt-2 space-y-1">
                      {form.attachments.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between border rounded px-2 py-1"
                        >
                          <div className="truncate">{a.name}</div>
                          <div className="flex items-center gap-2">
                            <a
                              className="text-sm text-blue-600"
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Preview
                            </a>
                            <Button
                              variant="ghost"
                              className="text-sm"
                              onClick={() => {
                                const copy = [...form.attachments];
                                copy.splice(i, 1);
                                update({ attachments: copy });
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium mb-2">
                          Applicant Sign <span className="text-red-500">*</span>
                        </div>
                        <SignaturePad
                          value={form.applicantSignature || null}
                          onChange={(d) => update({ applicantSignature: d })}
                        />
                        <div className="mt-2">
                          <label className="text-xs text-gray-500">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            aria-required
                            className="mt-1 w-full border rounded px-2 py-1"
                            value={form.applicantName || ""}
                            onChange={(e) =>
                              update({ applicantName: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">
                          Authorisation for shut down Sign{" "}
                          <span className="text-red-500">*</span>
                        </div>
                        <SignaturePad
                          value={form.authorizerSignature || null}
                          onChange={(d) => update({ authorizerSignature: d })}
                        />
                        <div className="mt-2">
                          <label className="text-xs text-gray-500">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            required
                            aria-required
                            className="mt-1 w-full border rounded px-2 py-1"
                            value={form.authorizerName || ""}
                            onChange={(e) =>
                              update({ authorizerName: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {effectiveStep === 1 && (
            <div className="space-y-4" ref={safetyRef}>
              <div className="bg-white rounded-xl shadow-lg p-4 relative">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 -mx-4 mt-0 mb-4 p-3 rounded-t-md flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-700">
                    Safety Measures & Precautions
                  </div>
                  <div className="text-sm text-slate-500">
                    Rows:{" "}
                    <span className="font-medium text-slate-700">
                      {(form.safetyTable || []).length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-5">
                      <div className="p-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-50">
                        1
                      </div>
                      <div className="p-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-50">
                        SAFETY MEASURES TAKEN
                        <br />
                        BY OPERATIONS
                      </div>
                      <div className="p-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-50">
                        REMARKS
                      </div>
                      <div className="p-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-50">
                        2
                      </div>
                      <div className="p-3 text-center font-semibold text-slate-700 border border-slate-200 bg-slate-50">
                        SPECIAL PRECAUTIONS &amp; POTENTIAL
                        <br />
                        HAZARDS
                        <br />
                        FILLED BY APPLICANT / AUTHORISER
                      </div>
                    </div>

                    {(form.safetyTable || []).map((row, index) => {
                      const leftNum = `1.${index + 1}`;
                      const rightNum = `2.${index + 1}`;
                      return (
                        <div
                          key={index}
                          className="grid grid-cols-5 items-start gap-2 border-b border-slate-200 p-3 transition-opacity duration-200"
                        >
                          <div className="flex items-center justify-center text-sm font-semibold text-slate-700">
                            {leftNum}
                          </div>

                          <div>
                            <input
                              aria-label={`Safety measure ${index + 1}`}
                              type="text"
                              value={row.left || ""}
                              onChange={(e) =>
                                updateSafetyRow(index, "left", e.target.value)
                              }
                              className="w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                            />
                          </div>

                          <div>
                            <input
                              aria-label={`Remarks ${index + 1}`}
                              type="text"
                              value={row.remark || ""}
                              onChange={(e) =>
                                updateSafetyRow(index, "remark", e.target.value)
                              }
                              className="w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                            />
                          </div>

                          <div className="flex items-center justify-center text-sm font-semibold text-slate-700">
                            {rightNum}
                          </div>

                          <div className="relative">
                            {index === 0 && (
                              <div>
                                <label className="text-xs text-slate-500 font-medium">
                                  HIRAC No.
                                </label>
                                <input
                                  aria-label="HIRAC No"
                                  type="text"
                                  value={form.hiracNo || ""}
                                  onChange={(e) =>
                                    update({ hiracNo: e.target.value })
                                  }
                                  className="mt-1 w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                                />
                              </div>
                            )}
                            {index === 1 && (
                              <div>
                                <label className="text-xs text-slate-500 font-medium">
                                  SOP No.
                                </label>
                                <input
                                  aria-label="SOP No"
                                  type="text"
                                  value={form.sopNo || ""}
                                  onChange={(e) =>
                                    update({ sopNo: e.target.value })
                                  }
                                  className="mt-1 w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                                />
                              </div>
                            )}
                            {index === 2 && (
                              <div>
                                <label className="text-xs text-slate-500 font-medium">
                                  TBT Conducted
                                </label>
                                <input
                                  aria-label="TBT Conducted"
                                  type="text"
                                  value={form.tbtConducted || ""}
                                  onChange={(e) =>
                                    update({ tbtConducted: e.target.value })
                                  }
                                  className="mt-1 w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                                />
                              </div>
                            )}
                            {index > 2 && (
                              <input
                                aria-label={`Special precautions ${index + 1}`}
                                type="text"
                                value={row.right || ""}
                                onChange={(e) =>
                                  updateSafetyRow(
                                    index,
                                    "right",
                                    e.target.value,
                                  )
                                }
                                className="w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                              />
                            )}

                            {index > 2 && (
                              <button
                                type="button"
                                aria-label={`Remove row ${index + 1}`}
                                onClick={() => {
                                  const table = (
                                    form.safetyTable || []
                                  ).slice();
                                  table.splice(index, 1);
                                  update({ safetyTable: table });
                                }}
                                className="absolute -right-2 -top-2 w-6 h-6 rounded-full text-sm flex items-center justify-center text-red-600 hover:bg-red-600 hover:text-white transition"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      aria-label="Add row"
                      onClick={() => {
                        const table = (form.safetyTable || []).slice();
                        table.push({ left: "", remark: "", right: "" });
                        update({ safetyTable: table });
                      }}
                      className="absolute right-4 bottom-4 bg-blue-600 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {effectiveStep === 2 && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-xl p-4 relative">
                <div className="w-full text-center text-white font-semibold text-lg rounded-t-2xl bg-gradient-to-r from-blue-900 to-blue-700 py-4">
                  PPE, FIRE PRECAUTIONS, GAS TEST &amp; ASSOCIATED CERTIFICATES
                  TO BE FILLED BY PERMIT APPLICANT
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-slate-700 font-medium">
                      Checklist
                    </div>
                    <div className="text-sm text-slate-500">
                      Completion:{" "}
                      <span className="font-semibold text-blue-600">
                        {step3Progress}%
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="w-full border border-slate-200 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-5 text-sm font-semibold text-white">
                        <div className="bg-slate-50 text-slate-700 p-3 border-r border-slate-200">
                          #
                        </div>
                        <div className="bg-white text-slate-700 p-3 border-r border-slate-200">
                          3A - PPE &amp; OTHERS
                        </div>
                        <div className="bg-slate-50 text-slate-700 p-3 border-r border-slate-200">
                          REMARKS
                        </div>
                        <div className="bg-white text-slate-700 p-3 border-r border-slate-200">
                          3B - FIRE PRECAUTIONS &amp; GAS TESTS
                        </div>
                        <div className="bg-slate-50 text-slate-700 p-3">
                          REMARKS
                        </div>
                      </div>

                      {[
                        {
                          key: "eyeProtection",
                          leftLabel: "Eye, Face & Ear Protection",
                          rightKey: "fireWatcher",
                          rightLabel: "Competent Fire Watcher",
                        },
                        {
                          key: "headProtection",
                          leftLabel: "Head Protection",
                          rightKey: "fireExtinguishers",
                          rightLabel: "Fire Extinguishers",
                        },
                        {
                          key: "bodyProtection",
                          leftLabel:
                            "Body Protection, Full Body Safety Harness",
                          rightKey: "pressureFireHose",
                          rightLabel: "Pressure Fire Hose",
                        },
                        {
                          key: "respiratoryProtection",
                          leftLabel: "Respiratory Protection (BA Set)",
                          rightKey: "fireTender",
                          rightLabel: "Fire Tender",
                        },
                        {
                          key: "legProtection",
                          leftLabel: "Leg Protection",
                          rightKey: "screenOffArea",
                          rightLabel: "Screen off Area",
                        },
                        {
                          key: "portableCOMeter",
                          leftLabel: "Portable CO Meter",
                          rightKey: "explosiveTest",
                          rightLabel: "Explosive Test",
                        },
                        {
                          key: "roofLadder",
                          leftLabel: "Roof Ladder/Gas Cutting Sets",
                          rightKey: "carbonMonoxideTest",
                          rightLabel: "Carbon Monoxide Test",
                        },
                        {
                          key: "safeAccess",
                          leftLabel:
                            "Safe means of access/Scaffolding/Enclosures",
                          rightKey: "oxygenTest",
                          rightLabel: "Oxygen Test",
                        },
                      ].map((r, idx) => (
                        <div
                          key={r.key}
                          className={`grid grid-cols-5 items-center border-t border-slate-200 ${idx % 2 === 0 ? "bg-slate-50" : "bg-white"}`}
                          style={{ gridTemplateColumns: "10% 25% 20% 25% 20%" }}
                        >
                          <div className="p-3 text-center text-slate-700">{`3.${idx + 1}`}</div>
                          <div className="p-3 flex items-center gap-3">
                            <input
                              id={`ppe-${r.key}`}
                              type="checkbox"
                              checked={
                                (form.ppeItems &&
                                  (form.ppeItems as any)[r.key] &&
                                  (form.ppeItems as any)[r.key].checked) ||
                                false
                              }
                              onChange={() => togglePPE(r.key)}
                              className="w-5 h-5 border-2 border-slate-300 rounded-md transition-all duration-200 checked:bg-blue-600 checked:border-blue-600 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30"
                            />
                            <label
                              htmlFor={`ppe-${r.key}`}
                              className="text-slate-700"
                            >
                              {r.leftLabel}
                            </label>
                          </div>
                          <div className="p-3">
                            <textarea
                              aria-label={`ppe-remarks-${r.key}`}
                              value={
                                (form.ppeItems as any)?.[r.key]?.remarks || ""
                              }
                              onChange={(e) =>
                                updatePPERemarks(r.key, e.target.value)
                              }
                              onInput={(e) => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = "auto";
                                t.style.height = `${t.scrollHeight}px`;
                              }}
                              placeholder="Enter remarks..."
                              className="w-full min-h-[44px] resize-none border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                            />
                          </div>
                          <div className="p-3 flex items-center gap-3">
                            <input
                              id={`fire-${r.rightKey}`}
                              type="checkbox"
                              checked={
                                (form.firePrecautions &&
                                  (form.firePrecautions as any)[r.rightKey] &&
                                  (form.firePrecautions as any)[r.rightKey]
                                    .checked) ||
                                false
                              }
                              onChange={() => toggleFire(r.rightKey)}
                              className="w-5 h-5 border-2 border-slate-300 rounded-md transition-all duration-200 checked:bg-blue-600 checked:border-blue-600 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30"
                            />
                            <label
                              htmlFor={`fire-${r.rightKey}`}
                              className="text-slate-700"
                            >
                              {r.rightLabel}
                            </label>
                          </div>
                          <div className="p-3">
                            <textarea
                              aria-label={`fire-remarks-${r.rightKey}`}
                              value={
                                (form.firePrecautions as any)?.[r.rightKey]
                                  ?.remarks || ""
                              }
                              onChange={(e) =>
                                updateFireRemarks(r.rightKey, e.target.value)
                              }
                              onInput={(e) => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = "auto";
                                t.style.height = `${t.scrollHeight}px`;
                              }}
                              placeholder="Enter remarks..."
                              className="w-full min-h-[44px] resize-none border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                            />
                          </div>
                        </div>
                      ))}

                      {(form.customItems || []).map((c, i) => (
                        <div
                          key={c.id}
                          className={`grid grid-cols-5 items-center border-t border-slate-200 ${(8 + i) % 2 === 0 ? "bg-slate-50" : "bg-white"}`}
                          style={{ gridTemplateColumns: "10% 25% 20% 25% 20%" }}
                        >
                          <div className="p-3 text-center text-slate-700">{`3.${9 + i}`}</div>
                          <div className="p-3">
                            <input
                              aria-label={`custom-ppe-${c.id}`}
                              type="text"
                              value={c.ppeItem}
                              onChange={(e) =>
                                updateCustomItem(
                                  c.id,
                                  "ppeItem",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter custom PPE item..."
                              className="w-full border border-slate-200 bg-slate-100 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                            />
                          </div>
                          <div className="p-3">
                            <input
                              aria-label={`custom-ppe-remarks-${c.id}`}
                              type="text"
                              value={c.ppeRemarks}
                              onChange={(e) =>
                                updateCustomItem(
                                  c.id,
                                  "ppeRemarks",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter remarks..."
                              className="w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                            />
                          </div>
                          <div className="p-3">
                            <input
                              aria-label={`custom-fire-${c.id}`}
                              type="text"
                              value={c.fireItem}
                              onChange={(e) =>
                                updateCustomItem(
                                  c.id,
                                  "fireItem",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter custom fire precaution..."
                              className="w-full border border-slate-200 bg-slate-100 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                            />
                          </div>
                          <div className="p-3 flex items-center gap-2">
                            <input
                              aria-label={`custom-fire-remarks-${c.id}`}
                              type="text"
                              value={c.fireRemarks}
                              onChange={(e) =>
                                updateCustomItem(
                                  c.id,
                                  "fireRemarks",
                                  e.target.value,
                                )
                              }
                              placeholder="Enter remarks..."
                              className="w-full border border-slate-200 bg-slate-50 px-3 py-2 rounded-md focus:outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400 transition"
                            />
                            <button
                              type="button"
                              aria-label={`Remove custom ${c.id}`}
                              onClick={() => removeCustomItem(c.id)}
                              className="text-red-600 hover:text-white hover:bg-red-600 rounded-full w-7 h-7 flex items-center justify-center ml-2 transition"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative mt-4">
                    <button
                      type="button"
                      aria-label="Add custom row"
                      onClick={addCustomItem}
                      className="absolute right-0 -bottom-6 bg-blue-600 text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {effectiveStep === 3 && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-lg p-6 relative">
                <div className="w-full text-left text-slate-800 font-bold text-lg rounded-t-md bg-gradient-to-r from-slate-100 to-slate-200 py-4 px-4">
                  3C - CERTIFICATES
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-slate-700 font-medium">
                    Certificates
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={checkAllCertificates}
                      className="text-sm px-3 py-1 bg-blue-600 text-white rounded-md"
                    >
                      Check All
                    </button>
                    <button
                      type="button"
                      onClick={uncheckAllCertificates}
                      className="text-sm px-3 py-1 border border-slate-200 rounded-md text-slate-700"
                    >
                      Uncheck All
                    </button>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <div className="w-full border border-slate-200 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-12 text-sm font-bold text-slate-800">
                      <div className="p-4 border-b border-r border-slate-200 md:col-span-5">
                        3C - CERTIFICATES
                      </div>
                      <div className="p-4 border-b border-slate-200">
                        CERTIFICATE NOS.
                      </div>
                    </div>

                    {[
                      { key: "confinedSpace", label: "Confined Space Entry" },
                      { key: "loto", label: "LOTO (Lock Out Tag Out)" },
                      { key: "electrical", label: "Electrical" },
                      { key: "workingAtHeight", label: "Working at Height" },
                      { key: "excavation", label: "Excavation" },
                      { key: "heavyLift", label: "Heavy Lift" },
                      { key: "roadClosure", label: "Road Closure" },
                      { key: "radiography", label: "Radiography" },
                      { key: "gasLine", label: "Gas Line" },
                      { key: "highTension", label: "High Tension" },
                    ].map((c, idx) => {
                      const cert = (form.certificates as any) || {};
                      const data = cert[c.key] || {
                        checked: false,
                        number: "",
                      };
                      return (
                        <div
                          key={c.key}
                          className={`grid grid-cols-12 items-center ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"} border-b border-slate-200`}
                          style={{ gridTemplateColumns: "40% 60%" }}
                        >
                          <div
                            className={`p-4 flex items-center gap-3 ${data.checked ? "bg-blue-50" : ""}`}
                          >
                            <input
                              id={`cert-${c.key}`}
                              type="checkbox"
                              checked={data.checked}
                              onChange={() => toggleCertificate(c.key)}
                              className="w-5 h-5 border-2 border-slate-300 rounded-md transition-all duration-200 checked:bg-blue-600 checked:border-blue-600 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-30"
                              aria-label={`${c.label} checkbox`}
                            />
                            <label
                              htmlFor={`cert-${c.key}`}
                              className="text-sm text-slate-800"
                            >
                              {c.label}
                            </label>
                          </div>

                          <div className="p-4">
                            <input
                              id={`cert-${c.key}-num`}
                              type="text"
                              value={data.number || ""}
                              onChange={(e) =>
                                updateCertificateNumber(c.key, e.target.value)
                              }
                              placeholder="Enter certificate number..."
                              className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 placeholder-slate-400 text-sm transition"
                              aria-label={`${c.label} certificate number`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {effectiveStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                  <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
                    PERMIT APPLICANT
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-sm text-slate-700 font-medium">
                        SIGN
                      </div>
                      <SignaturePad
                        value={
                          (form.permitData as any)?.applicant?.signature || null
                        }
                        onChange={saveApplicantSignature}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        NAME
                      </label>
                      <input
                        type="text"
                        value={(form.permitData as any)?.applicant?.name || ""}
                        onChange={(e) =>
                          updatePermitField("applicant.name", e.target.value)
                        }
                        placeholder="Full name"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        Contact No.
                      </label>
                      <input
                        type="tel"
                        value={
                          (form.permitData as any)?.applicant?.contactNo || ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "applicant.contactNo",
                            e.target.value,
                          )
                        }
                        placeholder="Phone number"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                  <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
                    PERMIT HOLDER
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-sm text-slate-700 font-medium">
                        SIGN
                      </div>
                      <SignaturePad
                        value={
                          (form.permitData as any)?.holder?.signature || null
                        }
                        onChange={saveHolderSignature}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        NAME
                      </label>
                      <input
                        type="text"
                        value={(form.permitData as any)?.holder?.name || ""}
                        onChange={(e) =>
                          updatePermitField("holder.name", e.target.value)
                        }
                        placeholder="Full name"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        Contact No.
                      </label>
                      <input
                        type="tel"
                        value={
                          (form.permitData as any)?.holder?.contactNo || ""
                        }
                        onChange={(e) =>
                          updatePermitField("holder.contactNo", e.target.value)
                        }
                        placeholder="Phone number"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
                <div className="text-center bg-gradient-to-r from-blue-700 to-blue-800 text-white font-bold py-3 rounded-md">
                  PERMIT AUTHORISER
                </div>

                <div className="mt-4">
                  <div className="text-sm text-slate-800 font-semibold">
                    PERMIT VALIDITY
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        Date From
                      </label>
                      <input
                        type="date"
                        value={
                          (form.permitData as any)?.authoriser?.validity
                            ?.dateFrom || ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "authoriser.validity.dateFrom",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        Date To
                      </label>
                      <input
                        type="date"
                        value={
                          (form.permitData as any)?.authoriser?.validity
                            ?.dateTo || ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "authoriser.validity.dateTo",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        Time From
                      </label>
                      <input
                        type="time"
                        value={
                          (form.permitData as any)?.authoriser?.validity
                            ?.timeFrom || ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "authoriser.validity.timeFrom",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        Time To
                      </label>
                      <input
                        type="time"
                        value={
                          (form.permitData as any)?.authoriser?.validity
                            ?.timeTo || ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "authoriser.validity.timeTo",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-slate-700 font-medium">
                        SIGN
                      </div>
                      <SignaturePad
                        value={
                          (form.permitData as any)?.authoriser?.contact?.sign ||
                          null
                        }
                        onChange={saveAuthoriserSign}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        NAME
                      </label>
                      <input
                        type="text"
                        value={
                          (form.permitData as any)?.authoriser?.contact?.name ||
                          ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "authoriser.contact.name",
                            e.target.value,
                          )
                        }
                        placeholder="Full name"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        CONTACT NO.
                      </label>
                      <input
                        type="tel"
                        value={
                          (form.permitData as any)?.authoriser?.contact
                            ?.contactNo || ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "authoriser.contact.contactNo",
                            e.target.value,
                          )
                        }
                        placeholder="Phone number"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-slate-700 font-medium">
                        AUTHORISER NOMINEE SIGN
                      </div>
                      <SignaturePad
                        value={
                          (form.permitData as any)?.authoriser?.nominee?.sign ||
                          null
                        }
                        onChange={saveNomineeSign}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        NAME
                      </label>
                      <input
                        type="text"
                        value={
                          (form.permitData as any)?.authoriser?.nominee?.name ||
                          ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "authoriser.nominee.name",
                            e.target.value,
                          )
                        }
                        placeholder="Full name"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        SAP ID
                      </label>
                      <input
                        type="text"
                        value={
                          (form.permitData as any)?.authoriser?.nominee
                            ?.sapId || ""
                        }
                        onChange={(e) =>
                          updatePermitField(
                            "authoriser.nominee.sapId",
                            e.target.value,
                          )
                        }
                        placeholder="SAP ID"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder-slate-400 text-sm transition"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {effectiveStep === 5 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                  <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
                    4A - PERMIT RETURN - WORK COMPLETE
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="text-sm text-slate-700 font-medium">
                        4.1 - Permit Return by Permit Holder
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <div>
                          <div className="text-sm text-slate-700 font-medium">
                            SIGN
                          </div>
                          <SignaturePad
                            value={
                              (form.permitStatus as any)?.workComplete?.holder
                                ?.sign || null
                            }
                            onChange={(d) =>
                              updatePermitStatusField(
                                "workComplete.holder.sign",
                                d,
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700 font-medium">
                            NAME
                          </label>
                          <input
                            type="text"
                            value={
                              (form.permitStatus as any)?.workComplete?.holder
                                ?.name || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.holder.name",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={
                              (form.permitStatus as any)?.workComplete?.holder
                                ?.date || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.holder.date",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                          <input
                            type="time"
                            value={
                              (form.permitStatus as any)?.workComplete?.holder
                                ?.time || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.holder.time",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-700 font-medium">
                        4.2 - Permit Return by Applicant
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <div>
                          <div className="text-sm text-slate-700 font-medium">
                            SIGN
                          </div>
                          <SignaturePad
                            value={
                              (form.permitStatus as any)?.workComplete
                                ?.applicant?.sign || null
                            }
                            onChange={(d) =>
                              updatePermitStatusField(
                                "workComplete.applicant.sign",
                                d,
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700 font-medium">
                            NAME
                          </label>
                          <input
                            type="text"
                            value={
                              (form.permitStatus as any)?.workComplete
                                ?.applicant?.name || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.applicant.name",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={
                              (form.permitStatus as any)?.workComplete
                                ?.applicant?.date || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.applicant.date",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                          <input
                            type="time"
                            value={
                              (form.permitStatus as any)?.workComplete
                                ?.applicant?.time || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.applicant.time",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-slate-700 font-medium">
                        4.3 - Permit Accepted by Authoriser
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <div>
                          <div className="text-sm text-slate-700 font-medium">
                            SIGN
                          </div>
                          <SignaturePad
                            value={
                              (form.permitStatus as any)?.workComplete
                                ?.authoriser?.sign || null
                            }
                            onChange={(d) =>
                              updatePermitStatusField(
                                "workComplete.authoriser.sign",
                                d,
                              )
                            }
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-700 font-medium">
                            NAME
                          </label>
                          <input
                            type="text"
                            value={
                              (form.permitStatus as any)?.workComplete
                                ?.authoriser?.name || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.authoriser.name",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={
                              (form.permitStatus as any)?.workComplete
                                ?.authoriser?.date || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.authoriser.date",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                          <input
                            type="time"
                            value={
                              (form.permitStatus as any)?.workComplete
                                ?.authoriser?.time || ""
                            }
                            onChange={(e) =>
                              updatePermitStatusField(
                                "workComplete.authoriser.time",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                  <div className="text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 rounded-md">
                    4B - PERMIT RETURN - WNC
                  </div>
                  <div className="mt-4 space-y-4">
                    {["holder", "applicant", "authoriser"].map((k) => (
                      <div key={k}>
                        <div className="text-sm text-slate-700 font-medium">{`${k === "holder" ? "5.1" : k === "applicant" ? "5.2" : "5.3"} - ${k.charAt(0).toUpperCase() + k.slice(1)} Return`}</div>
                        <div className="mt-2 grid grid-cols-1 gap-2">
                          <div>
                            <div className="text-sm text-slate-700 font-medium">
                              SIGN
                            </div>
                            <SignaturePad
                              value={
                                (form.permitStatus as any)?.workNotComplete?.[k]
                                  ?.sign || null
                              }
                              onChange={(d) =>
                                updatePermitStatusField(
                                  `workNotComplete.${k}.sign`,
                                  d,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm text-slate-700 font-medium">
                              NAME
                            </label>
                            <input
                              type="text"
                              value={
                                (form.permitStatus as any)?.workNotComplete?.[k]
                                  ?.name || ""
                              }
                              onChange={(e) =>
                                updatePermitStatusField(
                                  `workNotComplete.${k}.name`,
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="date"
                              value={
                                (form.permitStatus as any)?.workNotComplete?.[k]
                                  ?.date || ""
                              }
                              onChange={(e) =>
                                updatePermitStatusField(
                                  `workNotComplete.${k}.date`,
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                            />
                            <input
                              type="time"
                              value={
                                (form.permitStatus as any)?.workNotComplete?.[k]
                                  ?.time || ""
                              }
                              onChange={(e) =>
                                updatePermitStatusField(
                                  `workNotComplete.${k}.time`,
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                  <div className="text-center bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-3 rounded-md">
                    PERMIT CANCELLATION
                  </div>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium">
                        Reason
                      </label>
                      <input
                        type="text"
                        value={
                          (form.permitStatus as any)?.cancellation?.reason || ""
                        }
                        onChange={(e) =>
                          updatePermitStatusField(
                            "cancellation.reason",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <div className="text-sm text-slate-700 font-medium">
                          SIGN
                        </div>
                        <SignaturePad
                          value={
                            (form.permitStatus as any)?.cancellation?.sign ||
                            null
                          }
                          onChange={(d) =>
                            updatePermitStatusField("cancellation.sign", d)
                          }
                        />
                      </div>
                      <div>
                        <label className="text-sm text-slate-700 font-medium">
                          NAME
                        </label>
                        <input
                          type="text"
                          value={
                            (form.permitStatus as any)?.cancellation?.name || ""
                          }
                          onChange={(e) =>
                            updatePermitStatusField(
                              "cancellation.name",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="date"
                          value={
                            (form.permitStatus as any)?.cancellation?.date || ""
                          }
                          onChange={(e) =>
                            updatePermitStatusField(
                              "cancellation.date",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                        />
                        <input
                          type="time"
                          value={
                            (form.permitStatus as any)?.cancellation?.time || ""
                          }
                          onChange={(e) =>
                            updatePermitStatusField(
                              "cancellation.time",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="text-center bg-gradient-to-r from-slate-700 to-slate-800 text-white font-bold py-3 rounded-md">
                  PERMIT RE-VALIDATION
                </div>
                <div className="mt-4 overflow-x-auto">
                  <div className="min-w-[1000px] md:min-w-0 border border-slate-200 rounded-md">
                    <div className="grid grid-cols-9 text-sm font-semibold text-slate-700">
                      <div className="p-3 border-b border-r border-slate-200 text-xs md:text-sm whitespace-normal break-words md:col-span-1">
                        DATE
                      </div>
                      <div className="p-3 border-b border-r border-slate-200 text-xs md:text-sm whitespace-normal break-words">
                        Time From
                      </div>
                      <div className="p-3 border-b border-r border-slate-200 text-xs md:text-sm whitespace-normal break-words">
                        Time To
                      </div>
                      <div className="p-3 border-b border-r border-slate-200 text-xs md:text-sm whitespace-normal break-words">
                        APPLICANT
                        <br />
                        SIGN
                      </div>
                      <div className="p-3 border-b border-r border-slate-200 text-xs md:text-sm whitespace-normal break-words">
                        APPLICANT
                        <br />
                        NAME
                      </div>
                      <div className="p-3 border-b border-r border-slate-200 text-xs md:text-sm whitespace-normal break-words">
                        HOLDER
                        <br />
                        SIGN
                      </div>
                      <div className="p-3 border-b border-r border-slate-200 text-xs md:text-sm whitespace-normal break-words">
                        HOLDER
                        <br />
                        NAME
                      </div>
                      <div className="p-3 border-b border-r border-slate-200 text-xs md:text-sm whitespace-normal break-words">
                        AUTHORISER
                        <br />
                        SIGN
                      </div>
                      <div className="p-3 border-b border-slate-200 text-xs md:text-sm whitespace-normal break-words">
                        AUTHORISER
                        <br />
                        NAME
                      </div>
                    </div>

                    {((form.permitStatus as any)?.revalidations || []).map(
                      (r: any) => (
                        <div
                          key={r.id}
                          className="grid grid-cols-9 items-center border-t border-slate-200 p-2"
                        >
                          <div className="p-2 md:p-2">
                            <input
                              type="date"
                              value={r.date || ""}
                              onChange={(e) =>
                                updateRevalidationRow(
                                  r.id,
                                  "date",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white text-sm"
                            />
                          </div>
                          <div className="p-2 md:p-2">
                            <input
                              type="time"
                              value={r.timeFrom || ""}
                              onChange={(e) =>
                                updateRevalidationRow(
                                  r.id,
                                  "timeFrom",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white text-sm"
                            />
                          </div>
                          <div className="p-2 md:p-2">
                            <input
                              type="time"
                              value={r.timeTo || ""}
                              onChange={(e) =>
                                updateRevalidationRow(
                                  r.id,
                                  "timeTo",
                                  e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white text-sm"
                            />
                          </div>
                          <div className="p-2 md:p-2">
                            <SignaturePad
                              value={r.applicant?.sign || null}
                              onChange={(d) =>
                                updateRevalidationRow(r.id, "applicant", {
                                  ...r.applicant,
                                  sign: d,
                                })
                              }
                            />
                          </div>
                          <div className="p-2 md:p-2">
                            <input
                              type="text"
                              value={r.applicant?.name || ""}
                              onChange={(e) =>
                                updateRevalidationRow(r.id, "applicant", {
                                  ...r.applicant,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white text-sm"
                            />
                          </div>
                          <div className="p-2 md:p-2">
                            <SignaturePad
                              value={r.holder?.sign || null}
                              onChange={(d) =>
                                updateRevalidationRow(r.id, "holder", {
                                  ...r.holder,
                                  sign: d,
                                })
                              }
                            />
                          </div>
                          <div className="p-2 md:p-2">
                            <input
                              type="text"
                              value={r.holder?.name || ""}
                              onChange={(e) =>
                                updateRevalidationRow(r.id, "holder", {
                                  ...r.holder,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white text-sm"
                            />
                          </div>
                          <div className="p-2 md:p-2">
                            <SignaturePad
                              value={r.authoriser?.sign || null}
                              onChange={(d) =>
                                updateRevalidationRow(r.id, "authoriser", {
                                  ...r.authoriser,
                                  sign: d,
                                })
                              }
                            />
                          </div>
                          <div className="p-2 md:p-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={r.authoriser?.name || ""}
                              onChange={(e) =>
                                updateRevalidationRow(r.id, "authoriser", {
                                  ...r.authoriser,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 focus:bg-white text-sm"
                            />
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={addRevalidationRow}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    + Add Row
                  </button>
                </div>
              </div>
            </div>
          )}

          {effectiveStep === 6 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mx-auto max-w-3xl">
                <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md shadow-sm">
                  SAFE LIMIT OF GASES / VAPOURS
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-800 text-white">
                        <th className="text-left px-2 py-2 border border-gray-300">
                          GAS
                        </th>
                        <th className="text-center px-2 py-2 border border-gray-300">
                          SAFE CONCENTRATION FOR 8 HRS DURATION
                        </th>
                        <th className="text-center px-2 py-2 border border-gray-300">
                          FLAMMABLE LIMITS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="odd:bg-white even:bg-gray-50 text-sm">
                        <td className="px-2 py-2 border border-gray-300">
                          CARBON MONOXIDE
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          50 PPM
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          12.5% / 74.2%
                        </td>
                      </tr>
                      <tr className="odd:bg-white even:bg-gray-50 text-sm">
                        <td className="px-2 py-2 border border-gray-300">
                          HYDROGEN
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          -
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          4.0% / 75%
                        </td>
                      </tr>
                      <tr className="odd:bg-white even:bg-gray-50 text-sm">
                        <td className="px-2 py-2 border border-gray-300">
                          METHANE / NATURAL GAS
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          1000 PPM
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          5.9% / 14%
                        </td>
                      </tr>
                      <tr className="odd:bg-white even:bg-gray-50 text-sm">
                        <td className="px-2 py-2 border border-gray-300">
                          AMMONIA
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          25 PPM
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          16% / 23%
                        </td>
                      </tr>
                      <tr className="odd:bg-white even:bg-gray-50 text-sm">
                        <td className="px-2 py-2 border border-gray-300">
                          CHLORINE
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          1 PPM
                        </td>
                        <td className="px-2 py-2 border border-gray-300 text-center">
                          &nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold">
                    IMPORTANT INSTRUCTIONS:
                  </div>
                  <ol className="list-decimal list-inside mt-2 text-sm space-y-1 text-slate-700">
                    <li>
                      A Permit-to-Work or Certificate is normally valid for one
                      shift only. However, it can be extended for a maximum of
                      seven days more with appropriate renewals.
                    </li>
                    <li>
                      Permit is not valid in the event, if conditions in the
                      incident area become Hazardous from conditions not
                      existing when this permit was issued or in the event of
                      any Emergency / Fire.
                    </li>
                    <li>The authorized person should issue permit only.</li>
                    <li>
                      Work Instructions &amp; Protocol procedures are to be
                      strictly followed.
                    </li>
                    <li>
                      If job is not completed within the validity time period,
                      the authorized person incorporating necessary changes must
                      extend the permit.
                    </li>
                    <li>
                      Permit must be returned by the applicant to the issuing
                      authority after completion of the job.
                    </li>
                    <li>
                      When more than one agency is working at a place the
                      concerned agencies must co-ordinate among themselves for
                      safety of the persons working there.
                    </li>
                    <li>
                      No job should be attempted / to be done for which permit
                      is not issued.
                    </li>
                    <li>
                      Workers must be briefed about imminent dangers involved in
                      the job.
                    </li>
                    <li>
                      Persons working at height and Confined Space should be
                      medically checked for acrophobia and claustrophobia
                      respectively.
                    </li>
                    <li>
                      Separate Certificates are to be taken for the jobs
                      involving Excavation, Confined Space Entry, Working at
                      Height, Radiography, Electrical, LOTO, Road Closure &amp;
                      Heavy Lift jobs.
                    </li>
                    <li>
                      Results for the Confined Space Entry to be periodically
                      recorded in the Certificate.
                    </li>
                  </ol>

                  <p className="mt-2 text-xs italic">
                    NOTE: If the Applicant does not fill it, Authorizer can fill
                    it up if necessary or write "NIL"
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <div className="border p-4 rounded font-semibold text-center">
                    BEFORE AUTHORISING THE PERMIT
                    <br />
                    <span className="block mt-2">
                      ENSURE THAT SITE IS SAFE TO WORK &amp; SAFE WORKING
                      CONDITIONS ARE MAINTAINED
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold">Legend</div>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <div className="text-green-600 font-bold">✓</div>
                      <div>Measures Taken</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-red-600 font-bold">X</div>
                      <div>Measures Not Required</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="font-semibold">NA</div>
                      <div>Not Applicable</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
      )}

      {effectiveStep === 7 && (
            <StepSection title="Details of such permit">
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-md border border-slate-200 p-4 sm:p-6">
                  <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 rounded-md">
                    Details of such permit
                  </div>
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Permit Requester</div>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            placeholder="Search user..."
                            className="w-full rounded border px-3 py-2 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Permit Approver 1</div>
                        <input
                          aria-label="Permit Approver 1"
                          value={form.permitApprover1 || ""}
                          onChange={(e) => update({ permitApprover1: e.target.value })}
                          className="w-full mt-1 rounded border px-3 py-2 text-sm"
                          placeholder="Approver name or role"
                        />
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Permit Approver 2</div>
                        <input
                          aria-label="Permit Approver 2"
                          value={form.permitApprover2 || ""}
                          onChange={(e) => update({ permitApprover2: e.target.value })}
                          className="w-full mt-1 rounded border px-3 py-2 text-sm"
                          placeholder="Approver name or role"
                        />
                      </div>

                      <div>
                        <div className="text-xs text-gray-500">Safety Manager</div>
                        <input
                          aria-label="Safety Manager"
                          value={form.safetyManager || ""}
                          onChange={(e) => update({ safetyManager: e.target.value })}
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
                          value={form.permitIssueDate || ""}
                          onChange={(e) => update({ permitIssueDate: e.target.value })}
                          className="w-full mt-1 rounded border px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">
                          Expected Return Date
                        </label>
                        <input
                          type="date"
                          value={form.expectedReturnDate || ""}
                          onChange={(e) =>
                            update({ expectedReturnDate: e.target.value })
                          }
                          className="w-full mt-1 rounded border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                  {/* Comments from Approver (read-only) */}
                  {(() => {
                    try {
                      const raw =
                        typeof window !== "undefined"
                          ? localStorage.getItem("dps_approver_comments_work")
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
                          <div className="text-md font-medium">Comments from Approver:</div>
                          <div className="mt-2 space-y-1 text-sm">
                            {hasAny ? (
                              <>
                                {aData?.approverRequireUrgent && (
                                  <div>Require on urgent basis</div>
                                )}
                                {aData?.approverSafetyManagerApproval && (
                                  <div>Safety Manager approval required</div>
                                )}
                                {(aData?.approverPlannedShutdown ||
                                  aData?.approverPlannedShutdownDate) && (
                                  <div>
                                    Planned shutdown on: {aData?.approverPlannedShutdownDate || ""}
                                  </div>
                                )}
                                {(aData?.approverCustomComments || []).map(
                                  (it: any, i: number) => (
                                    <div key={i}>- {typeof it === "string" ? it : it.text}</div>
                                  ),
                                )}
                              </>
                            ) : (
                              <div className="text-gray-500">No comments from approver yet</div>
                            )}
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                          <div className="text-md font-medium">Comments from Approver:</div>
                          <div className="mt-2 space-y-1 text-sm text-gray-500">No comments from approver yet</div>
                        </div>
                      );
                    }
                  })()}

                  {(() => {
                    try {
                      const raw =
                        typeof window !== "undefined"
                          ? localStorage.getItem(
                              "dps_safety_to_requester_comments_work",
                            )
                          : null;
                      const sData = raw ? JSON.parse(raw) : null;
                      return (
                        <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                          <div className="text-md font-medium">Comments from Safety Officer:</div>
                          <div className="mt-2 space-y-1 text-sm">
                            {sData?.safetyToRequesterRequireUrgent && (
                              <div>Require on urgent basis</div>
                            )}
                            {sData?.safetyToRequesterSafetyManagerApproval && (
                              <div>Safety Manager approval required</div>
                            )}
                            {(sData?.safetyToRequesterPlannedShutdown ||
                              sData?.safetyToRequesterPlannedShutdownDate) && (
                              <div>
                                Planned shutdown on: {sData?.safetyToRequesterPlannedShutdownDate || ""}
                              </div>
                            )}
                            {(sData?.safetyToRequesterCustomComments || []).map(
                              (it: any, i: number) => (
                                <div key={i}>- {typeof it === "string" ? it : it.text}</div>
                              ),
                            )}
                            {!sData?.safetyToRequesterRequireUrgent &&
                              !sData?.safetyToRequesterSafetyManagerApproval &&
                              !(
                                sData?.safetyToRequesterPlannedShutdown ||
                                sData?.safetyToRequesterPlannedShutdownDate
                              ) &&
                              (sData?.safetyToRequesterCustomComments || []).length === 0 && (
                              <div className="text-gray-500">No comments from safety officer yet</div>
                            )}
                          </div>
                        </div>
                      );
                    } catch (e) {
                      return (
                        <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                          <div className="text-md font-medium">Comments from Safety Officer:</div>
                          <div className="mt-2 space-y-1 text-sm text-gray-500">No comments from safety officer yet</div>
                        </div>
                      );
                    }
                  })()}

                  <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                    <div className="text-md font-medium">
                      Comments for Approver:
                    </div>
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={!!form.requesterRequireUrgent}
                        onChange={(e) =>
                          update({ requesterRequireUrgent: e.target.checked })
                        }
                      />
                      Require on urgent basis
                    </label>
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={!!form.requesterSafetyManagerApproval}
                        onChange={(e) =>
                          update({
                            requesterSafetyManagerApproval: e.target.checked,
                          })
                        }
                      />
                      Safety Manager approval required
                    </label>
                    <div className="mt-2 text-md flex items-center gap-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!form.requesterPlannedShutdown}
                          onChange={(e) =>
                            update({
                              requesterPlannedShutdown: e.target.checked,
                            })
                          }
                        />
                        <span>Planned shutdown on:</span>
                      </label>
                      <input
                        type="date"
                        className="rounded border px-2 py-1 text-sm"
                        value={form.requesterPlannedShutdownDate || ""}
                        onChange={(e) =>
                          update({
                            requesterPlannedShutdownDate: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="mt-3">
                      <div className="mt-2 space-y-1">
                        {(form.requesterCustomComments || []).map(
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
                                        form.requesterCustomComments || [];
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
                                      update({ requesterCustomComments: next });
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
                                        form.requesterCustomComments || [];
                                      const next = prev.filter(
                                        (_: any, i: number) => i !== idx,
                                      );
                                      update({ requesterCustomComments: next });
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

                      <p className="text-xs font-medium mt-2">Add comment</p>
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
                          onClick={() => {
                            const v = newRequesterComment.trim();
                            if (!v) return;
                            const prev = form.requesterCustomComments || [];
                            update({
                              requesterCustomComments: [
                                ...prev,
                                { text: v, checked: false },
                              ],
                            });
                            setNewRequesterComment("");
                          }}
                          className="px-3 py-1 rounded bg-white border text-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comments for Safety Officer (interactive) */}
                  <div className="mt-4 bg-yellow-50 p-3 rounded-md">
                    <div className="text-md font-medium">Comments for Safety Officer:</div>
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={!!(form as any).requesterSafetyRequireUrgent}
                        onChange={(e) =>
                          update({ requesterSafetyRequireUrgent: e.target.checked } as any)
                        }
                      />
                      Require on urgent basis
                    </label>
                    <label className="flex items-center gap-2 mt-2">
                      <input
                        type="checkbox"
                        checked={!!(form as any).requesterSafetySafetyManagerApproval}
                        onChange={(e) =>
                          update({ requesterSafetySafetyManagerApproval: e.target.checked } as any)
                        }
                      />
                     Approver approval required
                    </label>
                    <div className="mt-2 text-md flex items-center gap-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!(form as any).requesterSafetyPlannedShutdown}
                          onChange={(e) =>
                            update({ requesterSafetyPlannedShutdown: e.target.checked } as any)
                          }
                        />
                        <span>
                        Planned shutdown on:
                        </span>
                      </label>
                      <input
                        type="date"
                        className="rounded border px-2 py-1 text-sm"
                        value={(form as any).requesterSafetyPlannedShutdownDate || ""}
                        onChange={(e) =>
                          update({ requesterSafetyPlannedShutdownDate: e.target.value } as any)
                        }
                      />
                    </div>

                    <div className="mt-3">
                      <div className="mt-2 space-y-1">
                        {((form as any).requesterSafetyCustomComments || []).map(
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
                                        (form as any).requesterSafetyCustomComments || [];
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
                                      update({ requesterSafetyCustomComments: next } as any);
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
                                        (form as any).requesterSafetyCustomComments || [];
                                      const next = prev.filter(
                                        (_: any, i: number) => i !== idx,
                                      );
                                      update({ requesterSafetyCustomComments: next } as any);
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

                      <p className="text-xs font-medium mt-2">Add comment</p>
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
                            const prev = (form as any).requesterSafetyCustomComments || [];
                            update({
                              requesterSafetyCustomComments: [
                                ...prev,
                                { text: v, checked: false },
                              ],
                            } as any);
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
          )}
        </div>

        <StepActions
          onBack={prev}
          onSave={saveDraft}
          onNext={() => {
            if (currentStep === steps.length - 1) {
              submit();
              return;
            }
            next();
          }}
          onPreview={preview}
          nextLabel={
            currentStep === steps.length - 1 ? "Submit Permit" : "Next Step"
          }
          disableNext={false}
          isFirst={currentStep === 0}
          isLast={currentStep === steps.length - 1}
        />
      </div>
    </div>
    </div>
  );
}
