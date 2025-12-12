import { useEffect, useMemo, useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

type Row = {
  id: string;
  permit: string;
  workType: string;
  location: string;
  requester: string;
  department: string;
  approver: string;
  approverRole?: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Review" | "Approved" | "Rejected" | "Overdue";
  startedAt: string;
  submittedAt: string;
  duration: string;
  files: number;
  completionPct: number;
};

const SAMPLE_ROWS: Row[] = Array.from({ length: 30 }).map((_, i) => {
  const id = 100 + i;
  const statuses: Row["status"][] = [
    "Pending",
    "In Review",
    "Approved",
    "Rejected",
    "Overdue",
  ];
  const priorities: Row["priority"][] = ["High", "Medium", "Low"];
  const s = statuses[i % statuses.length];
  const p = priorities[i % priorities.length];
  const now = Date.now() - i * 1000 * 60 * 60;
  return {
    id: `WCS-2024-${String(id).padStart(3, "0")}`,
    permit: `WCS-2024-${String(id).padStart(3, "0")}`,
    workType:
      i % 3 === 0
        ? "Electrical Maintenance"
        : i % 3 === 1
          ? "Hot Work"
          : "Confined Space",
    location: `Building ${String.fromCharCode(65 + (i % 4))}, Room ${2 + (i % 6)}`,
    requester: ["John Doe", "Maria G.", "Lee H.", "Sara L."][i % 4],
    department: ["Maintenance", "Operations", "Safety", "Engineering"][i % 4],
    approver: ["Sarah W.", "Mike C.", "David K."][i % 3],
    approverRole: "Senior Approver",
    priority: p,
    status: s,
    startedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    submittedAt: new Date(now).toISOString(),
    duration: `${Math.max(1, (i % 5) + 1)} days`,
    files: i % 5,
    completionPct: Math.floor(Math.random() * 100),
  } as Row;
});

export default function AdminWorkflows() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>(SAMPLE_ROWS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [departmentFilter, setDepartmentFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<string>("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const id = setInterval(() => setLastUpdate(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(rows.map((r) => r.department))),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      if (departmentFilter !== "All" && r.department !== departmentFilter)
        return false;
      if (priorityFilter !== "All" && r.priority !== priorityFilter)
        return false;
      if (q) {
        const hay = [r.permit, r.requester, r.workType, r.location, r.approver]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, statusFilter, departmentFilter, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSelectAll(checked: boolean) {
    const next: Record<string, boolean> = {};
    pageData.forEach((r) => (next[r.id] = checked));
    setSelected((s) => ({ ...s, ...next }));
  }

  function exportCSV() {
    const header = [
      "id,permit,workType,location,requester,department,approver,priority,status,submittedAt,duration,files",
    ];
    const rowsOut = filtered.map(
      (r) =>
        `${r.id},${r.permit},${r.workType},${r.location},${r.requester},${r.department},${r.approver},${r.priority},${r.status},${r.submittedAt},${r.duration},${r.files}`,
    );
    const blob = new Blob([header.concat(rowsOut).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "work_closure_flow.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleExpand(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  function bulkApproveSelected() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return;
    setRows((r) =>
      r.map((row) =>
        ids.includes(row.id) ? { ...row, status: "Approved" } : row,
      ),
    );
    setSelected({});
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1600px] mx-auto p-6">
        {/* Sub-header tabs */}
        <div className="flex items-center justify-between bg-white border-b border-gray-200 p-3 mb-6">
          <div className="flex gap-4">
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={exportCSV}>Export Data</Button>
            <Button variant="outline">Generate Report</Button>
          </div>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Work Closures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-500">23</div>
              <div className="text-xs text-muted-foreground">
                Currently in progress
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-400">7</div>
              <div className="text-xs text-muted-foreground">
                3 Overdue, 4 On Time
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">87%</div>
              <div className="text-xs text-muted-foreground">
                15 of 17 closures completed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">3</div>
              <div className="text-xs text-muted-foreground">
                2 Overdue, 1 System Issue
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main table container */}
        <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-md text-muted-foreground font-bold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded border px-2 py-1"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>In Review</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>Overdue</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-md text-muted-foreground font-bold">
                  Department:
                </span>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="rounded border px-2 py-1"
                >
                  <option>All</option>
                  {departments.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-md text-muted-foreground font-bold">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="rounded border px-2 py-1"
                >
                  <option>All</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-md text-muted-foreground font-bold">Date:</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="rounded border px-2 py-1"
                >
                  <option>All</option>
                  <option>Today</option>
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search by permit #, requester, or description..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-[320px]"
              />
              <Button onClick={() => setPage(1)}>Search</Button>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm">
                  <th className="px-3 py-3 w-[40px]">
                    <input
                      type="checkbox"
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                    />
                  </th>
                  <th className="px-3 py-3 w-[120px]">Status</th>
                  <th className="px-3 py-3 w-[220px]">Permit Details</th>
                  <th className="px-3 py-3 w-[150px]">Requester</th>
                  <th className="px-3 py-3 w-[150px]">Approver</th>
                  <th className="px-3 py-3 w-[180px]">Timeline</th>
                  <th className="px-3 py-3 w-[200px]">Work Preview</th>
                  <th className="px-3 py-3 w-[120px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((row) => (
                  <Fragment key={row.id}>
                    <tr className="hover:bg-blue-50 border-b">
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={!!selected[row.id]}
                          onChange={(e) =>
                            setSelected((s) => ({
                              ...s,
                              [row.id]: e.target.checked,
                            }))
                          }
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xs text-white ${
                            row.status === "Pending"
                              ? "bg-orange-400"
                              : row.status === "In Review"
                                ? "bg-blue-500"
                                : row.status === "Approved"
                                  ? "bg-emerald-500"
                                  : row.status === "Rejected"
                                    ? "bg-red-500"
                                    : "bg-red-700"
                          }`}
                        >
                          {row.status}
                        </div>
                        <div className="mt-1 text-xs">{row.priority}</div>
                      </td>
                      <td className="px-3 py-3">
                        <div
                          className="font-semibold text-sm text-gray-800 cursor-pointer"
                          onClick={() => navigate(`/approver/review`)}
                        >
                          {row.permit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.workType} • {row.location}
                        </div>
                        <div className="text-xs mt-1 inline-block bg-gray-100 px-2 py-0.5 rounded">
                          {row.duration}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="font-medium">{row.requester}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.department}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 cursor-pointer">
                          Call
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="font-medium">{row.approver}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.approverRole}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Last active 30m
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="text-xs">
                          Requested{" "}
                          {formatDistanceToNow(new Date(row.submittedAt), {
                            addSuffix: true,
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          SLA: {Math.random() > 0.8 ? "Overdue" : "On Time"}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm">
                        <div className="truncate">
                          {row.workType} — example short description preview of
                          the work completed...
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          📎 {row.files} files • {row.completionPct}% complete
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleExpand(row.id)}
                            className="p-2 border rounded"
                          >
                            ▾
                          </button>
                          <button
                            onClick={() => alert("Reminder sent")}
                            className="p-2 border rounded"
                          >
                            ✉
                          </button>
                          <button
                            onClick={() => alert("Escalated")}
                            className="p-2 border rounded"
                          >
                            ⚑
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expanded[row.id] && (
                      <tr className="bg-gray-50">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <div className="text-sm font-semibold">
                                Full Work Details
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                Original permit information, full description,
                                safety requirements, tools & personnel.
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold">
                                Closure Request Details
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                Requester's completion description, checklist,
                                files, actual vs planned time, comments.
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-semibold">
                                Approval Process
                              </div>
                              <div className="text-xs text-muted-foreground mt-2">
                                Inspection checklist, comments, signatures,
                                audit trail.
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}{" "}
              records
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <div className="text-sm">
                {page}/{totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
