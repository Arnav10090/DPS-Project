import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatDistanceToNow, format } from "date-fns";
import { Check, Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ClosureRequest = {
  id: string;
  requester: string;
  department: string;
  workType: string;
  location: string;
  startedAt: string;
  deadline: string;
  requestedClosure: string;
  duration: string;
  safetyOfficer: string;
  approver: string;
  submittedAt: string;
  status: "CLOSURE REQUESTED" | "OVERDUE" | "APPROVED";
  overdue: string;
  scope: string;
  completionReport: string;
};

const SAMPLE_CLOSURES: ClosureRequest[] = [
  {
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
    scope: "Electrical maintenance in Building A, Floor 2. Safety checks: isolation of supply, permit holder to ensure no combustible materials near work area. Required tools: insulated tools, voltage detector, PPE as per SOP.",
    completionReport: "Work performed as per scope. Replaced damaged conduits and repaired junction box. No incidents. Post-work insulation resistance tested and within limits.",
  },
  {
    id: "WCS-2024-002",
    requester: "Jane Smith",
    department: "Operations",
    workType: "Pipe Inspection",
    location: "Building B, Pipeline Section 4",
    startedAt: "17 Jan 2024, 08:00 AM",
    deadline: "18 Jan 2024, 04:00 PM",
    requestedClosure: "18 Jan 2024, 03:30 PM",
    duration: "28 hours",
    safetyOfficer: "Alex Rodriguez",
    approver: "Sarah Wilson",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    status: "CLOSURE REQUESTED",
    overdue: "ON TIME",
    scope: "Pipeline inspection and pressure testing. Safety: pressure vessel precautions, breathing apparatus required in confined spaces. Documentation: all test results to be recorded.",
    completionReport: "All inspection points completed successfully. Pressure tests passed. Minor corrosion noted in section 4B, documented for future action. No safety incidents.",
  },
  {
    id: "WCS-2024-003",
    requester: "Robert Johnson",
    department: "Safety Team",
    workType: "Hot Work Permit",
    location: "Building C, Workshop Area",
    startedAt: "19 Jan 2024, 10:00 AM",
    deadline: "19 Jan 2024, 06:00 PM",
    requestedClosure: "19 Jan 2024, 05:45 PM",
    duration: "8 hours",
    safetyOfficer: "Mike Chen",
    approver: "Sarah Wilson",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    status: "CLOSURE REQUESTED",
    overdue: "ON TIME",
    scope: "Hot work welding operations. Fire watch required for 30 minutes post-work. Ensure all combustible materials removed. Use certified welding equipment only.",
    completionReport: "Welding completed per specifications. Fire watch completed. All equipment tested and functioning correctly. No damage to surrounding areas.",
  },
];

const files = [
  { id: "f1", src: "https://via.placeholder.com/600x400?text=Photo+1", name: "photo1.jpg", size: "1.2 MB" },
  { id: "f2", src: "https://via.placeholder.com/600x400?text=Photo+2", name: "photo2.jpg", size: "980 KB" },
  { id: "f3", src: "https://via.placeholder.com/600x400?text=Photo+3", name: "doc1.pdf", size: "240 KB" },
  { id: "f4", src: "https://via.placeholder.com/600x400?text=Photo+4", name: "photo4.jpg", size: "2.1 MB" },
  { id: "f5", src: "https://via.placeholder.com/600x400?text=Photo+5", name: "photo5.jpg", size: "840 KB" },
  { id: "f6", src: "https://via.placeholder.com/600x400?text=Photo+6", name: "report.pdf", size: "450 KB" },
];

export default function ApproverClosure() {
  const navigate = useNavigate();
  const [closures, setClosures] = useState<ClosureRequest[]>(SAMPLE_CLOSURES);
  const [query, setQuery] = useState("");
  const [selectedClosure, setSelectedClosure] = useState<ClosureRequest | null>(null);

  const [decision, setDecision] = useState<"approve" | "reject" | "request">("approve");
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

  const [filters, setFilters] = useState({
    status: [] as string[],
    department: [] as string[],
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return closures.filter((c) => {
      if (q) {
        const hay = [c.id, c.requester, c.department, c.location, c.workType]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (filters.status.length && !filters.status.includes(c.status)) return false;
      if (filters.department.length && !filters.department.includes(c.department)) return false;
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (new Date(c.submittedAt) < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        if (new Date(c.submittedAt) > to) return false;
      }
      return true;
    });
  }, [closures, query, filters]);

  function clearAllFilters() {
    setFilters({
      status: [],
      department: [],
      dateFrom: "",
      dateTo: "",
    });
  }

  function removeFilter(filterType: string, value: string) {
    setFilters((f) => ({
      ...f,
      [filterType]: Array.isArray(f[filterType as keyof typeof f])
        ? (f[filterType as keyof typeof f] as string[]).filter((v) => v !== value)
        : filterType === "dateFrom" || filterType === "dateTo"
          ? ""
          : f[filterType as keyof typeof f],
    }));
  }

  function getActiveFilters() {
    const active = [];
    filters.status.forEach((s) => {
      active.push({ type: "status", value: s, label: `Status: ${s}` });
    });
    filters.department.forEach((d) => {
      active.push({ type: "department", value: d, label: `Department: ${d}` });
    });
    if (filters.dateFrom) {
      active.push({
        type: "dateFrom",
        value: filters.dateFrom,
        label: `From: ${new Date(filters.dateFrom).toLocaleDateString()}`,
      });
    }
    if (filters.dateTo) {
      active.push({
        type: "dateTo",
        value: filters.dateTo,
        label: `To: ${new Date(filters.dateTo).toLocaleDateString()}`,
      });
    }
    return active;
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
      setTimeout(() => {
        setSuccess(false);
        setSelectedClosure(null);
        setComments("");
        setChecklist({
          item1: true,
          item2: true,
          item3: true,
          item4: true,
          item5: true,
          item6: true,
          item7: false,
        });
        setSignature(null);
      }, 3000);
    }, 1200);
  }

  // List view
  if (!selectedClosure) {
    return (
      <div className="space-y-4 pb-6 px-2 sm:px-4">
        <div className="rounded-lg border bg-card p-3 sm:p-4 shadow-sm relative">
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2 w-full" />
          </div>

          {/* Active Filters Display */}
          {getActiveFilters().length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-900">Applied Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 text-xs px-2 py-1"
                >
                  Clear All
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getActiveFilters().map((filter, index) => (
                  <div
                    key={`${filter.type}-${filter.value}-${index}`}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-blue-300 rounded-full text-xs font-medium text-blue-800 shadow-sm"
                  >
                    <span>{filter.label}</span>
                    <button
                      onClick={() => removeFilter(filter.type, filter.value)}
                      className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-200 hover:bg-blue-300 flex items-center justify-center transition-colors duration-200"
                      aria-label={`Remove ${filter.label} filter`}
                    >
                      <svg
                        className="w-2 h-2 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters Section */}
          <div className="filter-panel mb-4 p-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-blue-100/20">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
              </div>
              <div className="text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full">
                {getActiveFilters().length} active
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Status Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                </div>
                <div className="space-y-2">
                  {["CLOSURE REQUESTED", "OVERDUE", "APPROVED"].map((s) => (
                    <label
                      key={s}
                      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        filters.status.includes(s)
                          ? "bg-blue-50 border-blue-200 shadow-md transform scale-[1.02]"
                          : "bg-white/70 border-gray-200 hover:bg-white hover:shadow-sm hover:border-gray-300"
                      }`}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(s)}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              status: e.target.checked
                                ? [...f.status, s]
                                : f.status.filter((x) => x !== s),
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${
                            filters.status.includes(s)
                              ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                          }`}
                        >
                          {filters.status.includes(s) ? "✓" : ""}
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          filters.status.includes(s)
                            ? "text-blue-700"
                            : "text-gray-700 group-hover:text-gray-800"
                        }`}
                      >
                        {s}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Department Filter */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <label className="text-sm font-medium text-gray-700">Department</label>
                </div>
                <div className="space-y-2">
                  {["Maintenance Team", "Operations", "Safety Team"].map((d) => (
                    <label
                      key={d}
                      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                        filters.department.includes(d)
                          ? "bg-purple-50 border-purple-200 shadow-md transform scale-[1.02]"
                          : "bg-white/70 border-gray-200 hover:bg-white hover:shadow-sm hover:border-gray-300"
                      }`}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={filters.department.includes(d)}
                          onChange={(e) =>
                            setFilters((f) => ({
                              ...f,
                              department: e.target.checked
                                ? [...f.department, d]
                                : f.department.filter((x) => x !== d),
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${
                            filters.department.includes(d)
                              ? "bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-sm"
                              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                          }`}
                        >
                          {filters.department.includes(d) ? "✓" : ""}
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium transition-colors duration-200 ${
                          filters.department.includes(d)
                            ? "text-purple-700"
                            : "text-gray-700 group-hover:text-gray-800"
                        }`}
                      >
                        {d}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <label className="text-sm font-medium text-gray-700">Date Range</label>
                </div>
                <div className="space-y-3">
                  <div className="relative group">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">From Date</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
                      className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                    />
                  </div>
                  <div className="relative group">
                    <label className="text-xs font-medium text-gray-600 mb-1 block">To Date</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
                      className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-white/60">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
                <span>Real-time filtering active</span>
              </div>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="px-5 py-2.5 text-sm font-medium bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 hover:shadow-sm active:scale-95"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="Search closures..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm"
            />
          </div>

          {/* Results header */}
          <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Showing</div>
              <div className="font-semibold text-sm">{filtered.length} pending closures</div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-full inline-block">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <tr>
                    <TableHead className="min-w-24 px-2 text-xs">Permit ID</TableHead>
                    <TableHead className="min-w-24 px-2 text-xs">Requester</TableHead>
                    <TableHead className="min-w-24 px-2 text-xs">Department</TableHead>
                    <TableHead className="min-w-32 px-2 text-xs hidden sm:table-cell">Location</TableHead>
                    <TableHead className="min-w-20 px-2 text-xs">Status</TableHead>
                    <TableHead className="min-w-20 px-2 text-xs hidden md:table-cell">Submitted</TableHead>
                    <TableHead className="w-24 px-2 text-xs text-center flex items-center justify-center">Actions</TableHead>
                  </tr>
                </TableHeader>
                <TableBody>
                  {filtered.map((closure) => (
                    <TableRow key={closure.id}>
                      <TableCell className="px-2">
                        <span className="text-blue-600 font-semibold text-xs">{closure.id}</span>
                      </TableCell>
                      <TableCell className="text-xs px-2">{closure.requester}</TableCell>
                      <TableCell className="text-xs px-2">{closure.department}</TableCell>
                      <TableCell className="text-xs px-2 hidden sm:table-cell">{closure.location}</TableCell>
                      <TableCell className="text-xs px-2">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            closure.status === "CLOSURE REQUESTED"
                              ? "bg-orange-100 text-orange-700"
                              : closure.status === "OVERDUE"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {closure.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground px-2 hidden md:table-cell">
                        {formatDistanceToNow(new Date(closure.submittedAt), { addSuffix: true }).replace(" ago", "")}
                      </TableCell>
                      <TableCell className="px-2 w-24">
                        <div className="flex justify-center w-full">
                          <button
                            onClick={() => setSelectedClosure(closure)}
                            className="group relative inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium transition-all duration-300 ease-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-md hover:shadow-lg hover:shadow-blue-200/50 active:scale-95 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1"
                          >
                            <span className="relative z-10 flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View
                            </span>
                            <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detail view
  const permit = selectedClosure;

  if (success) {
    return (
      <div className="max-w-[1400px] mx-auto p-6">
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-md text-center">
          <div className="text-3xl text-emerald-600 font-bold">✓</div>
          <div className="text-xl font-semibold mt-3">
            Work closure approved and closed
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            Permit {permit.id} has been closed. Redirecting...
          </div>
          <div className="mt-4 flex justify-center gap-3">
            <Button
              onClick={() => {
                setSuccess(false);
                setSelectedClosure(null);
              }}
            >
              Back to List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto p-6">
      <div className="mb-4">
        <Button variant="outline" onClick={() => setSelectedClosure(null)}>
          ← Back to List
        </Button>
      </div>

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
                {permit.scope}
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
                {permit.completionReport}
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
                  Uploaded Files ({files.length} items)
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
