import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export type PermitStatus =
  | "approved"
  | "pending"
  | "rejected"
  | "in_progress"
  | "closed";

export type PermitItem = {
  id: string;
  sn: number;
  plant: string;
  dept: string;
  date: string; // ISO
  permitNo: string;
  requester: string;
  approver1?: string;
  approver2?: string;
  safetyApprover?: string;
  returnDate?: string; // ISO
  commentsRequester?: string;
  commentsApprover?: string;
  status: PermitStatus;
};

export type SortKey = keyof Pick<
  PermitItem,
  | "sn"
  | "plant"
  | "dept"
  | "date"
  | "permitNo"
  | "requester"
  | "returnDate"
>;

export type SortState = { key: SortKey; dir: "asc" | "desc" };

function getStatusBadge(status: PermitStatus) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Approved
        </Badge>
      );
    case "pending":
      return <Badge variant="secondary">Pending</Badge>;
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          Rejected
        </Badge>
      );
    case "in_progress":
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
          In Progress
        </Badge>
      );
    case "closed":
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          Closed
        </Badge>
      );
  }
}

function byKey(a: PermitItem, b: PermitItem, key: SortKey) {
  const av = a[key];
  const bv = b[key];
  // date fields
  if (key === "date" || key === "returnDate") {
    const ad = av ? parseISO(String(av)) : undefined;
    const bd = bv ? parseISO(String(bv)) : undefined;
    if (!ad && !bd) return 0;
    if (!ad) return -1;
    if (!bd) return 1;
    return ad.getTime() - bd.getTime();
  }
  // numeric
  if (key === "sn") return Number(av) - Number(bv);
  // strings
  return String(av || "").localeCompare(String(bv || ""));
}

function headerCell(
  label: string,
  key: SortKey,
  sort: SortState | null,
  setSort: (s: SortState) => void,
  className?: string,
) {
  const active = sort?.key === key ? sort.dir : undefined;
  const Icon =
    active === "asc" ? ArrowUp : active === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <TableHead
      className={cn("whitespace-nowrap bg-gray-900 text-white", className)}
    >
      <button
        type="button"
        onClick={() => setSort({ key, dir: active === "asc" ? "desc" : "asc" })}
        className="inline-flex items-center gap-1 select-none"
        aria-label={`Sort by ${label}`}
      >
        {label}
        <Icon className="w-3.5 h-3.5" />
      </button>
    </TableHead>
  );
}

export function PermitStatusTable({
  data,
  sort,
  setSort,
}: {
  data: PermitItem[];
  sort: SortState | null;
  setSort: (s: SortState) => void;
}) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);

  // filter state
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [showSearch, setShowSearch] = React.useState(false);
  const [plantFilter, setPlantFilter] = React.useState<string | null>(null);
  const [deptFilter, setDeptFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [dateFrom, setDateFrom] = React.useState<string | null>(null);
  const [dateTo, setDateTo] = React.useState<string | null>(null);

  // debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const plants = React.useMemo(() => {
    const s = new Set<string>();
    data.forEach((d) => s.add(d.plant));
    return Array.from(s);
  }, [data]);

  const depts = React.useMemo(() => {
    const s = new Set<string>();
    data.forEach((d) => s.add(d.dept));
    return Array.from(s);
  }, [data]);

  const statuses = React.useMemo(() => {
    const s = new Set<string>();
    data.forEach((d) => s.add(d.status));
    // Ensure all statuses are included even if no data has them yet
    return Array.from(
      new Set([
        ...Array.from(s),
        "approved",
        "pending",
        "rejected",
        "in_progress",
        "closed",
      ]),
    );
  }, [data]);

  const applyPreset = React.useCallback(
    (preset: "today" | "week" | "month" | "30") => {
      const now = new Date();
      let from: Date | null = null;
      let to: Date | null = null;
      if (preset === "today") {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        to = new Date(from);
      } else if (preset === "week") {
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        from = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        to = new Date(now);
      } else if (preset === "month") {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
        to = new Date(now);
      } else if (preset === "30") {
        from = new Date(now);
        from.setDate(now.getDate() - 30);
        to = new Date(now);
      }
      setDateFrom(from ? from.toISOString().slice(0, 10) : null);
      setDateTo(to ? to.toISOString().slice(0, 10) : null);
    },
    [],
  );

  const activeFilterCount = React.useMemo(() => {
    let c = 0;
    if (debouncedSearch) c++;
    if (plantFilter) c++;
    if (deptFilter) c++;
    if (statusFilter) c++;
    if (dateFrom || dateTo) c++;
    return c;
  }, [
    debouncedSearch,
    plantFilter,
    deptFilter,
    statusFilter,
    dateFrom,
    dateTo,
  ]);

  const filtered = React.useMemo(() => {
    return data.filter((d) => {
      if (plantFilter && d.plant !== plantFilter) return false;
      if (deptFilter && d.dept !== deptFilter) return false;
      if (statusFilter && d.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        if (
          !d.permitNo.toLowerCase().includes(q) &&
          !d.requester.toLowerCase().includes(q) &&
          !(d.approver1 || "").toLowerCase().includes(q) &&
          !(d.approver2 || "").toLowerCase().includes(q)
        )
          return false;
      }
      if (dateFrom) {
        const from = parseISO(dateFrom);
        const issued = parseISO(d.date);
        if (issued < from) return false;
      }
      if (dateTo) {
        const to = parseISO(dateTo);
        const issued = parseISO(d.date);
        if (issued > to) return false;
      }
      return true;
    });
  }, [
    data,
    plantFilter,
    deptFilter,
    statusFilter,
    debouncedSearch,
    dateFrom,
    dateTo,
  ]);

  const sorted = React.useMemo(() => {
    if (!sort) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => byKey(a, b, sort.key));
    if (sort.dir === "desc") copy.reverse();
    return copy;
  }, [filtered, sort]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  React.useEffect(() => {
    // reset to first page when filters, data or pageSize changes
    setPage(1);
  }, [
    data,
    pageSize,
    plantFilter,
    deptFilter,
    statusFilter,
    debouncedSearch,
    dateFrom,
    dateTo,
  ]);

  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageData = sorted.slice(start, end);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // helper to compute page range with ellipsis
  function pageRange(cur: number, totalP: number) {
    const delta = 2; // show 2 pages around current
    const range: (number | string)[] = [];
    for (let i = 1; i <= totalP; i++) {
      if (i === 1 || i === totalP || (i >= cur - delta && i <= cur + delta)) {
        range.push(i);
      } else if (range[range.length - 1] !== "...") {
        range.push("...");
      }
    }
    return range;
  }

  return (
    <div className="relative">
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <Table className="min-w-[1200px] table-fixed text-[13px] md:text-[12px] lg:text-sm">
          <TableHeader>
            <TableRow className="bg-gray-900">
              {headerCell(
                "S.N",
                "sn",
                sort,
                setSort,
                "w-16 sticky left-0 z-20 bg-gray-900",
              )}
              {headerCell(
                "Plant",
                "plant",
                sort,
                setSort,
                "w-40 sticky left-16 z-20 bg-gray-900",
              )}
              {headerCell("Dept", "dept", sort, setSort, "w-40")}
              {headerCell("Date", "date", sort, setSort, "w-36")}
              {headerCell(
                "Permit No",
                "permitNo",
                sort,
                setSort,
                "w-40 sticky left-[14rem] z-20 bg-gray-900",
              )}
              {headerCell("Requester", "requester", sort, setSort, "w-40")}
              {headerCell("Approver 1", "approver1", sort, setSort, "w-40")}
              {headerCell("Approver 2", "approver2", sort, setSort, "w-40")}
              {headerCell(
                "Safety Approver",
                "safetyApprover",
                sort,
                setSort,
                "w-44",
              )}
              {headerCell("Return Date", "returnDate", sort, setSort, "w-36")}
              <TableHead className="w-32">Days from Issued</TableHead>
              <TableHead className="w-[26rem]">
                Comments from Requester
              </TableHead>
              <TableHead className="w-[26rem]">
                Comments from Approver
              </TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-36">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.map((row) => {
              const days = differenceInDays(new Date(), parseISO(row.date));
              const approvedBg = row.status === "approved" ? "bg-green-50" : "";
              const stickyBase =
                row.status === "approved" ? "bg-green-50" : "bg-white";
              return (
                <TableRow key={row.id} className={cn("align-top", approvedBg)}>
                  <TableCell
                    className={cn("w-16 sticky left-0 z-10", stickyBase)}
                  >
                    {row.sn}
                  </TableCell>
                  <TableCell
                    className={cn("w-40 sticky left-16 z-10", stickyBase)}
                  >
                    {row.plant}
                  </TableCell>
                  <TableCell className="w-40">{row.dept}</TableCell>
                  <TableCell className="w-36">
                    {format(parseISO(row.date), "dd MMM yyyy")}
                  </TableCell>
                  <TableCell
                    className={cn("w-40 sticky left-[14rem] z-10", stickyBase)}
                  >
                    {row.permitNo}
                  </TableCell>
                  <TableCell className="w-40">{row.requester}</TableCell>
                  <TableCell className="w-40">{row.approver1 || "-"}</TableCell>
                  <TableCell className="w-40">{row.approver2 || "-"}</TableCell>
                  <TableCell className="w-44">
                    {row.safetyApprover || "-"}
                  </TableCell>
                  <TableCell className="w-36">
                    {row.returnDate
                      ? format(parseISO(row.returnDate), "dd MMM yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell className="w-32 text-center">{days}</TableCell>
                  <TableCell className="w-[26rem]">
                    <div
                      className="line-clamp-2"
                      title={row.commentsRequester || ""}
                    >
                      {row.commentsRequester || ""}
                    </div>
                  </TableCell>
                  <TableCell className="w-[26rem]">
                    <div
                      className="line-clamp-2"
                      title={row.commentsApprover || ""}
                    >
                      {row.commentsApprover || ""}
                    </div>
                  </TableCell>
                  <TableCell className="w-28">
                    {getStatusBadge(row.status)}
                  </TableCell>
                  <TableCell className="w-36">
                    <a
                      href={`/permit-details?permit=${encodeURIComponent(row.permitNo)}`}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors min-h-[44px]"
                    >
                      View Details
                    </a>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableCaption>
            Scroll horizontally to see more columns on tablets.
          </TableCaption>
        </Table>
      </div>
    </div>
  );
}
