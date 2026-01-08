import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import { Bell, Search, Trash, Eye, FileText, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

type NotificationType = "approved" | "rejected" | "under_review" | "closed" | "action_required" | "expiring" | "system";
type PermitStatus = "submitted" | "under_review" | "approved" | "rejected" | "closed";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  permitId: string;
  permitStatus: PermitStatus;
  priority: "high" | "medium" | "low";
  createdAt: string; // ISO
  read: boolean;
  actionRequired?: boolean;
  dueDate?: string; // For expiring permits
};

// Mock data representing notifications for requester's permits
const SAMPLE: NotificationItem[] = [
  { 
    id: "n-1", 
    type: "approved", 
    title: "Permit WCS-2024-015 Approved", 
    message: "Your permit has been approved by Alice M. You can now proceed with work.", 
    permitId: "WCS-2024-015", 
    permitStatus: "approved",
    priority: "medium", 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
    read: false 
  },
  { 
    id: "n-2", 
    type: "action_required", 
    title: "Action Required - WCS-2024-018", 
    message: "Additional documentation needed. Please provide safety assessment.", 
    permitId: "WCS-2024-018", 
    permitStatus: "under_review",
    priority: "high", 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), 
    read: false,
    actionRequired: true
  },
  { 
    id: "n-3", 
    type: "closed", 
    title: "Work Completed - WCS-2024-009", 
    message: "Work completion has been verified and permit is now closed.", 
    permitId: "WCS-2024-009", 
    permitStatus: "closed",
    priority: "low", 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
    read: true 
  },
  { 
    id: "n-4", 
    type: "rejected", 
    title: "Permit WCS-2024-021 Rejected", 
    message: "Permit rejected due to incomplete safety measures. Review comments and resubmit.", 
    permitId: "WCS-2024-021", 
    permitStatus: "rejected",
    priority: "high", 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), 
    read: false,
    actionRequired: true
  },
  { 
    id: "n-5", 
    type: "under_review", 
    title: "Permit Under Review - WCS-2024-030", 
    message: "Your permit is now under review by the safety team.", 
    permitId: "WCS-2024-030", 
    permitStatus: "under_review",
    priority: "medium", 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), 
    read: false 
  },
  { 
    id: "n-6", 
    type: "expiring", 
    title: "Permit Expiring Soon", 
    message: "Permit WCS-2024-025 will expire in 2 days. Submit work completion or request extension.", 
    permitId: "WCS-2024-025", 
    permitStatus: "approved",
    priority: "high", 
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), 
    read: false,
    actionRequired: true,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString()
  },
  { 
    id: "n-7", 
    type: "system", 
    title: "Draft Auto-saved", 
    message: "Your draft permit WCS-2024-032 has been saved automatically.", 
    permitId: "WCS-2024-032", 
    permitStatus: "submitted",
    priority: "low", 
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), 
    read: true 
  }
];

const TYPE_CONFIG: Record<NotificationType, { color: string; icon: any; label: string; alarmType: string }> = {
  approved: { color: "border-l-4 border-green-600", icon: CheckCircle, label: "Approved", alarmType: "Permit Approved" },
  rejected: { color: "border-l-4 border-red-600", icon: XCircle, label: "Rejected", alarmType: "Permit Rejected" },
  under_review: { color: "border-l-4 border-blue-600", icon: Clock, label: "Under Review", alarmType: "Permit Review" },
  closed: { color: "border-l-4 border-gray-600", icon: FileText, label: "Closed", alarmType: "Permit Closure" },
  action_required: { color: "border-l-4 border-orange-600", icon: AlertCircle, label: "Action Required", alarmType: "Action Required" },
  expiring: { color: "border-l-4 border-yellow-600", icon: Clock, label: "Expiring", alarmType: "Permit Expiring" },
  system: { color: "border-l-4 border-slate-400", icon: Bell, label: "System", alarmType: "System" },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "bg-red-500",
  medium: "bg-orange-400",
  low: "bg-gray-400",
};

export default function RequesterAlarms() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(SAMPLE);
  const [tab, setTab] = useState<"all" | "action_required" | "approved" | "rejected" | "under_review" | "closed">("all");
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();

  useEffect(() => {
    // Placeholder for real-time updates
    // In production, subscribe to permit status changes via websocket
  }, []);

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const actionRequired = notifications.filter(n => n.actionRequired).length;
    const approved = notifications.filter(n => n.permitStatus === "approved").length;
    const rejected = notifications.filter(n => n.permitStatus === "rejected").length;
    const underReview = notifications.filter(n => n.permitStatus === "under_review").length;
    const closed = notifications.filter(n => n.permitStatus === "closed").length;
    
    return { total, unread, actionRequired, approved, rejected, underReview, closed };
  }, [notifications]);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (tab === "action_required" && !n.actionRequired) return false;
      if (tab === "approved" && n.permitStatus !== "approved") return false;
      if (tab === "rejected" && n.permitStatus !== "rejected") return false;
      if (tab === "under_review" && n.permitStatus !== "under_review") return false;
      if (tab === "closed" && n.permitStatus !== "closed") return false;
      
      if (query) {
        const q = query.toLowerCase();
        if (!(`${n.title} ${n.message} ${n.permitId}`.toLowerCase().includes(q))) return false;
      }
      if (fromDate) {
        if (new Date(n.createdAt) < new Date(fromDate)) return false;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (new Date(n.createdAt) > end) return false;
      }
      return true;
    }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [notifications, tab, query, fromDate, toDate]);

  function toggleRead(id: string) {
    setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));
  }

  function dismiss(id: string) {
    setNotifications((s) => s.filter((n) => n.id !== id));
    setSelected((s) => {
      const copy = { ...s };
      delete copy[id];
      return copy;
    });
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelected((s) => ({ ...s, [id]: checked }));
  }

  function bulkMarkRead() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return;
    setNotifications((s) => s.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n)));
    setSelected({});
  }

  function bulkClear() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return;
    setNotifications((s) => s.filter((n) => !ids.includes(n.id)));
    setSelected({});
  }

  function markAllRead() {
    setNotifications((s) => s.map((n) => ({ ...n, read: true })));
    setSelected({});
  }

  function clearAll() {
    if (!confirm("Clear all notifications?")) return;
    setNotifications([]);
    setSelected({});
  }

  function handlePermitAction(notification: NotificationItem) {
    // Regardless of type, route to the Requester Alarms page
    navigate('/alarms');
  }

  return (
    <div className="pb-8">
      <div className="w-full">
        <main>
          <Card>
            <CardHeader className="flex flex-col gap-4 pb-4">
              {/* Filter Section */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                <div className="flex items-end gap-4">
                  {/* Search Input */}
                  <div className="w-48">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Search</label>
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search permits..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9 h-9 bg-white text-sm"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-end gap-3 w-80">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">From</label>
                      <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="h-9 bg-white text-sm w-full"
                        title="From date"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">To</label>
                      <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="h-9 bg-white text-sm w-full"
                        title="To date"
                      />
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="w-56">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                    <div className="relative">
                      <select
                        value={tab}
                        onChange={(e) => setTab(e.target.value as any)}
                        className="h-9 px-3 rounded-lg border-2 border-slate-300 bg-white text-sm font-medium text-slate-700 cursor-pointer appearance-none pr-8 w-full transition-all duration-200 hover:border-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-md focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="all">All ({stats.total})</option>
                        <option value="action_required">Action Required ({stats.actionRequired})</option>
                        <option value="approved">Approved ({stats.approved})</option>
                        <option value="rejected">Rejected ({stats.rejected})</option>
                        <option value="under_review">Under Review ({stats.underReview})</option>
                        <option value="closed">Closed ({stats.closed})</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 ml-auto">
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="h-9">
                      Mark All as Read
                    </Button>
                    <Button variant="destructive" size="sm" onClick={clearAll} className="h-9">
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>

              {/* Applied Filters Section */}
              {(query || fromDate || toDate || tab !== "all") && (
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">Applied Filters:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {query && (
                      <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        Search: "{query}"
                        <button onClick={() => setQuery("")} className="hover:text-blue-900">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {fromDate && (
                      <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        From: {format(new Date(fromDate), 'MMM dd, yyyy')}
                        <button onClick={() => setFromDate("")} className="hover:text-blue-900">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {toDate && (
                      <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        To: {format(new Date(toDate), 'MMM dd, yyyy')}
                        <button onClick={() => setToDate("")} className="hover:text-blue-900">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                    {tab !== "all" && (
                      <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        Status: {tab === "action_required" ? "Action Required" : tab.charAt(0).toUpperCase() + tab.slice(1).replace("_", " ")}
                        <button onClick={() => setTab("all")} className="hover:text-blue-900">
                          <X size={12} />
                        </button>
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setQuery(""); setFromDate(""); setToDate(""); setTab("all"); }}
                    className="ml-auto text-blue-600 hover:text-blue-800 h-8"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {/* Table Actions */}
              <div className="flex items-center gap-3 border-b pb-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const next: Record<string, boolean> = {};
                      filtered.forEach((n) => next[n.id] = checked);
                      setSelected(next);
                    }}
                    checked={filtered.length > 0 && filtered.every(n => selected[n.id])}
                  />
                  <span className="text-sm font-medium">Select All</span>
                </label>
                {Object.values(selected).some(v => v) && (
                  <>
                    <span className="text-sm text-muted-foreground">|</span>
                    <Button size="sm" variant="outline" onClick={bulkMarkRead}>
                      Mark as Read
                    </Button>
                    <Button size="sm" variant="destructive" onClick={bulkClear}>
                      Delete Selected
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Bell size={32} className="mx-auto mb-4 text-slate-300" />
                  <div className="mb-2 text-lg font-medium">No notifications found</div>
                  <div className="mb-4 text-sm">Create a new permit request to get updates on your permits.</div>
                  <Button onClick={() => navigate('/alarms')}>
                    Create New Permit Request
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-slate-50">
                        <th className="px-4 py-3 text-left border-r border-slate-400">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const next: Record<string, boolean> = {};
                              filtered.forEach((n) => next[n.id] = checked);
                              setSelected(next);
                            }}
                            checked={filtered.length > 0 && filtered.every(n => selected[n.id])}
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-r border-slate-400">Permit ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-r border-slate-400">Alarm Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-r border-slate-400">Type</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-r border-slate-400">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-r border-slate-400">Date & Time</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 border-r border-slate-400">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((n, index) => {
                        const config = TYPE_CONFIG[n.type];
                        const Icon = config.icon;
                        const statusBgColor = {
                          approved: "bg-green-100 text-green-800",
                          rejected: "bg-red-100 text-red-800",
                          under_review: "bg-blue-100 text-blue-800",
                          closed: "bg-slate-100 text-slate-800",
                          action_required: "bg-orange-100 text-orange-800",
                          expiring: "bg-yellow-100 text-yellow-800",
                          system: "bg-slate-100 text-slate-800",
                        };

                        return (
                          <tr
                            key={n.id}
                            className={`border-b hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}
                          >
                            <td className="px-4 py-3 border-r border-slate-400">
                              <input
                                type="checkbox"
                                checked={!!selected[n.id]}
                                onChange={(e) => toggleSelect(n.id, e.target.checked)}
                                aria-label={`Select notification ${n.id}`}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-900 border-r border-slate-400">
                              <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                {n.permitId}
                              </span>
                            </td>
                            <td className="px-4 py-3 border-r border-slate-400">
                              <div className={`text-sm ${n.read ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
                                {n.title}
                              </div>
                              {!n.read && (
                                <span className="inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                                  New
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm border-r border-slate-400">
                              <div className="flex items-center gap-2">
                                <Icon size={14} className="text-slate-500" />
                                <span className="text-slate-700">{config.alarmType}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 max-w-xs border-r border-slate-400">
                              <div className="line-clamp-2">{n.message}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap border-r border-slate-400">
                              <div>{format(new Date(n.createdAt), 'MMM dd, yyyy')}</div>
                              <div className="text-xs text-slate-500">{format(new Date(n.createdAt), 'HH:mm')}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium w-fit ${statusBgColor[n.type]}`}>
                                  {config.label}
                                </span>
                                {n.actionRequired && (
                                  <span className="inline-flex items-center rounded-full bg-orange-600 px-3 py-1 text-xs font-medium text-white w-fit">
                                    Action Required
                                  </span>
                                )}
                                {n.dueDate && (
                                  <span className="inline-flex items-center rounded-full bg-yellow-600 px-3 py-1 text-xs font-medium text-white w-fit">
                                    Due: {formatDistanceToNow(new Date(n.dueDate), { addSuffix: false })}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 px-2"
                                  onClick={() => navigate('/alarms')}
                                  title="View permit details"
                                >
                                  <Eye size={14} />
                                </Button>
                                <button
                                  onClick={() => toggleRead(n.id)}
                                  className="h-8 px-2 rounded border border-slate-300 hover:bg-slate-100 text-xs font-medium transition-colors"
                                  title={n.read ? "Mark as unread" : "Mark as read"}
                                >
                                  {n.read ? '👁' : '✓'}
                                </button>
                                <button
                                  onClick={() => dismiss(n.id)}
                                  className="h-8 px-2 rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete notification"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Table Footer - Results Info */}
              {filtered.length > 0 && (
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                  <span>Showing {filtered.length} of {notifications.length} alarms</span>
                  {query || fromDate || toDate ? (
                    <span className="text-xs">Filters applied - <button className="text-blue-600 hover:underline" onClick={() => { setQuery(""); setFromDate(""); setToDate(""); }}>Clear</button></span>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
