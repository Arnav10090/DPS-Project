import React from "react";
import { Wifi } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  PermitItem,
  PermitStatusTable,
  SortState,
} from "@/components/permit/PermitStatusTable";
import { PermitStatusCard } from "@/components/permit/PermitStatusCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatISO, subDays } from "date-fns";
import RequesterAlarms from "./RequesterAlarms";
import ApproverAlarms from "./ApproverAlarms";
import SafetyAlarms from "./SafetyAlarms.tsx";
import AdminAlarms from "./AdminAlarms";
import { Role } from "@/lib/roles"; // Add this line
import PermitFilters from "@/components/permit/PermitFilters";

function makeMockData(count = 24): PermitItem[] {
  const plants = ["HSM-1", "HSM-2", "CRM", "BOF", "DRI", "Sinter", "Utilities"];
  const depts = ["Maintenance", "Operations", "Safety", "Projects", "Quality"];
  const requesters = [
    "A. Sharma",
    "R. Patel",
    "S. Khan",
    "M. Gupta",
    "J. Singh",
    "P. Verma",
  ];
  const approvers = ["V. Rao", "D. Mehta", "K. Iyer", "N. Das", "L. Roy"];
  const statuses: PermitItem["status"][] = [
    "approved",
    "pending",
    "rejected",
    "in_progress",
  ];

  const openPermits = Array.from({ length: count }).map((_, i) => {
    const issued = subDays(new Date(), Math.floor(Math.random() * 20));
    const isApproved = Math.random() < 0.45;
    const returnDate = isApproved
      ? subDays(new Date(), Math.floor(Math.random() * 5))
      : undefined;
    return {
      id: `${i + 1}`,
      sn: i + 1,
      plant: plants[i % plants.length],
      dept: depts[(i + 2) % depts.length],
      date: formatISO(issued),
      permitNo: `PTW-${2024 + (i % 2)}-${String(1000 + i)}`,
      requester: requesters[i % requesters.length],
      approver1: approvers[(i + 1) % approvers.length],
      approver2:
        Math.random() > 0.5 ? approvers[(i + 3) % approvers.length] : undefined,
      safetyApprover:
        Math.random() > 0.3 ? approvers[(i + 2) % approvers.length] : undefined,
      returnDate: returnDate ? formatISO(returnDate) : undefined,
      commentsRequester:
        Math.random() > 0.4
          ? "Work on pump alignment and coupling replacement scheduled with safety barriers in place."
          : undefined,
      commentsApprover:
        Math.random() > 0.6
          ? "Proceed with caution near hot zones, ensure gas testing prior to confined space entry."
          : undefined,
      status: isApproved ? "approved" : statuses[i % statuses.length],
    };
  });

  // Closed permits from the Permits-closed page (added after open permits with sequential S.N.)
  const closedPermits: PermitItem[] = [
    {
      id: "closed-1",
      sn: count + 1,
      plant: "HSM-1",
      dept: "Maintenance",
      date: formatISO(subDays(new Date(), 10)),
      permitNo: "PTW-2024-1001",
      requester: "A. Sharma",
      approver1: "V. Rao",
      safetyApprover: "N. Das",
      returnDate: formatISO(subDays(new Date(), 5)),
      commentsRequester:
        "Routine maintenance of centrifugal pump P-101 including bearing replacement and alignment",
      commentsApprover:
        "Work completed as per specifications. Area restored to original condition.",
      status: "closed",
    },
    {
      id: "closed-2",
      sn: count + 2,
      plant: "BOF",
      dept: "Electrical",
      date: formatISO(subDays(new Date(), 15)),
      permitNo: "PTW-2024-1005",
      requester: "R. Patel",
      approver1: "D. Mehta",
      safetyApprover: "L. Roy",
      returnDate: formatISO(subDays(new Date(), 10)),
      commentsRequester:
        "Upgrade control panel wiring and install new safety relays",
      commentsApprover: "All electrical tests passed. System operational.",
      status: "closed",
    },
    {
      id: "closed-3",
      sn: count + 3,
      plant: "CRM",
      dept: "Operations",
      date: formatISO(subDays(new Date(), 18)),
      permitNo: "PTW-2024-1012",
      requester: "S. Khan",
      approver1: "K. Iyer",
      safetyApprover: "N. Das",
      returnDate: formatISO(subDays(new Date(), 13)),
      commentsRequester:
        "Replace faulty control valve V-205 in cooling water line",
      commentsApprover: "New valve installed correctly. No leaks detected.",
      status: "closed",
    },
    {
      id: "closed-4",
      sn: count + 4,
      plant: "Utilities",
      dept: "Safety",
      date: formatISO(subDays(new Date(), 20)),
      permitNo: "PTW-2024-1018",
      requester: "M. Gupta",
      approver1: "N. Das",
      safetyApprover: "L. Roy",
      returnDate: formatISO(subDays(new Date(), 15)),
      commentsRequester:
        "Install emergency shower and eyewash station in chemical storage area",
      commentsApprover: "Safety equipment meets all regulatory requirements.",
      status: "closed",
    },
    {
      id: "closed-5",
      sn: count + 5,
      plant: "Sinter",
      dept: "Maintenance",
      date: formatISO(subDays(new Date(), 25)),
      permitNo: "PTW-2024-1025",
      requester: "J. Singh",
      approver1: "V. Rao",
      safetyApprover: "N. Das",
      returnDate: formatISO(subDays(new Date(), 20)),
      commentsRequester:
        "Replace worn conveyor belt section in material handling area",
      commentsApprover: "Belt properly tensioned and aligned. Good work.",
      status: "closed",
    },
  ];

  return [...openPermits, ...closedPermits];
}

export function OverallStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<PermitItem[]>([]);
  const [sort, setSort] = React.useState<SortState | null>({
    key: "date",
    dir: "desc",
  });

  const [role, setRole] = React.useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = React.useState<string | null>(
    null,
  );

  // Filter state
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [plantFilter, setPlantFilter] = React.useState<string | null>(null);
  const [deptFilter, setDeptFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [dateFrom, setDateFrom] = React.useState<string | null>(null);
  const [dateTo, setDateTo] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  React.useEffect(() => {
    const storedRole = localStorage.getItem("dps_role");
    const storedUserName = localStorage.getItem("dps_user_name");
    setRole(storedRole);
    setCurrentUserName(storedUserName);
  }, []);

  // Initialize status filter from URL parameter
  React.useEffect(() => {
    const filterParam = searchParams.get("filter");
    if (filterParam) {
      const filterMap: Record<string, string> = {
        approved: "approved",
        pending: "pending",
        rejected: "rejected",
        new: "pending",
        returned: "in_progress",
        hold: "in_progress",
        all: "",
      };
      setStatusFilter(filterMap[filterParam] || "");
    }
  }, [searchParams]);

  React.useEffect(() => {
    const t = setTimeout(() => {
      let mockData = makeMockData(32);

      // For requester role, filter to show only current user's permits
      if (role === "requester" && currentUserName) {
        mockData = mockData.filter(
          (item) => item.requester === currentUserName,
        );
      }

      // Apply status filter
      if (statusFilter) {
        mockData = mockData.filter((item) => item.status === statusFilter);
      }

      // Apply plant filter
      if (plantFilter) {
        mockData = mockData.filter((item) => item.plant === plantFilter);
      }

      // Apply department filter
      if (deptFilter) {
        mockData = mockData.filter((item) => item.dept === deptFilter);
      }

      // Apply search filter
      if (debouncedSearch) {
        mockData = mockData.filter(
          (item) =>
            item.permitNo
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase()) ||
            item.requester
              .toLowerCase()
              .includes(debouncedSearch.toLowerCase()),
        );
      }

      // Apply date filters
      if (dateFrom) {
        mockData = mockData.filter(
          (item) => new Date(item.date) >= new Date(dateFrom),
        );
      }
      if (dateTo) {
        mockData = mockData.filter(
          (item) => new Date(item.date) <= new Date(dateTo),
        );
      }

      setData(mockData);
      setLoading(false);
      setPage(1); // Reset to first page when filters change
    }, 600);
    return () => clearTimeout(t);
  }, [
    role,
    currentUserName,
    statusFilter,
    plantFilter,
    deptFilter,
    debouncedSearch,
    dateFrom,
    dateTo,
  ]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Get unique values for filters from full dataset
  const allData = React.useMemo(() => makeMockData(32), []);
  const plants = React.useMemo(
    () => Array.from(new Set(allData.map((item) => item.plant))).sort(),
    [allData],
  );
  const depts = React.useMemo(
    () => Array.from(new Set(allData.map((item) => item.dept))).sort(),
    [allData],
  );
  const statuses = React.useMemo(
    () =>
      Array.from(new Set(allData.map((item) => item.status))).sort() as (
        | "approved"
        | "pending"
        | "rejected"
        | "in_progress"
        | "closed"
      )[],
    [allData],
  );

  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  const applyPreset = (preset: "today" | "week" | "month" | "30") => {
    const now = new Date();
    let from: Date | null = null;
    switch (preset) {
      case "today":
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        from = subDays(now, 7);
        break;
      case "month":
        from = subDays(now, 30);
        break;
      case "30":
        from = subDays(now, 30);
        break;
    }
    if (from) {
      setDateFrom(formatISO(from).split("T")[0]);
      setDateTo(formatISO(now).split("T")[0]);
    }
  };

  const activeFilterCount = [
    search ? 1 : 0,
    plantFilter ? 1 : 0,
    deptFilter ? 1 : 0,
    statusFilter ? 1 : 0,
    dateFrom ? 1 : 0,
    dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-semibold">
          Overall Permit Status
        </h2>
      </div>

      <PermitFilters
        search={search}
        setSearch={setSearch}
        debouncedSearch={debouncedSearch}
        plantFilter={plantFilter}
        setPlantFilter={setPlantFilter}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        applyPreset={applyPreset}
        plants={plants}
        depts={depts}
        statuses={statuses.map((s) => s)}
        pageSize={pageSize}
        setPageSize={setPageSize}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        activeFilterCount={activeFilterCount}
      />

      {/* Desktop (xl+) and Tablets (md-lg): Responsive table with horizontal scroll */}
      <div className="hidden md:block">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <PermitStatusTable
            data={paginatedData}
            sort={sort}
            setSort={setSort}
          />
        )}
      </div>

      {/* Mobile and Tablet Portrait (< md): Card-based layout */}
      <div className="md:hidden">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {paginatedData.map((item) => (
              <PermitStatusCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ContractorPerformance() {
  const contractors = React.useMemo(
    () => [
      {
        id: "c1",
        name: "Alpha Contractors",
        supervisor: "R. Patel",
        address: "Unit 12, Industrial Park",
        workingFrom: "2018",
      },
      {
        id: "c2",
        name: "Beta Services",
        supervisor: "M. Gupta",
        address: "Sector 5, Plant Road",
        workingFrom: "2020",
      },
      {
        id: "c3",
        name: "Gamma Works",
        supervisor: "S. Khan",
        address: "Yard 3",
        workingFrom: "2016",
      },
    ],
    [],
  );

  const defaultRangeFrom = React.useCallback(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  }, []);
  const defaultRangeTo = React.useCallback(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const [selected, setSelected] = React.useState(contractors[0].id);
  const [viewTable, setViewTable] = React.useState(false);
  const [rangeFrom, setRangeFrom] = React.useState(() => defaultRangeFrom());
  const [rangeTo, setRangeTo] = React.useState(() => defaultRangeTo());

  // generate mock timeseries for selected contractor
  const rawData = React.useMemo(() => {
    const to = new Date(rangeTo);
    const from = new Date(rangeFrom);
    const days: any[] = [];
    const msDay = 24 * 60 * 60 * 1000;
    for (let t = from.getTime(); t <= to.getTime(); t += msDay) {
      const d = new Date(t);
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      const base = Math.round(20 + Math.sin(t / 5e8) * 10 + Math.random() * 6);
      days.push({
        date: label,
        permitsIssued: base + Math.floor(Math.random() * 5),
        permitsReturnedOnTime: Math.max(
          0,
          base - Math.floor(Math.random() * 4),
        ),
        pendingPermits: Math.max(0, Math.floor(Math.random() * 10)),
        safetyIssues: Math.floor(Math.random() * 3),
        permitsRejected: Math.floor(Math.random() * 2),
      });
    }
    return days;
  }, [selected, rangeFrom, rangeTo]);

  const totals = React.useMemo(() => {
    return rawData.reduce(
      (acc, r) => {
        acc.permitsIssued += r.permitsIssued;
        acc.permitsReturnedOnTime += r.permitsReturnedOnTime;
        acc.pendingPermits += r.pendingPermits;
        acc.safetyIssues += r.safetyIssues;
        acc.permitsRejected += r.permitsRejected;
        return acc;
      },
      {
        permitsIssued: 0,
        permitsReturnedOnTime: 0,
        pendingPermits: 0,
        safetyIssues: 0,
        permitsRejected: 0,
      },
    );
  }, [rawData]);

  const [hiddenMetrics, setHiddenMetrics] = React.useState<
    Record<string, boolean>
  >({});
  const toggleMetric = (key: string) =>
    setHiddenMetrics((s) => ({ ...s, [key]: !s[key] }));

  const resetFilters = () => {
    setSelected(contractors[0].id);
    setViewTable(false);
    setRangeFrom(defaultRangeFrom());
    setRangeTo(defaultRangeTo());
    setHiddenMetrics({});
  };

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div />
        <div className="flex items-center gap-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
        {/* Details panel */}
        <aside className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-card p-4 space-y-3">
            <h3 className="text-red-600 font-bold">Contractor Details :</h3>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground mb-1">
                Company Name
              </label>
              <Select value={selected} onValueChange={(v) => setSelected(v)}>
                <SelectTrigger className="h-9 w-44 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <label className="text-sm text-muted-foreground">
                  Supervisor Name
                </label>
                <div className="mt-1">
                  {contractors.find((c) => c.id === selected)?.supervisor}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">Address</label>
                <div className="mt-1">
                  {contractors.find((c) => c.id === selected)?.address}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Working from
                </label>
                <div className="mt-1">
                  {contractors.find((c) => c.id === selected)?.workingFrom}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Company name selectable, once selected all details to be shown
                automatically
              </p>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-9">
          <div className="bg-white rounded-lg shadow-card p-4">
            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-cardHover transition transform hover:-translate-y-1 flex items-center gap-3">
                <div className="w-1 h-12 bg-blue-500 rounded" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Permits Issued
                  </div>
                  <div className="text-xl font-semibold">
                    {totals.permitsIssued}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-cardHover transition transform hover:-translate-y-1 flex items-center gap-3">
                <div className="w-1 h-12 bg-green-500 rounded" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Returned On Time
                  </div>
                  <div className="text-xl font-semibold">
                    {totals.permitsReturnedOnTime}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-cardHover transition transform hover:-translate-y-1 flex items-center gap-3">
                <div className="w-1 h-12 bg-orange-500 rounded" />
                <div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                  <div className="text-xl font-semibold">
                    {totals.pendingPermits}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-cardHover transition transform hover:-translate-y-1 flex items-center gap-3">
                <div className="w-1 h-12 bg-red-500 rounded" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Safety Issues
                  </div>
                  <div className="text-xl font-semibold">
                    {totals.safetyIssues}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg shadow-sm hover:shadow-cardHover transition transform hover:-translate-y-1 flex items-center gap-3">
                <div className="w-1 h-12 bg-purple-500 rounded" />
                <div>
                  <div className="text-sm text-muted-foreground">Rejected</div>
                  <div className="text-xl font-semibold">
                    {totals.permitsRejected}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart controls */}
            <div className="flex items-center justify-between mb-3 gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm">Date range</label>
                <input
                  type="date"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  className="h-9 rounded-md border px-2"
                />
                <input
                  type="date"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  className="h-9 rounded-md border px-2"
                />
                <button
                  onClick={() => {
                    setRangeFrom(new Date().toISOString().slice(0, 10));
                    setRangeTo(new Date().toISOString().slice(0, 10));
                  }}
                  className="text-sm px-2 py-1 border rounded"
                >
                  Today
                </button>
                <button
                  onClick={resetFilters}
                  className="text-sm px-2 py-1 border rounded"
                >
                  Reset
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewTable((v) => !v)}
                  className="px-3 py-1 border rounded"
                >
                  {viewTable ? "Chart" : "Table"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 border rounded"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Chart or table */}
            <div className="flex flex-wrap gap-2 mb-3">
              {[
                { key: "permitsIssued", label: "Issued", color: "bg-blue-500" },
                {
                  key: "permitsReturnedOnTime",
                  label: "Returned",
                  color: "bg-green-500",
                },
                {
                  key: "pendingPermits",
                  label: "Pending",
                  color: "bg-orange-500",
                },
                { key: "safetyIssues", label: "Safety", color: "bg-red-500" },
                {
                  key: "permitsRejected",
                  label: "Rejected",
                  color: "bg-purple-500",
                },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => toggleMetric(m.key)}
                  className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 border ${
                    hiddenMetrics[m.key] ? "opacity-40" : ""
                  }`}
                >
                  <span className={`${m.color} w-2 h-2 rounded-full`} />
                  {m.label}
                </button>
              ))}
            </div>
            <div style={{ width: "100%", height: 360 }}>
              {!viewTable ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={rawData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend onClick={(e: any) => toggleMetric(e.dataKey)} />

                    {!hiddenMetrics.permitsIssued && (
                      <Line
                        type="monotone"
                        dataKey="permitsIssued"
                        stroke="#1f77b4"
                        dot
                      />
                    )}
                    {!hiddenMetrics.permitsReturnedOnTime && (
                      <Line
                        type="monotone"
                        dataKey="permitsReturnedOnTime"
                        stroke="#2ca02c"
                        dot
                      />
                    )}
                    {!hiddenMetrics.pendingPermits && (
                      <Line
                        type="monotone"
                        dataKey="pendingPermits"
                        stroke="#ff7f0e"
                        dot
                      />
                    )}
                    {!hiddenMetrics.safetyIssues && (
                      <Line
                        type="monotone"
                        dataKey="safetyIssues"
                        stroke="#d62728"
                        dot
                      />
                    )}
                    {!hiddenMetrics.permitsRejected && (
                      <Line
                        type="monotone"
                        dataKey="permitsRejected"
                        stroke="#9467bd"
                        dot
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="overflow-auto">
                  <table className="w-full text-sm table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Issued</th>
                        <th className="p-2 border">Returned On Time</th>
                        <th className="p-2 border">Pending</th>
                        <th className="p-2 border">Safety Issues</th>
                        <th className="p-2 border">Rejected</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rawData.map((r, idx) => (
                        <tr key={idx} className="odd:bg-white even:bg-gray-50">
                          <td className="p-2 border">{r.date}</td>
                          <td className="p-2 border">{r.permitsIssued}</td>
                          <td className="p-2 border">
                            {r.permitsReturnedOnTime}
                          </td>
                          <td className="p-2 border">{r.pendingPermits}</td>
                          <td className="p-2 border">{r.safetyIssues}</td>
                          <td className="p-2 border">{r.permitsRejected}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </section>
  );
}

// Simple hook to get current user role
function useCurrentRole(): Role | null {
  const [role, setRole] = React.useState<Role | null>(null);

  React.useEffect(() => {
    const storedRole = localStorage.getItem("dps_role") as Role;
    setRole(storedRole);

    // Optional: Listen for storage changes to update role in real-time
    const handleStorageChange = () => {
      const updatedRole = localStorage.getItem("dps_role") as Role;
      setRole(updatedRole);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return role;
}

export function Alarms() {
  const currentRole = useCurrentRole();

  // Role-based component rendering
  if (currentRole === "requester") {
    return <RequesterAlarms />;
  } else if (currentRole === "safety") {
    return <SafetyAlarms />;
  } else if (currentRole === "approver") {
    return <ApproverAlarms />;
  } else if (currentRole === "admin") {
    return <AdminAlarms />;
  }

  // Default/fallback view if no role is found
  return <AdminAlarms />;
}

export function SystemArchitecture() {
  type Node = {
    id: string;
    label: string;
    type: "server" | "db" | "network" | "client" | "security" | "tablet";
    x: number;
    y: number;
    status?: "online" | "offline" | "warn";
  };

  const nodes: Node[] = [
    {
      id: "email",
      label: "Email Server",
      type: "server",
      x: 300,
      y: 50,
      status: "online",
    },
    {
      id: "admin",
      label: "AdminUser",
      type: "server",
      x: 450,
      y: 50,
      status: "online",
    },
    {
      id: "portal",
      label: "Permit Portal",
      type: "server",
      x: 120,
      y: 200,
      status: "online",
    },
    {
      id: "trans",
      label: "Transactional DB",
      type: "db",
      x: 60,
      y: 320,
      status: "online",
    },
    {
      id: "hist",
      label: "Historical DB",
      type: "db",
      x: 180,
      y: 320,
      status: "online",
    },
    {
      id: "firewall",
      label: "Firewall",
      type: "security",
      x: 300,
      y: 160,
      status: "online",
    },
    {
      id: "switch",
      label: "Ethernet Switch",
      type: "network",
      x: 420,
      y: 160,
      status: "online",
    },
    {
      id: "wifi",
      label: "Wifi AP",
      type: "network",
      x: 600,
      y: 160,
      status: "online",
    },
    {
      id: "client1",
      label: "Client 1",
      type: "client",
      x: 360,
      y: 240,
      status: "online",
    },
    {
      id: "client6",
      label: "Client 6",
      type: "client",
      x: 480,
      y: 240,
      status: "online",
    },
    {
      id: "tablet1",
      label: "Tablet-1",
      type: "tablet",
      x: 780,
      y: 80,
      status: "online",
    },
    {
      id: "tablet2",
      label: "Tablet-2",
      type: "tablet",
      x: 780,
      y: 160,
      status: "online",
    },
    {
      id: "tablet6",
      label: "Tablet-6",
      type: "tablet",
      x: 780,
      y: 240,
      status: "online",
    },
  ];

  const edges = [
    { from: "email", to: "firewall", type: "ethernet" },
    { from: "admin", to: "switch", type: "ethernet" },
    { from: "portal", to: "firewall", type: "ethernet" },
    { from: "portal", to: "trans", type: "ethernet" },
    { from: "portal", to: "hist", type: "ethernet" },
    { from: "firewall", to: "switch", type: "ethernet" },
    { from: "switch", to: "wifi", type: "ethernet" },
    { from: "switch", to: "client1", type: "ethernet" },
    { from: "switch", to: "client6", type: "ethernet" },
  ];

  const extraComponents = [
    { id: "client2", label: "Client 2" },
    { id: "client3", label: "Client 3" },
    { id: "client4", label: "Client 4" },
    { id: "client5", label: "Client 5" },
    { id: "tablet3", label: "Tablet-3" },
    { id: "tablet4", label: "Tablet-4" },
    { id: "tablet5", label: "Tablet-5" },
  ];

  const [selectedNode, setSelectedNode] = React.useState<Node | null>(null);
  const [selectedComponentId, setSelectedComponentId] = React.useState<
    string | null
  >(null);
  const [showWifi, setShowWifi] = React.useState(true);
  const [showEthernet, setShowEthernet] = React.useState(true);
  const [showSecure, setShowSecure] = React.useState(true);
  const [scale, setScale] = React.useState(1);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  const dragging = React.useRef(false);
  const dragStart = React.useRef<{ x: number; y: number } | null>(null);

  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !dragStart.current) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    dragStart.current = null;
  };

  const zoomIn = () => setScale((s) => Math.min(2, s + 0.1));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.1));
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <div />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 lg:order-first order-last">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <div className="relative overflow-hidden" style={{ height: 400 }}>
              <svg
                ref={svgRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                className="w-full h-full"
                viewBox="0 0 900 400"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="flow" x1="0%" x2="100%">
                    <stop offset="0%" stopColor="#4caf50" />
                    <stop offset="100%" stopColor="#2196f3" />
                  </linearGradient>
                  <filter
                    id="glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <g
                  transform={`translate(${offset.x},${offset.y}) scale(${scale})`}
                >
                  {/* edges */}
                  {edges.map((e, i) => {
                    if (e.type === "wifi" && !showWifi) return null;
                    if (e.type === "ethernet" && !showEthernet) return null;
                    if (e.type === "secure" && !showSecure) return null;
                    const from = nodes.find((n) => n.id === e.from)!;
                    const to = nodes.find((n) => n.id === e.to)!;
                    // primary green for ethernet, lighter dashed for wifi
                    const stroke =
                      e.type === "ethernet"
                        ? "#16a34a"
                        : e.type === "wifi"
                          ? "#16a34a"
                          : "#f97316";
                    const dash =
                      e.type === "wifi"
                        ? "4 4"
                        : e.type === "secure"
                          ? "2 2"
                          : "0";
                    const width =
                      e.type === "ethernet" ? 6 : e.type === "wifi" ? 3 : 4;
                    const midX = (from.x + to.x) / 2;
                    const midY = (from.y + to.y) / 2;
                    return (
                      <g key={i}>
                        <line
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          stroke={stroke}
                          strokeWidth={width}
                          strokeDasharray={dash}
                          strokeLinecap="round"
                          opacity={0.95}
                        />
                      </g>
                    );
                  })}

                  {/* vertical dotted line between tablets and horizontal dotted between clients */}
                  {(() => {
                    const t2 = nodes.find((n) => n.id === "tablet2");
                    const t6 = nodes.find((n) => n.id === "tablet6");
                    const c1 = nodes.find((n) => n.id === "client1");
                    const c6 = nodes.find((n) => n.id === "client6");
                    const portal = nodes.find((n) => n.id === "portal");
                    const trans = nodes.find((n) => n.id === "trans");
                    const hist = nodes.find((n) => n.id === "hist");
                    if (!t2 && !c1 && !portal) return null;
                    // compute dashed box around portal, trans, hist
                    let box = null;
                    if (portal && trans && hist) {
                      const nodeWidth = 100;
                      const nodeHeight = 36;
                      const padding = 10;
                      const minX = Math.min(
                        portal.x - nodeWidth / 2,
                        trans.x - nodeWidth / 2,
                        hist.x - nodeWidth / 2,
                      );
                      const maxX = Math.max(
                        portal.x + nodeWidth / 2,
                        trans.x + nodeWidth / 2,
                        hist.x + nodeWidth / 2,
                      );
                      const minY = Math.min(
                        portal.y - nodeHeight / 2,
                        trans.y - nodeHeight / 2,
                        hist.y - nodeHeight / 2,
                      );
                      const maxY = Math.max(
                        portal.y + nodeHeight / 2,
                        trans.y + nodeHeight / 2,
                        hist.y + nodeHeight / 2,
                      );
                      const bx = minX - padding;
                      const by = minY - padding;
                      const bw = maxX - minX + padding * 2;
                      const bh = maxY - minY + padding * 2;
                      box = (
                        <rect
                          x={bx}
                          y={by}
                          width={bw}
                          height={bh}
                          rx={8}
                          fill="none"
                          stroke="#b91c1c"
                          strokeWidth={2}
                          strokeDasharray="8 6"
                          strokeLinecap="round"
                        />
                      );
                    }
                    return (
                      <g key="helper-lines">
                        {box}
                        {t2 && t6 && (
                          <line
                            x1={t2.x}
                            y1={t2.y}
                            x2={t6.x}
                            y2={t6.y}
                            stroke="#16a34a"
                            strokeWidth={3}
                            strokeDasharray="4 4"
                            strokeLinecap="round"
                            opacity={0.95}
                          />
                        )}
                        {c1 && c6 && (
                          <line
                            x1={c1.x}
                            y1={c1.y}
                            x2={c6.x}
                            y2={c6.y}
                            stroke="#16a34a"
                            strokeWidth={3}
                            strokeDasharray="4 4"
                            strokeLinecap="round"
                            opacity={0.95}
                          />
                        )}
                      </g>
                    );
                  })()}

                  {/* nodes */}
                  {nodes.map((n) => {
                    const tx = n.x - 50;
                    const ty = n.y - 18;
                    return (
                      <g
                        key={n.id}
                        transform={`translate(${tx}, ${ty})`}
                        onClick={() => n.label && setSelectedNode(n)}
                        style={{ cursor: n.label ? "pointer" : "default" }}
                      >
                        {n.type === "tablet" && (
                          <g transform={`translate(${-18}, 9)`}>
                            <Wifi size={14} stroke="#16a34a" />
                          </g>
                        )}
                        <rect
                          width={100}
                          height={36}
                          rx={6}
                          fill="#fff"
                          stroke="#0f172a"
                          strokeWidth={1}
                        />
                        {n.label ? (
                          <foreignObject width={100} height={36}>
                            <div
                              className={`w-full h-full flex items-center gap-2 px-2`}
                            >
                              <div className="w-6 h-6 flex items-center justify-center">
                                {(() => {
                                  // special-case by id for email/admin
                                  if (n.id === "email") {
                                    return (
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <rect
                                          x="2"
                                          y="5"
                                          width="20"
                                          height="14"
                                          rx="2"
                                          stroke="#0f172a"
                                          strokeWidth="1.2"
                                        />
                                        <path
                                          d="M3 7l9 6 9-6"
                                          stroke="#0f172a"
                                          strokeWidth="1.2"
                                          fill="none"
                                        />
                                      </svg>
                                    );
                                  }
                                  if (n.id === "admin") {
                                    return (
                                      <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <circle
                                          cx="12"
                                          cy="8"
                                          r="3"
                                          stroke="#0f172a"
                                          strokeWidth="1.2"
                                        />
                                        <path
                                          d="M4 20c1.5-4 6-6 8-6s6.5 2 8 6"
                                          stroke="#0f172a"
                                          strokeWidth="1.2"
                                          fill="none"
                                        />
                                      </svg>
                                    );
                                  }
                                  // render icon per node type
                                  switch (n.type) {
                                    case "server":
                                      return (
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <rect
                                            x="3"
                                            y="4"
                                            width="18"
                                            height="6"
                                            rx="1"
                                            stroke="#0f172a"
                                            strokeWidth="1.5"
                                          />
                                          <rect
                                            x="3"
                                            y="14"
                                            width="18"
                                            height="6"
                                            rx="1"
                                            stroke="#0f172a"
                                            strokeWidth="1.5"
                                          />
                                        </svg>
                                      );
                                    case "db":
                                      return (
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <ellipse
                                            cx="12"
                                            cy="6"
                                            rx="8"
                                            ry="3"
                                            stroke="#0f172a"
                                            strokeWidth="1.5"
                                          />
                                          <path
                                            d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6"
                                            stroke="#0f172a"
                                            strokeWidth="1.5"
                                          />
                                        </svg>
                                      );
                                    case "network":
                                      return (
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <rect
                                            x="3"
                                            y="4"
                                            width="18"
                                            height="5"
                                            rx="1"
                                            stroke="#0f172a"
                                            strokeWidth="1.5"
                                          />
                                          <rect
                                            x="7"
                                            y="12"
                                            width="10"
                                            height="6"
                                            rx="1"
                                            stroke="#0f172a"
                                            strokeWidth="1.5"
                                          />
                                        </svg>
                                      );
                                    case "security":
                                      return (
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M12 3l7 3v5c0 5-3.582 8-7 9-3.418-1-7-4-7-9V6l7-3z"
                                            stroke="#0f172a"
                                            strokeWidth="1.2"
                                            fill="#fff"
                                          />
                                        </svg>
                                      );
                                    case "client":
                                      return (
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <rect
                                            x="3"
                                            y="4"
                                            width="18"
                                            height="12"
                                            rx="1"
                                            stroke="#0f172a"
                                            strokeWidth="1.2"
                                          />
                                          <rect
                                            x="9"
                                            y="18"
                                            width="6"
                                            height="2"
                                            fill="#0f172a"
                                          />
                                        </svg>
                                      );
                                    case "tablet":
                                      return (
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <rect
                                            x="5"
                                            y="3"
                                            width="14"
                                            height="18"
                                            rx="2"
                                            stroke="#0f172a"
                                            strokeWidth="1.2"
                                          />
                                          <circle
                                            cx="12"
                                            cy="18"
                                            r="0.8"
                                            fill="#0f172a"
                                          />
                                        </svg>
                                      );
                                    default:
                                      return (
                                        <svg
                                          width="18"
                                          height="18"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <circle
                                            cx="12"
                                            cy="12"
                                            r="8"
                                            stroke="#0f172a"
                                            strokeWidth="1.2"
                                          />
                                        </svg>
                                      );
                                  }
                                })()}
                              </div>
                              <div className="text-xs">
                                <div className="font-semibold text-[10px] leading-tight">
                                  {n.label}
                                </div>
                              </div>
                            </div>
                          </foreignObject>
                        ) : null}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:order-last order-first">
          <div className="bg-white border p-4 rounded-lg shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-2">Legend & Controls</h3>
              {/* checkboxes removed as requested */}
              <div />
            </div>

            {/* Visual legend matching the supplied image */}
            <div className="mt-2">
              <div className="relative inline-block">
                <div className="absolute -top-3 right-2 bg-yellow-300 text-xs font-semibold px-2 rounded">
                  LEGENDS
                </div>
                <div className="border-2 border-dashed border-red-600 rounded p-3 pr-6">
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: "80px 1fr",
                      columnGap: 12,
                      rowGap: 8,
                    }}
                  >
                    {/* Ethernet row */}
                    <div className="flex items-center justify-center">
                      <svg
                        width="80"
                        height="12"
                        viewBox="0 0 80 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line
                          x1="0"
                          y1="6"
                          x2="68"
                          y2="6"
                          stroke="#16a34a"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs">Ethernet</span>
                    </div>

                    {/* HIL Supply row */}
                    <div className="flex items-center justify-center">
                      <svg
                        width="80"
                        height="12"
                        viewBox="0 0 80 12"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <line
                          x1="0"
                          y1="6"
                          x2="68"
                          y2="6"
                          stroke="#b91c1c"
                          strokeWidth="3"
                          strokeDasharray="6 4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs">HIL Supply</span>
                    </div>

                    {/* Wireless row: wifi icon centered above a dashed connector line in the symbol column */}
                    <div className="flex items-center justify-center">
                      <Wifi size={16} stroke="#16a34a" />
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs">
                        Wireless LAN (WIFI) connection
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Status Overview</h3>
              <div className="flex flex-col gap-2 text-sm">
                {["online", "warn", "offline"].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        s === "online"
                          ? "bg-green-500"
                          : s === "warn"
                            ? "bg-yellow-400"
                            : "bg-red-500"
                      }`}
                    />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">Components</h3>
              <div className="grid grid-cols-1 gap-2">
                <Select
                  value={selectedComponentId ?? ""}
                  onValueChange={(v) => {
                    setSelectedComponentId(v || null);
                    const node = nodes.find((n) => n.id === v);
                    if (node) setSelectedNode(node);
                  }}
                >
                  <SelectTrigger className="h-9 w-full text-sm">
                    <SelectValue placeholder="Select component..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-40 overflow-auto">
                    {(() => {
                      const combined: { id: string; label: string }[] = [
                        ...nodes.map((n) => ({ id: n.id, label: n.label })),
                        ...extraComponents,
                      ];
                      const clients = combined
                        .filter((c) => c.id.startsWith("client"))
                        .sort((a, b) => {
                          const na = parseInt(
                            a.id.replace(/[^0-9]/g, "") || "0",
                            10,
                          );
                          const nb = parseInt(
                            b.id.replace(/[^0-9]/g, "") || "0",
                            10,
                          );
                          return na - nb;
                        });
                      const tablets = combined
                        .filter((t) => t.id.startsWith("tablet"))
                        .sort((a, b) => {
                          const na = parseInt(
                            a.id.replace(/[^0-9]/g, "") || "0",
                            10,
                          );
                          const nb = parseInt(
                            b.id.replace(/[^0-9]/g, "") || "0",
                            10,
                          );
                          return na - nb;
                        });
                      const others = combined.filter(
                        (x) =>
                          !x.id.startsWith("client") &&
                          !x.id.startsWith("tablet"),
                      );
                      const wifiIdx = others.findIndex((o) => o.id === "wifi");
                      let ordered: { id: string; label: string }[] = [];
                      if (wifiIdx >= 0) {
                        const beforeWifi = others.slice(0, wifiIdx + 1);
                        const afterWifi = others.slice(wifiIdx + 1);
                        ordered = [
                          ...beforeWifi,
                          ...clients,
                          ...tablets,
                          ...afterWifi,
                        ];
                      } else {
                        ordered = [...others, ...clients, ...tablets];
                      }
                      return ordered.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.label}
                        </SelectItem>
                      ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-2">View</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                    onClick={() => setScale(1)}
                  >
                    1x
                  </button>
                  <button
                    className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                    onClick={() => setScale(1.25)}
                  >
                    1.25x
                  </button>
                  <button
                    className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                    onClick={() => setScale(1.5)}
                  >
                    1.5x
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                    onClick={resetView}
                  >
                    Reset View
                  </button>
                  <button
                    className="px-2 py-1 border rounded hover:bg-gray-50"
                    onClick={zoomOut}
                  >
                    -
                  </button>
                  <div className="px-2 py-1 border rounded">
                    {Math.round(scale * 100)}%
                  </div>
                  <button
                    className="px-2 py-1 border rounded hover:bg-gray-50"
                    onClick={zoomIn}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {selectedNode && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Component Details</h3>
            <div className="space-y-2">
              <div>
                <strong>{selectedNode.label}</strong>
              </div>
              <div className="text-sm text-gray-600">
                Type: {selectedNode.type}
              </div>
              <div className="text-sm text-gray-600">
                Status: {selectedNode.status}
              </div>
              <div className="text-sm">
                IP: 10.0.{selectedNode.id.length}.
                {selectedNode.id.charCodeAt(0) % 255}
              </div>
              <div className="pt-4 flex gap-2">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    console.log("Open docs for", selectedNode.id);
                  }}
                >
                  Open docs
                </button>
                <button
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                  onClick={() => setSelectedNode(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function Spare() {
  return (
    <section className="space-y-4">
      <div className="bg-white rounded-card shadow-card p-5">
        <h2 className="text-lg font-semibold mb-2">Spare</h2>
        <p className="text-sm text-gray-600">Reserved for future features.</p>
      </div>
    </section>
  );
}
