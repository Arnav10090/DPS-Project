import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { PermitItem, PermitStatus } from "./PermitStatusTable";

function StatusPill({ status }: { status: PermitStatus }) {
  if (status === "approved")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
        Approved
      </span>
    );
  if (status === "rejected")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
        Rejected
      </span>
    );
  if (status === "in_progress")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
        In Progress
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
      Pending
    </span>
  );
}

export function PermitStatusCard({ item }: { item: PermitItem }) {
  const [open, setOpen] = React.useState(false);
  const issued = parseISO(item.date);
  const days = differenceInDays(new Date(), issued);

  return (
    <Card
      className={
        item.status === "approved"
          ? "border-green-200 bg-green-50/50"
          : "bg-white"
      }
    >
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Permit: {item.permitNo}</CardTitle>
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">{item.plant}</span> • {item.dept} •{" "}
              {format(issued, "dd MMM yyyy")}
            </div>
          </div>
          <StatusPill status={item.status} />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-gray-500">Requester</div>
            <div className="font-medium">{item.requester}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500">Days from Issued</div>
            <div className="font-semibold">{days}</div>
          </div>
        </div>

        {open && (
          <div className="mt-4 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-gray-500">Approver 1</div>
                <div className="font-medium">{item.approver1 || "-"}</div>
              </div>
              <div>
                <div className="text-gray-500">Approver 2</div>
                <div className="font-medium">{item.approver2 || "-"}</div>
              </div>
            </div>
            <div>
              <div className="text-gray-500">Safety Approver</div>
              <div className="font-medium">{item.safetyApprover || "-"}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-gray-500">Return Date</div>
                <div className="font-medium">
                  {item.returnDate
                    ? format(parseISO(item.returnDate), "dd MMM yyyy")
                    : "-"}
                </div>
              </div>
            </div>
            {item.commentsRequester && (
              <div>
                <div className="text-gray-500">Comments from Requester</div>
                <div className="mt-1">{item.commentsRequester}</div>
              </div>
            )}
            {item.commentsApprover && (
              <div>
                <div className="text-gray-500">Comments from Approver</div>
                <div className="mt-1">{item.commentsApprover}</div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            className="w-full min-h-[44px]"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={`permit-${item.id}-details`}
          >
            {open ? (
              <>
                Hide Details
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show Details
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </Button>
          <a
            href={`/permit-details?permit=${encodeURIComponent(item.permitNo)}`}
            className="w-full inline-flex items-center justify-center px-4 py-2 rounded-md bg-primary text-white hover:bg-primary/90 transition-colors min-h-[44px] text-sm font-medium"
          >
            View Details
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
