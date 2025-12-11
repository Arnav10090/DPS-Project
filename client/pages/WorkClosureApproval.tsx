import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import { Check, Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ApproverClosure() {
  const navigate = useNavigate();
  const [decision, setDecision] = useState<"approve" | "reject" | "request">(
    "approve",
  );
  const [comments, setComments] = useState("");
  const [commentsTouched, setCommentsTouched] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    item1: true,
    item2: true,
    item3: true,
    item4: true,
    item5: true,
    item6: true,
    item7: false,
  });
  const [signature, setSignature] = useState<string | null>(null);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const permit = useMemo(
    () => ({
      id: "WCS-2024-001",
      requester: "John Doe",
      department: "Maintenance Team",
      workType: "Electrical Maintenance",
      location: "Building A, Electrical Room 2A",
      startedAt: "15 Jan 2024, 09:00 AM",
      deadline: "16 Jan 2024, 05:00 PM",
      requestedClosure: "16 Jan 2024, 07:00 PM",
      duration: "34 hours",
      safetyOfficer: "Mike Chen",
      approver: "Sarah Wilson",
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      status: "CLOSURE REQUESTED",
      overdue: "OVERDUE BY 2 HOURS",
    }),
    [],
  );

  const files = useMemo(
    () => [
      {
        id: "f1",
        src: "https://via.placeholder.com/600x400?text=Photo+1",
        name: "photo1.jpg",
        size: "1.2 MB",
      },
      {
        id: "f2",
        src: "https://via.placeholder.com/600x400?text=Photo+2",
        name: "photo2.jpg",
        size: "980 KB",
      },
      {
        id: "f3",
        src: "https://via.placeholder.com/600x400?text=Photo+3",
        name: "doc1.pdf",
        size: "240 KB",
      },
      {
        id: "f4",
        src: "https://via.placeholder.com/600x400?text=Photo+4",
        name: "photo4.jpg",
        size: "2.1 MB",
      },
      {
        id: "f5",
        src: "https://via.placeholder.com/600x400?text=Photo+5",
        name: "photo5.jpg",
        size: "840 KB",
      },
      {
        id: "f6",
        src: "https://via.placeholder.com/600x400?text=Photo+6",
        name: "report.pdf",
        size: "450 KB",
      },
    ],
    [],
  );

  useEffect(() => {
    // setup minimal signature canvas events
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e40af";
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    const getPos = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const down = (e: PointerEvent) => {
      drawing = true;
      const p = getPos(e);
      lastX = p.x;
      lastY = p.y;
    };
    const move = (e: PointerEvent) => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lastX = p.x;
      lastY = p.y;
    };
    const up = () => {
      if (!drawing) return;
      drawing = false;
      try {
        setSignature(canvas.toDataURL("image/png"));
      } catch {}
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  function clearSignature() {
    const c = sigCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    setSignature(null);
  }

  const checklistOk = Object.values(checklist).every(Boolean);
  const commentsRequired = decision !== "approve";
  const commentsOk =
    !commentsRequired ||
    (comments.trim().length > 0 && comments.trim().length <= 500);
  const signatureRequired = true;
  const signatureOk = !!signature;
  const canSubmit =
    checklistOk && commentsOk && (!signatureRequired || signatureOk);

  function submitAction() {
    setCommentsTouched(true);
    if (!canSubmit) return;
    setShowConfirm(true);
  }
  function confirmSubmit() {
    setShowConfirm(false);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => navigate("/approver/dashboard"), 3000);
    }, 1200);
  }

  if (success) {
    return (
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-md text-center">
          <div className="text-3xl text-emerald-600 font-bold">✓</div>
          <div className="text-xl font-semibold mt-3">
            Work closure approved and closed
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Permit {permit.id} has been closed. Redirecting to dashboard...
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <Button onClick={() => navigate("/approver/dashboard")}>
              Back to Dashboard
            </Button>
            <Button variant="outline" onClick={() => setSuccess(false)}>
              View Closed Permit
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <div className="grid lg:grid-cols-[60%_40%] gap-6">
        <div>
          <Card>
            <div className="border-l-4 border-blue-500">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Submitted{" "}
                      {formatDistanceToNow(new Date(permit.submittedAt), {
                        addSuffix: true,
                      })}
                    </div>
                    <div className="text-xl font-bold">Permit #{permit.id}</div>
                    <div className="mt-2 flex gap-2">
                      <div className="inline-block bg-orange-500 text-white rounded-full px-3 py-1 text-xs font-semibold">
                        {permit.status}
                      </div>
                      <div className="inline-block bg-red-500 text-white rounded-full px-3 py-1 text-xs font-semibold">
                        {permit.overdue}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Submitted{" "}
                    {formatDistanceToNow(new Date(permit.submittedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <div className="inline-block rounded-full bg-gray-200 p-1">
                        <Check size={14} />
                      </div>{" "}
                      <div className="font-medium">{permit.requester}</div>
                    </div>
                    <div>
                      Department:{" "}
                      <span className="font-medium">{permit.department}</span>
                    </div>
                    <div>
                      Work Type:{" "}
                      <span className="font-medium">{permit.workType}</span>
                    </div>
                    <div>
                      Location:{" "}
                      <span className="font-medium">{permit.location}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={14} /> Started:{" "}
                      <span className="font-medium">{permit.startedAt}</span>
                    </div>
                    <div>
                      Original Deadline:{" "}
                      <span className="font-medium">{permit.deadline}</span>
                    </div>
                    <div>
                      Closure Requested:{" "}
                      <span className="font-medium">
                        {permit.requestedClosure}
                      </span>
                    </div>
                    <div>
                      Duration:{" "}
                      <span className="font-medium">{permit.duration}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Shield size={14} /> Safety Officer:{" "}
                      <span className="font-medium">
                        {permit.safetyOfficer}
                      </span>
                    </div>
                    <div>
                      Original Approver:{" "}
                      <span className="font-medium">
                        {permit.approver} (You)
                      </span>
                    </div>
                    <div>
                      Priority: <span className="font-medium">Medium</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Original Work Scope &amp; Requirements</CardTitle>
              <CardDescription>
                Review the original scope that was approved with the permit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-100 rounded p-4 max-h-[200px] overflow-auto text-sm text-gray-700">
                Electrical maintenance in Building A, Floor 2. Safety checks:
                isolation of supply, permit holder to ensure no combustible
                materials near work area. Required tools: insulated tools,
                voltage detector, PPE as per SOP.
                <ul className="mt-2 list-disc pl-5">
                  <li>Lockout tagout in place</li>
                  <li>Gas check completed</li>
                  <li>Hot work permit sections signed</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Requester's Completion Report</CardTitle>
              <CardDescription>
                Submitted by {permit.requester} •{" "}
                {formatDistanceToNow(new Date(permit.submittedAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 border border-gray-200 rounded p-4 max-h-[150px] overflow-auto text-sm text-gray-700">
                Work performed as per scope. Replaced damaged conduits and
                repaired junction box. No incidents. Post-work insulation
                resistance tested and within limits.
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold">
                  Completion Checklist
                </div>
                <div className="mt-2 grid gap-2">
                  {[
                    {
                      k: "item1",
                      label: "All work completed as per permit requirements",
                    },
                    { k: "item2", label: "Work area cleaned and restored" },
                    { k: "item3", label: "Tools and equipment returned" },
                    {
                      k: "item4",
                      label: "Safety protocols followed throughout",
                    },
                    { k: "item5", label: "No damage to surrounding areas" },
                    { k: "item6", label: "All personnel accounted for" },
                    { k: "item7", label: "Quality checks performed" },
                  ].map((it) => (
                    <div key={it.k} className="flex items-center gap-2">
                      <div
                        className={`h-5 w-5 rounded ${checklist[it.k] ? "bg-emerald-500 text-white flex items-center justify-center" : "border border-gray-300"}`}
                      >
                        {checklist[it.k] ? <Check size={12} /> : null}
                      </div>
                      <div className="text-sm">{it.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold">
                  Uploaded Files (6 items)
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {files.map((f, idx) => (
                    <div
                      key={f.id}
                      className="border rounded overflow-hidden bg-white"
                    >
                      <img
                        src={f.src}
                        alt={f.name}
                        className="h-[120px] w-full object-cover cursor-pointer"
                        onClick={() => {
                          setGalleryIndex(idx);
                          setGalleryOpen(true);
                        }}
                      />
                      <div className="p-2 text-sm text-gray-700 truncate">
                        {f.name}
                      </div>
                      <div className="p-2 text-xs text-muted-foreground">
                        {f.size}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  className="bg-emerald-500 text-white w-[140px] h-[40px]"
                  onClick={() => {
                    setDecision("approve");
                    submitAction();
                  }}
                >
                  Approve & Close
                </Button>
                <Button
                  className="bg-red-500 text-white w-[140px] h-[40px]"
                  onClick={() => setDecision("reject")}
                >
                  Reject Request
                </Button>
                <Button
                  className="bg-orange-400 text-white w-[140px] h-[40px]"
                  onClick={() => setDecision("request")}
                >
                  Request Info
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Approval Inspection Checklist</CardTitle>
              <CardDescription>
                Verify all requirements before approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {[
                  "Work completed as per original scope",
                  "All safety protocols were followed",
                  "Work area properly cleaned and restored",
                  "No damage to surrounding areas",
                  "All uploaded documentation is adequate",
                  "Work quality meets required standards",
                  "Timeline and delay reasons are acceptable",
                ].map((t, i) => (
                  <label key={i} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!checklist[`item${i + 1}`]}
                      onChange={(e) =>
                        setChecklist((s) => ({
                          ...s,
                          [`item${i + 1}`]: e.target.checked,
                        }))
                      }
                      className="h-5 w-5"
                    />
                    <div className="text-sm">{t}</div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Approval Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <label className="inline-flex items-center gap-3">
                  <input
                    type="radio"
                    name="decision"
                    checked={decision === "approve"}
                    onChange={() => setDecision("approve")}
                  />
                  <div className="text-sm">Approve Work Closure</div>
                </label>
                <label className="inline-flex items-center gap-3">
                  <input
                    type="radio"
                    name="decision"
                    checked={decision === "reject"}
                    onChange={() => setDecision("reject")}
                  />
                  <div className="text-sm">Reject with Comments</div>
                </label>
                <label className="inline-flex items-center gap-3">
                  <input
                    type="radio"
                    name="decision"
                    checked={decision === "request"}
                    onChange={() => setDecision("request")}
                  />
                  <div className="text-sm">Request Additional Information</div>
                </label>

                <div>
                  <div className="text-sm font-semibold">
                    Approver Comments{" "}
                    {decision !== "approve" ? (
                      <span className="text-red-600">* Required</span>
                    ) : (
                      <span className="text-muted-foreground">(Optional)</span>
                    )}
                  </div>
                  <textarea
                    rows={5}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    onBlur={() => setCommentsTouched(true)}
                    className="mt-2 w-full rounded border p-3"
                    placeholder={
                      decision === "approve"
                        ? "Optional: Add any notes or commendations..."
                        : decision === "reject"
                          ? "Required: Specify reasons for rejection..."
                          : "Required: Specify what additional information is needed..."
                    }
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {comments.length}/500 characters
                  </div>
                  {commentsTouched && !commentsOk && (
                    <div className="text-red-600 text-xs mt-1">
                      Comments required for this decision
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="text-sm font-semibold">Digital Signature</div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 mt-2">
                    <canvas
                      ref={sigCanvasRef}
                      width={800}
                      height={120}
                      className="w-full h-[120px] bg-white shadow-sm"
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <Button variant="outline" onClick={clearSignature}>
                        Clear signature
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Signed by: Sarah Wilson - Senior Approver
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(), "dd/MM/yyyy, hh:mm a")}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 bg-white border-t border-gray-200 p-4">
            <div className="flex flex-col gap-3">
              <Button
                className="bg-emerald-500 text-white"
                onClick={submitAction}
                disabled={!canSubmit}
              >
                {submitting
                  ? "Submitting..."
                  : decision === "approve"
                    ? "Approve & Close Work"
                    : decision === "reject"
                      ? "Reject Closure Request"
                      : "Request Additional Information"}
              </Button>
              <Button variant="outline" onClick={() => alert("Progress saved")}>
                Save Progress
              </Button>
            </div>
          </div>
        </div>
      </div>

      {galleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-60"
            onClick={() => setGalleryOpen(false)}
          />
          <div className="z-10 max-w-[1000px] w-full p-4">
            <div className="bg-white rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold">
                  {files[galleryIndex].name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {galleryIndex + 1} of {files.length}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGalleryIndex((i) => Math.max(0, i - 1))}
                  className="p-2 border rounded"
                >
                  ◀
                </button>
                <img
                  src={files[galleryIndex].src}
                  alt="preview"
                  className="w-full max-h-[600px] object-contain"
                />
                <button
                  onClick={() =>
                    setGalleryIndex((i) => Math.min(files.length - 1, i + 1))
                  }
                  className="p-2 border rounded"
                >
                  ▶
                </button>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  onClick={() => window.open(files[galleryIndex].src, "_blank")}
                >
                  Download
                </Button>
                <Button variant="outline" onClick={() => setGalleryOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowConfirm(false)}
          />
          <div className="bg-white rounded p-6 z-10 w-[480px]">
            <div className="text-lg font-semibold">
              {decision === "approve"
                ? "Approve Work Closure?"
                : decision === "reject"
                  ? "Reject Work Closure Request?"
                  : "Request Additional Information?"}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Permit: {permit.id} • Requester: {permit.requester}
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmSubmit}
                className={`${decision === "approve" ? "bg-emerald-500 text-white" : decision === "reject" ? "bg-red-500 text-white" : "bg-orange-400 text-white"}`}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
