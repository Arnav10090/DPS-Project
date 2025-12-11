import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
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
import { Checkbox } from "@/components/ui/checkbox";
import { formatDistanceToNow } from "date-fns";

type Permit = {
  id: string;
  permitId: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  requester: string;
  requesterDept?: string;
  submittedAt: string;
  risk: "high" | "medium" | "low";
  safetyStatus: string;
  estimatedHours?: number;
  location?: string;
  description?: string;
};

const SAMPLE: Permit[] = [
  {
    id: "1",
    permitId: "WP-2024-0892",
    type: "Work Permit",
    priority: "high",
    requester: "Jane Doe",
    requesterDept: "Maintenance",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    risk: "medium",
    safetyStatus: "Pending",
    estimatedHours: 3,
    location: "Plant A - Bay 3",
    description: "Welding work near fuel line",
  },
  {
    id: "2",
    permitId: "WP-2024-0893",
    type: "High Tension Line Work Permit",
    priority: "critical",
    requester: "Carlos M",
    requesterDept: "Engineering",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    risk: "high",
    safetyStatus: "Pending",
    estimatedHours: 2,
    location: "Substation 2",
    description: "High-voltage panel maintenance",
  },
  {
    id: "3",
    permitId: "WP-2024-0894",
    type: "Gas Line Work Permit",
    priority: "medium",
    requester: "Lee H",
    requesterDept: "Operations",
    submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    risk: "high",
    safetyStatus: "Approved",
    estimatedHours: 4,
    location: "Tank 7",
    description: "Inspection and cleaning",
  },
];

export default function ApproverQueue() {
  const navigate = useNavigate();
  const [permits, setPermits] = useState<Permit[]>(SAMPLE);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState<Permit | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const userRole = localStorage.getItem("dps_role");

  // Function to handle View button click and populate ApproverPermitDetails form
  const handleViewPermit = (permit: Permit) => {
    try {
      // Map permit type to form type
      let permitDocType: "work" | "highTension" | "gasLine" = "work";
      if (permit.type === "High Tension Line Work Permit") {
        permitDocType = "highTension";
      } else if (permit.type === "Gas Line Work Permit") {
        permitDocType = "gasLine";
      }

      // Store permit header information
      const headerData = {
        permitRequester: permit.requester,
        permitApprover1: "",
        permitApprover2: "",
        safetyManager: "",
        permitIssueDate: new Date().toISOString().split("T")[0],
        expectedReturnDate: "",
        certificateNumber: "",
        permitNumber: permit.permitId,
        permitDocType,
      };
      localStorage.setItem("dps_permit_header", JSON.stringify(headerData));

      // Store requester comments (from permit queue data)
      const requesterComments = {
        requesterRequireUrgent: false,
        requesterSafetyManagerApproval: false,
        requesterPlannedShutdown: false,
        requesterPlannedShutdownDate: "",
        requesterCustomComments: [
          {
            text: `Description: ${permit.description}`,
            checked: false,
          },
          {
            text: `Location: ${permit.location}`,
            checked: false,
          },
          {
            text: `Estimated Duration: ${permit.estimatedHours} hours`,
            checked: false,
          },
        ],
      };

      const storageKey =
        permitDocType === "highTension"
          ? "dps_requester_comments_ht"
          : permitDocType === "gasLine"
            ? "dps_requester_comments_gas"
            : "dps_requester_comments_work";

      localStorage.setItem(storageKey, JSON.stringify(requesterComments));

      // Navigate to the appropriate permit details page
      navigate("/approver-permit-details");
    } catch (e) {
      console.error("Error viewing permit:", e);
    }
  };

  // comprehensive filter state
  const [filters, setFilters] = useState({
    permitType: [] as string[],
    status: [] as string[],
    requester: [] as string[],
    location: [] as string[],
    risk: [] as string[],
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    // No-op for now. Supabase integration not configured in this starter.
    return () => {
      /* cleanup placeholder */
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return permits.filter((p) => {
      // quick text search
      if (q) {
        const hay = [p.permitId, p.type, p.description, p.requester, p.location]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // permit type
      if (filters.permitType.length && !filters.permitType.includes(p.type))
        return false;
      // status
      if (
        filters.status.length &&
        !filters.status
          .map((s) => s.toLowerCase())
          .includes(p.safetyStatus.toLowerCase())
      )
        return false;
      // requester
      if (filters.requester.length && !filters.requester.includes(p.requester))
        return false;
      // location
      if (
        filters.location.length &&
        !filters.location.includes(p.location || "")
      )
        return false;
      // risk
      if (filters.risk.length && !filters.risk.includes(p.risk)) return false;
      // date range
      if (filters.dateFrom) {
        const from = new Date(filters.dateFrom);
        if (new Date(p.submittedAt) < from) return false;
      }
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        if (new Date(p.submittedAt) > to) return false;
      }
      return true;
    });
  }, [permits, query, filters]);

  const allSelected =
    filtered.length > 0 && filtered.every((p) => selected[p.id]);

  function toggleSelectAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    filtered.forEach((p) => (next[p.id] = checked));
    setSelected((s) => ({ ...s, ...next }));
  }

  function clearAllFilters() {
    setFilters({
      permitType: [],
      status: [],
      requester: [],
      location: [],
      risk: [],
      dateFrom: "",
      dateTo: "",
    });
  }

  // Add this function to remove individual filters
  function removeFilter(filterType: string, value: string) {
    setFilters((f) => ({
      ...f,
      [filterType]: Array.isArray(f[filterType as keyof typeof f])
        ? (f[filterType as keyof typeof f] as string[]).filter(
            (v) => v !== value,
          )
        : filterType === "dateFrom" || filterType === "dateTo"
          ? ""
          : f[filterType as keyof typeof f],
    }));
  }

  // Add this function to get all active filters for display
  function getActiveFilters() {
    const active = [];

    // Permit Type filters
    filters.permitType.forEach((t) => {
      active.push({ type: "permitType", value: t, label: `Type: ${t}` });
    });

    // Status filters
    filters.status.forEach((s) => {
      active.push({ type: "status", value: s, label: `Status: ${s}` });
    });

    // Requester filters
    filters.requester.forEach((r) => {
      active.push({ type: "requester", value: r, label: `Requester: ${r}` });
    });

    // Location filters
    filters.location.forEach((l) => {
      active.push({ type: "location", value: l, label: `Location: ${l}` });
    });

    // Risk filters
    filters.risk.forEach((r) => {
      active.push({
        type: "risk",
        value: r,
        label: `Risk: ${r.toUpperCase()}`,
      });
    });

    // Date filters
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

  // Card view component for mobile/tablet
  function PermitCard({ permit }: { permit: Permit }) {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-start gap-2 mb-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!selected[permit.id]}
              onChange={(e) => {
                setSelected((s) => ({
                  ...s,
                  [permit.id]: e.target.checked,
                }));
              }}
              className="mt-1"
            />
            <div>
              <div className="font-semibold text-blue-600 text-sm">
                {permit.permitId}
              </div>
              <div className="text-sm text-gray-600">{permit.type}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Requester:</span>
            <span className="font-medium">{permit.requester}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Location:</span>
            <span className="font-medium">{permit.location}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium">{permit.safetyStatus}</span>
          </div>
        </div>

        {permit.description && (
          <div className="mb-3">
            <div className="text-sm text-gray-700">
              {permit.description.slice(0, 100)}
              {permit.description.length > 100 && "..."}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(permit.submittedAt), {
              addSuffix: true,
            })}
          </div>
          <div className="flex gap-1.5">
            {/* Modern View Button for Cards */}
            <button
              onClick={() => handleViewPermit(permit)}
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
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6 px-2 sm:px-4">
      <header className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3" />
      </header>

      <div className="rounded-lg border bg-card p-3 sm:p-4 shadow-sm relative">
        {/* Top action bar - now fully responsive */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 w-full">
            {/* View toggle for tablet/mobile */}
            <div className="md:hidden flex bg-gray-100 rounded-lg p-1 ml-auto">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  viewMode === "cards"
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-600"
                }`}
              >
                Cards
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              placeholder="Search permits..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 text-sm"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFilters().length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-900">
                Applied Filters
              </h3>
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

        {/* Modern Advanced Filter Studio - Always Visible */}
        <div className="filter-panel mb-4 p-5 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-xl shadow-blue-100/20">
          {/* Filter Header */}
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
              <h3 className="text-lg font-semibold text-gray-800">
                Filters
              </h3>
            </div>
            <div className="text-sm text-gray-600 bg-white/70 px-3 py-1 rounded-full">
              {getActiveFilters().length} active
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Permit Type Filter */}
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <label className="text-sm font-medium text-gray-700">
                  Permit Type
                </label>
              </div>
              <div className="space-y-2">
                {[
                  {
                    key: "Work Permit",
                    label: "Work Permit",
                    color: "from-blue-400 to-cyan-500",
                    bgColor: "bg-blue-50",
                    textColor: "text-blue-700",
                    borderColor: "border-blue-200",
                  },
                  {
                    key: "High Tension Line Work Permit",
                    label: "High Tension Line Work Permit",
                    color: "from-yellow-400 to-orange-500",
                    bgColor: "bg-yellow-50",
                    textColor: "text-yellow-700",
                    borderColor: "border-yellow-200",
                  },
                  {
                    key: "Gas Line Work Permit",
                    label: "Gas Line Work Permit",
                    color: "from-red-400 to-pink-500",
                    bgColor: "bg-red-50",
                    textColor: "text-red-700",
                    borderColor: "border-red-200",
                  },
                ].map((t) => (
                  <label
                    key={t.key}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      filters.permitType.includes(t.key)
                        ? `${t.bgColor} ${t.borderColor} shadow-md transform scale-[1.02]`
                        : "bg-white/70 border-gray-200 hover:bg-white hover:shadow-sm hover:border-gray-300"
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters.permitType.includes(t.key)}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            permitType: e.target.checked
                              ? [...f.permitType, t.key]
                              : f.permitType.filter((x) => x !== t.key),
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${
                          filters.permitType.includes(t.key)
                            ? `bg-gradient-to-br ${t.color} text-white shadow-sm`
                            : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                        }`}
                      >
                        {filters.permitType.includes(t.key) ? "✓" : ""}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        filters.permitType.includes(t.key)
                          ? t.textColor
                          : "text-gray-700 group-hover:text-gray-800"
                      }`}
                    >
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Status Filter - Modern Card Style */}
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
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
              </div>
              <div className="space-y-2">
                {[
                  {
                    key: "Pending",
                    icon: "⏳",
                    color: "from-amber-400 to-orange-500",
                    bgColor: "bg-amber-50",
                    textColor: "text-amber-700",
                    borderColor: "border-amber-200",
                  },
                  {
                    key: "Approved",
                    icon: "✅",
                    color: "from-green-400 to-emerald-500",
                    bgColor: "bg-green-50",
                    textColor: "text-green-700",
                    borderColor: "border-green-200",
                  },
                  {
                    key: "Rejected",
                    icon: "❌",
                    color: "from-red-400 to-pink-500",
                    bgColor: "bg-red-50",
                    textColor: "text-red-700",
                    borderColor: "border-red-200",
                  },
                  {
                    key: "Expired",
                    icon: "⏰",
                    color: "from-gray-400 to-slate-500",
                    bgColor: "bg-gray-50",
                    textColor: "text-gray-700",
                    borderColor: "border-gray-200",
                  },
                ].map((s) => (
                  <label
                    key={s.key}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                      filters.status.includes(s.key)
                        ? `${s.bgColor} ${s.borderColor} shadow-md transform scale-[1.02]`
                        : "bg-white/70 border-gray-200 hover:bg-white hover:shadow-sm hover:border-gray-300"
                    }`}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(s.key)}
                        onChange={(e) =>
                          setFilters((f) => ({
                            ...f,
                            status: e.target.checked
                              ? [...f.status, s.key]
                              : f.status.filter((x) => x !== s.key),
                          }))
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs transition-all duration-200 ${
                          filters.status.includes(s.key)
                            ? `bg-gradient-to-br ${s.color} text-white shadow-sm`
                            : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                        }`}
                      >
                        {filters.status.includes(s.key) ? "✓" : s.icon}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium transition-colors duration-200 ${
                        filters.status.includes(s.key)
                          ? s.textColor
                          : "text-gray-700 group-hover:text-gray-800"
                      }`}
                    >
                      {s.key}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range - Modern Gradient Style */}
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
                <label className="text-sm font-medium text-gray-700">
                  Date Range
                </label>
              </div>
              <div className="space-y-3">
                <div className="relative group">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    From Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          dateFrom: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-indigo-400/0 rounded-xl pointer-events-none"></div>
                  </div>
                </div>
                <div className="relative group">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">
                    To Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, dateTo: e.target.value }))
                      }
                      className="w-full px-4 py-3 text-sm bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all duration-200 hover:border-gray-300 hover:shadow-sm"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-indigo-400/0 rounded-xl pointer-events-none"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Action Buttons */}
          <div className="flex flex-wrap justify-between items-center mt-8 pt-6 border-t border-white/60">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full animate-pulse"></div>
              <span>Real-time filtering active</span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="px-5 py-2.5 text-sm font-medium bg-white/80 hover:bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-200 hover:shadow-sm active:scale-95"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All
              </Button>
            </div>
          </div>
        </div>

        {/* Results header */}
        <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Showing</div>
            <div className="font-semibold text-sm">
              {filtered.length} permits
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">Items per page</div>
            <select className="rounded-md border px-2 py-1 text-xs">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>

        {/* Content area - responsive table/cards */}
        <div className="grid gap-3">
          {/* Table view for larger screens, or forced table mode */}
          {viewMode === "table" && (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-full inline-block">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <tr>
                      <TableHead className="w-8 px-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                        />
                      </TableHead>
                      <TableHead className="min-w-24 px-2 text-xs">
                        Permit ID
                      </TableHead>
                      <TableHead className="min-w-28 px-2 text-xs">
                        Type
                      </TableHead>
                      <TableHead className="min-w-32 px-2 text-xs hidden sm:table-cell">
                        Description
                      </TableHead>
                      <TableHead className="min-w-24 px-2 text-xs">
                        Requester
                      </TableHead>
                      <TableHead className="min-w-20 px-2 text-xs hidden md:table-cell">
                        Submitted
                      </TableHead>
                      <TableHead className="min-w-20 px-2 text-xs">
                        Status
                      </TableHead>
                      <TableHead className="min-w-24 px-2 text-xs hidden lg:table-cell">
                        Location
                      </TableHead>
                      <TableHead className="w-24 px-2 text-xs text-center flex items-center justify-center">
                        Actions
                      </TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="w-8 px-2">
                          <input
                            type="checkbox"
                            checked={!!selected[p.id]}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelected((s) => ({
                                ...s,
                                [p.id]: e.target.checked,
                              }));
                            }}
                          />
                        </TableCell>
                        <TableCell className="px-2">
                          <span className="text-blue-600 font-semibold text-xs">
                            {p.permitId}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs px-2">{p.type}</TableCell>
                        <TableCell className="max-w-32 px-2 hidden sm:table-cell">
                          <div className="text-xs">
                            {p.description?.slice(0, 40) || "—"}
                            {p.description &&
                              p.description.length > 40 &&
                              "..."}
                          </div>
                        </TableCell>
                        <TableCell className="px-2">
                          <div className="text-xs">
                            {p.requester}
                            <div className="text-xs text-muted-foreground">
                              {p.requesterDept}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground px-2 hidden md:table-cell">
                          {formatDistanceToNow(new Date(p.submittedAt), {
                            addSuffix: true,
                          }).replace(" ago", "")}
                        </TableCell>
                        <TableCell className="text-xs px-2">
                          {p.safetyStatus}
                        </TableCell>
                        <TableCell className="text-xs px-2 hidden lg:table-cell">
                          {p.location}
                        </TableCell>
                        <TableCell className="px-2 w-24">
                          <div className="flex justify-center w-full">
                            {/* Modern View Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPermit(p);
                              }}
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
          )}

          {/* Card view for mobile/tablet */}
          {viewMode === "cards" && (
            <div className="space-y-3">
              {filtered.map((p) => (
                <PermitCard key={p.id} permit={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {preview && (
        <>
          <div
            className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 animate-in fade-in duration-200"
            onClick={() => setPreview(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in zoom-in duration-300">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                      Permit {preview.permitId}
                    </h2>
                    <p className="text-gray-600 mt-1">{preview.type}</p>
                  </div>
                  <button
                    onClick={() => setPreview(null)}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors duration-200 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
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

                {/* Status badges - matching the table styling */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium uppercase ${
                      preview.priority === "critical"
                        ? "bg-red-100 text-red-700"
                        : preview.priority === "high"
                          ? "bg-orange-100 text-orange-700"
                          : preview.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {preview.priority}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      preview.safetyStatus === "Approved"
                        ? "bg-green-100 text-green-700"
                        : preview.safetyStatus === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {preview.safetyStatus}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      preview.risk === "high"
                        ? "bg-red-100 text-red-700"
                        : preview.risk === "medium"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {preview.risk} risk
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left column */}
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {preview.requester}
                          </p>
                          <p className="text-sm text-gray-600">
                            {preview.requesterDept}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {preview.location}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Submitted</p>
                          <p className="font-medium text-gray-900 text-sm sm:text-base">
                            {formatDistanceToNow(
                              new Date(preview.submittedAt),
                              { addSuffix: true },
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(preview.submittedAt).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(preview.submittedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column */}
                  <div>
                    <div className="border border-gray-200 rounded-lg p-3 sm:p-4 h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-4 h-4 text-orange-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                          Work Description
                        </h3>
                      </div>
                      <div className="bg-gray-50 rounded-md p-3 border">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {preview.description || "No description provided"}
                        </p>
                      </div>

                      {preview.estimatedHours && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Estimated duration: {preview.estimatedHours} hours
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons - matching the table button styles */}
                <div className="flex justify-end items-center mt-6 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPermits((s) =>
                          s.map((x) =>
                            x.id === preview.id
                              ? { ...x, safetyStatus: "Rejected" }
                              : x,
                          ),
                        );
                        setPreview(null);
                      }}
                      className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none"
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPermits((s) =>
                          s.map((x) =>
                            x.id === preview.id
                              ? { ...x, safetyStatus: "Approved" }
                              : x,
                          ),
                        );
                        setPreview(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
