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
    <div className="mb-4 space-y-3">
      <div className="bg-card border p-4 rounded-lg shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap lg:flex-nowrap">
          <div className="relative flex-1 min-w-0">
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
              placeholder="Search permits, companies, or permit numbers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-10 w-full lg:w-[min(720px,60vw)] h-11 min-w-0"
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

          <div className="flex flex-col w-full lg:w-auto">
            <div className="flex items-center gap-2 w-full lg:w-auto">
              <div className="text-md text-gray-700">
                <p>
                  <strong>From:</strong>
                </p>
              </div>
              <Input
                type="date"
                value={dateFrom || ""}
                onChange={(e) => setDateFrom(e.target.value || null)}
                className="h-10 w-28 md:w-40 min-w-0"
                aria-label="From date"
              />
              <div className="text-md text-gray-700">
                <p>
                  <strong>To:</strong>
                </p>
              </div>
              <Input
                type="date"
                value={dateTo || ""}
                onChange={(e) => setDateTo(e.target.value || null)}
                className="h-10 w-28 md:w-40 min-w-0"
                aria-label="To date"
              />
            </div>

            <div className="flex items-center gap-1 mt-3 lg:mt-2">
              <button
                type="button"
                onClick={() => applyPreset("today")}
                className="text-xs px-2 py-1 rounded-md bg-gray-100"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => applyPreset("week")}
                className="text-xs px-2 py-1 rounded-md bg-gray-100"
              >
                Week
              </button>
              <button
                type="button"
                onClick={() => applyPreset("month")}
                className="text-xs px-2 py-1 rounded-md bg-gray-100"
              >
                Month
              </button>
              <button
                type="button"
                onClick={() => applyPreset("30")}
                className="text-xs px-2 py-1 rounded-md bg-gray-100"
              >
                30d
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end lg:ml-2">
          <div className="ml-2">
            {activeFilterCount > 0 ? (
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                <span>
                  {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                  applied
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <div className="flex flex-col">
          <div className="text-md text-gray-700">
            <p>
              <strong>Plant:</strong>
            </p>
          </div>
          <Select
            value={plantFilter ?? "__all__"}
            onValueChange={(v) => setPlantFilter(v === "__all__" ? null : v)}
          >
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder="Plant: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {plants.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <div className="text-md text-gray-700">
            <p>
              <strong>Status:</strong>
            </p>
          </div>
          <div className="inline-flex gap-2 items-center">
            <button
              className={cn(
                "px-3 py-2 rounded-md text-sm",
                statusFilter === null ? "bg-primary text-white" : "bg-gray-100",
              )}
              onClick={() => setStatusFilter(null)}
            >
              All
            </button>
            {statuses.map((s) => (
              <button
                key={s}
                className={cn(
                  "px-3 py-2 rounded-md text-sm",
                  statusFilter === s ? "bg-primary text-white" : "bg-gray-100",
                )}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-sm text-gray-700">
            <p>
              <strong>Rows:</strong>
            </p>
          </div>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
          >
            <SelectTrigger className="h-9 w-24 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
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
              <span>Status: {statusFilter}</span>
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
