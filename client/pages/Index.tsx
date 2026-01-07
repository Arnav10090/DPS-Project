import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StatusCard from "@/components/common/StatusCard";
import ContractorStatsChart from "@/components/charts/ContractorStatsChart";
import ContractorKpisChart from "@/components/charts/ContractorKpisChart";
import RequesterMergedChart from "@/components/charts/RequesterMergedChart";
import AdminBarChart from "@/components/charts/AdminBarChart";
import AdminLineChart from "@/components/charts/AdminLineChart";
import {
  FileText,
  CheckCircle2,
  Clock4,
  Undo2,
  PauseCircle,
  XCircle,
  Users,
  TrendingUp,
  AlertTriangle,
  Shield,
  UserPlus,
  Settings,
  Activity,
  Key,
  FileX,
} from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const counters = useMemo(
    () => ({
      new: 12,
      approved: 48,
      pending: 7,
      returned: 3,
      hold: 5,
      rejected: 2,
      totalPermits: 77, // Sum of all permits
      // Administrator specific counters
      totalUsers: 156,
      newUsers: 8,
      activeRoles: 12,
      securityAlerts: 3,
      currentlyOnline: 23,
      pendingActions: 15,
      permissionIssues: 2,
    }),
    [],
  );

  // Get user role - replace this with your actual authentication logic
  const userRole = getCurrentUserRole(); // This should come from your auth context/store
  const isRequester = userRole === "requester";
  const isApprover = userRole === "approver";
  const isSafetyOfficer = userRole === "safety";
  const isAdministrator = userRole === "admin";

  // Define status cards based on role
  const statusCards = useMemo(() => {
    if (isRequester) {
      // Requester: Total permits, approved permits, rejected permits, permits under hold
      return [
        {
          title: "Total Permits",
          count: counters.totalPermits,
          Icon: FileText,
          accentClass: "from-blue-600/40 to-transparent",
          to: "/all-permits",
        },
        {
          title: "Approved Permits",
          count: counters.approved,
          Icon: CheckCircle2,
          accentClass: "from-[#4caf50]/40 to-transparent",
          to: "/approved-permits",
        },
        {
          title: "Rejected Permits",
          count: counters.rejected,
          Icon: XCircle,
          accentClass: "from-[#f44336]/40 to-transparent",
          to: "/rejected-permits",
        },
        {
          title: "Permits Under Hold",
          count: counters.hold,
          Icon: PauseCircle,
          accentClass: "from-purple-500/40 to-transparent",
          to: "/permits-on-hold",
        },
      ];
    } else if (isApprover) {
      // Approver: New permits, approved permits, pending approval permits, returned permits, permits under hold, permits rejected
      return [
        {
          title: "New Permits",
          count: counters.new,
          Icon: FileText,
          accentClass: "from-blue-500/40 to-transparent",
          to: "/new-permits",
        },
        {
          title: "Approved Permits",
          count: counters.approved,
          Icon: CheckCircle2,
          accentClass: "from-[#4caf50]/40 to-transparent",
          to: "/approved-permits",
        },
        {
          title: "Pending Approval",
          count: counters.pending,
          Icon: Clock4,
          accentClass: "from-[#ff9800]/40 to-transparent",
          to: "/pending-approval",
        },
        {
          title: "Returned Permits",
          count: counters.returned,
          Icon: Undo2,
          accentClass: "from-yellow-400/40 to-transparent",
          to: "/returned-permits",
        },
        {
          title: "Permits Under Hold",
          count: counters.hold,
          Icon: PauseCircle,
          accentClass: "from-purple-500/40 to-transparent",
          to: "/permits-on-hold",
        },
        {
          title: "Rejected Permits",
          count: counters.rejected,
          Icon: XCircle,
          accentClass: "from-[#f44336]/40 to-transparent",
          to: "/rejected-permits",
        },
      ];
    } else if (isSafetyOfficer) {
      // Safety Officer: New permits, approved permits, pending approval permits, returned permits, permits under hold, permits rejected
      return [
        {
          title: "New Permits",
          count: counters.new,
          Icon: FileText,
          accentClass: "from-blue-500/40 to-transparent",
          to: "/new-permits",
        },
        {
          title: "Approved Permits",
          count: counters.approved,
          Icon: CheckCircle2,
          accentClass: "from-[#4caf50]/40 to-transparent",
          to: "/approved-permits",
        },
        {
          title: "Pending Approval",
          count: counters.pending,
          Icon: Clock4,
          accentClass: "from-[#ff9800]/40 to-transparent",
          to: "/pending-approval",
        },
        {
          title: "Returned Permits",
          count: counters.returned,
          Icon: Undo2,
          accentClass: "from-yellow-400/40 to-transparent",
          to: "/returned-permits",
        },
        {
          title: "Permits Under Hold",
          count: counters.hold,
          Icon: PauseCircle,
          accentClass: "from-purple-500/40 to-transparent",
          to: "/permits-on-hold",
        },
        {
          title: "Rejected Permits",
          count: counters.rejected,
          Icon: XCircle,
          accentClass: "from-[#f44336]/40 to-transparent",
          to: "/rejected-permits",
        },
      ];
    } else if (isAdministrator) {
      // Administrator: total users, new users, active roles, security alerts, currently online, pending actions, permissions issues
      return [
        {
          title: "Total Users",
          count: counters.totalUsers,
          Icon: Users,
          accentClass: "from-indigo-500/40 to-transparent",
          to: "/users",
        },
        {
          title: "New Users",
          count: counters.newUsers,
          Icon: UserPlus,
          accentClass: "from-green-500/40 to-transparent",
          to: "/new-users",
        },
        {
          title: "Active Roles",
          count: counters.activeRoles,
          Icon: Settings,
          accentClass: "from-blue-500/40 to-transparent",
          to: "/roles",
        },
        {
          title: "Security Alerts",
          count: counters.securityAlerts,
          Icon: Shield,
          accentClass: "from-red-500/40 to-transparent",
          to: "/security-alerts",
        },
        {
          title: "Currently Online",
          count: counters.currentlyOnline,
          Icon: Activity,
          accentClass: "from-green-400/40 to-transparent",
          to: "/online-users",
        },
        {
          title: "Pending Actions",
          count: counters.pendingActions,
          Icon: Clock4,
          accentClass: "from-orange-500/40 to-transparent",
          to: "/pending-actions",
        },
        {
          title: "Permission Issues",
          count: counters.permissionIssues,
          Icon: Key,
          accentClass: "from-yellow-600/40 to-transparent",
          to: "/permission-issues",
        },
      ];
    } else {
      // Default/Contractor - original status cards
      return [
        {
          title: "New Permits",
          count: counters.new,
          Icon: FileText,
          accentClass: "from-[#f44336]/40 to-transparent",
          to: "/permit-details",
        },
        {
          title: "Approved Permits",
          count: counters.approved,
          Icon: CheckCircle2,
          accentClass: "from-[#4caf50]/40 to-transparent",
          to: "/overall-status",
        },
        {
          title: "Pending Approval Permits",
          count: counters.pending,
          Icon: Clock4,
          accentClass: "from-[#ff9800]/40 to-transparent",
          to: "/overall-status",
        },
        {
          title: "Returned Permits",
          count: counters.returned,
          Icon: Undo2,
          accentClass: "from-yellow-400/40 to-transparent",
          to: "/permit-details",
        },
        {
          title: "Permits under Hold",
          count: counters.hold,
          Icon: PauseCircle,
          accentClass: "from-purple-500/40 to-transparent",
          to: "/overall-status",
        },
        {
          title: "Permits Rejected",
          count: counters.rejected,
          Icon: XCircle,
          accentClass: "from-[#f44336]/40 to-transparent",
          to: "/overall-status",
        },
      ];
    }
  }, [counters, isRequester, isApprover, isSafetyOfficer, isAdministrator]);

  return (
    <div className="space-y-6">
      <section
        aria-label="Status cards"
        className={`grid gap-4 ${
          isAdministrator
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7"
            : isRequester
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
        }`}
      >
        {statusCards.map((card, index) => {
          // Create filter-based navigation for requester/approver/safety KPI cards
          const handleCardClick = () => {
            let filterParam = '';
            if (isRequester) {
              const filterMap: Record<string, string> = {
                'All-Permits': 'all',
                'Approved-Permits': 'approved',
                'Rejected-Permits': 'rejected',
                'Permits-Under-Hold': 'hold',
              };
              filterParam = filterMap[card.title.replace(/\s+/g, '-')] || 'all';
            } else if (isApprover || isSafetyOfficer) {
              const filterMap: Record<string, string> = {
                'New-Permits': 'new',
                'Approved-Permits': 'approved',
                'Pending-Approval': 'pending',
                'Returned-Permits': 'returned',
                'Permits-Under-Hold': 'hold',
                'Rejected-Permits': 'rejected',
              };
              filterParam = filterMap[card.title.replace(/\s+/g, '-')] || 'all';
            }

            if (filterParam && !isAdministrator) {
              navigate(`/overall-status?filter=${filterParam}`);
            } else if (card.to) {
              navigate(card.to);
            }
          };

          return (
            <StatusCard
              key={index}
              title={card.title}
              count={card.count}
              Icon={card.Icon}
              accentClass={card.accentClass}
              to={isAdministrator ? card.to : undefined}
              onCardClick={!isAdministrator ? handleCardClick : undefined}
            />
          );
        })}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isRequester ? (
          // Requester view - components handle their own styling
          <>
            <div className="lg:col-span-2">
              <RequesterBarChart />
            </div>
            <div>
              <RequesterLineChart />
            </div>
          </>
        ) : isAdministrator ? (
          // Administrator view - components handle their own styling
          <>
            <div className="lg:col-span-2">
              <AdminBarChart />
            </div>
            <div>
              <AdminLineChart />
            </div>
          </>
        ) : (
          // Contractor/other roles view - dashboard provides styling
          <>
            <div className="lg:col-span-2 bg-white rounded-card shadow-card">
              <div className="bg-[#f44336] text-white px-4 py-2 rounded-t-card font-medium">
                Contractor Statistics
              </div>
              <div className="p-5">
                <div className="mb-2 text-sm text-gray-500 flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 bg-gray-200 rounded"
                    aria-hidden
                  />
                  <span>Bar graph - hover for details</span>
                </div>
                <ContractorStatsChart />
              </div>
            </div>
            <div className="bg-white rounded-card shadow-card">
              <div className="bg-[#f44336] text-white px-4 py-2 rounded-t-card font-medium">
                Contractor KPIs
              </div>
              <div className="p-5">
                <ContractorKpisChart />
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

// Helper function to get current user role from localStorage
function getCurrentUserRole() {
  try {
    return localStorage.getItem("dps_role") || "requester";
  } catch (e) {
    // Fallback if localStorage is not available
    return "requester";
  }
}
