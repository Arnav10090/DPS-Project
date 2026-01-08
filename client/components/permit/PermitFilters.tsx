import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  debouncedSearch: string;
  plantFilter: string | null;
  setPlantFilter: (v: string | null) => void;
  deptFilter: string | null;
  setDeptFilter: (v: string | null) => void;
  statusFilter: string | null;
  setStatusFilter: (v: string | null) => void;
  dateFrom: string | null;
  setDateFrom: (v: string | null) => void;
  dateTo: string | null;
  setDateTo: (v: string | null) => void;
  applyPreset: (p: "today" | "week" | "month" | "30") => void;
  plants: string[];
  depts: string[];
  statuses: string[];
  pageSize: number;
  setPageSize: (n: number) => void;
  page: number;
  setPage: (n: number) => void;
  totalPages: number;
  activeFilterCount: number;
};

export default function PermitFilters({
  search,
  setSearch,
  debouncedSearch,
  plantFilter,
  setPlantFilter,
  deptFilter,
  setDeptFilter,
  statusFilter,
  setStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  applyPreset,
  plants,
  depts,
  statuses,
  pageSize,
  setPageSize,
  page,
  setPage,
  totalPages,
  activeFilterCount,
}: Props) {
  const goPrev = () => setPage(Math.max(1, page - 1));
  const goNext = () => setPage(Math.min(totalPages, page + 1));

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
    <div className="mb-4 space-y-2">
      <div className="bg-card border p-3 rounded-lg shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-40">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                />
              </svg>
            </div>
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 w-full h-9 min-w-0 text-sm"
              aria-label="Search permits"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground h-8 w-8 rounded-md hover:bg-muted/60"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            <div className="text-xs text-gray-600 whitespace-nowrap">From:</div>
            <Input
              type="date"
              value={dateFrom || ""}
              onChange={(e) => setDateFrom(e.target.value || null)}
              className="h-9 w-24 min-w-0 text-xs"
              aria-label="From date"
            />
          </div>

          <div className="flex items-center gap-1">
            <div className="text-xs text-gray-600 whitespace-nowrap">To:</div>
            <Input
              type="date"
              value={dateTo || ""}
              onChange={(e) => setDateTo(e.target.value || null)}
              className="h-9 w-24 min-w-0 text-xs"
              aria-label="To date"
            />
          </div>

          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-16 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={plantFilter ?? "__all__"}
            onValueChange={(v) => setPlantFilter(v === "__all__" ? null : v)}
          >
            <SelectTrigger className="h-9 w-28 text-sm">
              <SelectValue placeholder="Plant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Plants</SelectItem>
              {plants.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter ?? "__all__"}
            onValueChange={(v) => setStatusFilter(v === "__all__" ? null : v)}
          >
            <SelectTrigger className="h-9 w-28 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Status</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeFilterCount > 0 && (
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
              <span>
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}
              </span>
            </div>
          )}

          <nav className="flex items-center gap-1 bg-white border rounded-md px-2 py-1 shadow-sm ml-auto">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 text-xs rounded disabled:opacity-50 hover:bg-gray-100"
              aria-label="First page"
              title="First page"
            >
              «
            </button>
            <button
              onClick={goPrev}
              disabled={page <= 1}
              className="px-2 py-1 text-xs rounded disabled:opacity-50 hover:bg-gray-100"
              aria-label="Previous page"
              title="Previous page"
            >
              ‹
            </button>
            {pageRange(page, totalPages).map((p, idx) =>
              typeof p === "string" ? (
                <span key={idx} className="px-2 text-xs text-muted-foreground">
                  {p}
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(Number(p))}
                  className={cn(
                    "px-2 py-1 rounded text-xs",
                    p === page
                      ? "bg-primary text-white shadow"
                      : "hover:bg-gray-100",
                  )}
                  aria-current={p === page}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={goNext}
              disabled={page >= totalPages}
              className="px-2 py-1 text-xs rounded disabled:opacity-50 hover:bg-gray-100"
              aria-label="Next page"
              title="Next page"
            >
              ›
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 text-xs rounded disabled:opacity-50 hover:bg-gray-100"
              aria-label="Last page"
              title="Last page"
            >
              »
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex flex-wrap gap-2">
          {debouncedSearch && (
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
              <span>Search: {debouncedSearch}</span>
              <button onClick={() => setSearch("")} aria-label="Clear search">
                ✕
              </button>
            </div>
          )}
          {plantFilter && (
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
              <span>Plant: {plantFilter}</span>
              <button
                onClick={() => setPlantFilter(null)}
                aria-label="Clear plant"
              >
                ✕
              </button>
            </div>
          )}
          {deptFilter && (
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
              <span>Dept: {deptFilter}</span>
              <button
                onClick={() => setDeptFilter(null)}
                aria-label="Clear dept"
              >
                ✕
              </button>
            </div>
          )}
          {statusFilter && (
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
              <span>
                Status:{" "}
                {statusFilter.charAt(0).toUpperCase() +
                  statusFilter.slice(1).replace(/_/g, " ")}
              </span>
              <button
                onClick={() => setStatusFilter(null)}
                aria-label="Clear status"
              >
                ✕
              </button>
            </div>
          )}
          {(dateFrom || dateTo) && (
            <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-2">
              <span>
                Date: {dateFrom || ""} - {dateTo || ""}
              </span>
              <button
                onClick={() => {
                  setDateFrom(null);
                  setDateTo(null);
                }}
                aria-label="Clear date"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
