import { NavLink, useInRouterContext } from "react-router-dom";
import { useLocation } from "react-router-dom";
import React from "react";

// Define the type for tab objects
type TabItem = {
  to: string;
  label: string | React.ReactElement;
  hideForRequester?: boolean;
  hideForApprover?: boolean;
  hideForSafetyOfficer?: boolean;
  hideForAdmin?: boolean;
};

export default function NavTabs() {
  const inRouter = useInRouterContext();
  const location = useLocation();

  // read persisted role (set during login). default to empty string if not set
  const role =
    typeof window !== "undefined" ? localStorage.getItem("dps_role") || "" : "";

  const permitDetailsPath =
    role === "approver"
      ? "/approver-permit-details"
      : role === "safety"
        ? "/safety-permit-details"
        : "/permit-details";
  const baseTabs: TabItem[] = [{ to: "/", label: "Main Dashboard" }];

  const otherTabs: TabItem[] = [
    { to: "/overall-status", label: "Overall Permit Status" },
    {
      to: "/contractor-performance",
      label: <p>Contractor Performances</p>,
      hideForRequester: true,
      hideForAdmin: true,
    },
    { to: "/alarms", label: "Alarms" },
    // Place Spare Tab immediately to the right of Alarms
    {
      to: "/system-architecture",
      label: "System Architecture",
      hideForRequester: true,
      hideForApprover: true,
      hideForSafetyOfficer: true,
    },
    { to: "/spare", label: "Spare Tab" },
  ];

  // Filter base tabs for specific roles
  const filteredBaseTabs = baseTabs.filter(
    (tab) =>
      !(role === "approver" && tab.hideForApprover) &&
      !(role === "safety" && tab.hideForSafetyOfficer) &&
      !((role === "admin" || role === "administrator") && tab.hideForAdmin),
  );

  // Insert Work Closure tabs after Permit Details depending on role
  const tabs: TabItem[] = [...filteredBaseTabs];
  if (role === "admin" || role === "administrator") {
    tabs.push({ to: "/users", label: "Users" });
    tabs.push({ to: "/roles-permissions", label: "Roles & Permissions" });
    tabs.push({ to: "/work-closure-flow", label: "Work Closure Flow" });
    // tabs.push({ to: "/form-builder", label: "Form Builder" }); // Temporarily hidden per request
  }
  if (role === "requester") {
    // Permit Details for requester only (inline for safety officer in approval queue)
    tabs.push({
      to: permitDetailsPath,
      label: "Permit Details",
      hideForAdmin: true,
    });
    tabs.push({ to: "/work-closure-request", label: "Work Closure Request" });
  }
  if (role === "approver") {
    // Approver-specific navigation items: Approval Queue only (Permit Details hidden from nav, accessible via View button)
    tabs.push({ to: "/approval-queue", label: "Approval Queue" });
    tabs.push({ to: "/work-closure-approval", label: "Work Closure Approval" });
  }

  if (role === "safety") {
    // Safety Officer-specific navigation items: Approval Queue
    tabs.push({
      to: "/safety-officer-approval-queue",
      label: "Approval Queue",
    });
  }

  // Filter out tabs that should be hidden for specific roles
  const filteredOtherTabs = otherTabs.filter(
    (tab) =>
      !(role === "requester" && tab.hideForRequester) &&
      !(role === "approver" && tab.hideForApprover) &&
      !(role === "safety" && tab.hideForSafetyOfficer) &&
      !((role === "admin" || role === "administrator") && tab.hideForAdmin),
  );

  tabs.push(...filteredOtherTabs);

  return (
    <nav className="sticky top-16 z-40 bg-[#f5f5f5] border-b">
      <div className="mx-auto max-w-none w-full px-4 py-2">
        <ul className="flex flex-nowrap justify-center gap-2 whitespace-nowrap">
          {tabs.map((t) => (
            <li key={String(t.to)}>
              {inRouter ? (
                <NavLink
                  to={t.to}
                  end={t.to === "/"}
                  className={({ isActive }) => {
                    // keep Permit Details tab active for ht-permit and gas-permit routes as they're part of the Permit Details section
                    const isPermitTab =
                      t.to === "/permit-details" ||
                      t.to === "/approver-permit-details" ||
                      t.to === "/safety-permit-details";
                    const manualActive =
                      isPermitTab &&
                      (location.pathname === "/ht-permit" ||
                        location.pathname === "/gas-permit" ||
                        location.pathname.startsWith("/permit-details") ||
                        location.pathname.startsWith(
                          "/approver-permit-details",
                        ) ||
                        location.pathname.startsWith("/safety-permit-details"));

                    // Keep Approval Queue tab active when viewing approver permit details
                    const isApprovalQueueActive =
                      t.to === "/approval-queue" &&
                      location.pathname.startsWith("/approver-permit-details");

                    const active =
                      isActive || manualActive || isApprovalQueueActive;
                    return [
                      "inline-flex items-center rounded-full px-4 py-2 text-[14px] transition-colors",
                      active
                        ? "bg-[#4CAF50] text-white shadow"
                        : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 border",
                    ].join(" ");
                  }}
                  aria-label={typeof t.label === "string" ? t.label : undefined}
                >
                  {t.label}
                </NavLink>
              ) : (
                <a
                  href={t.to}
                  className="inline-flex items-center rounded-full px-4 py-2 text-sm bg-white text-gray-700 border"
                >
                  {t.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
