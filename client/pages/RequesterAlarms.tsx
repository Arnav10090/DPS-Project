import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Bell, Search, Trash, Eye, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
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

const TYPE_CONFIG: Record<NotificationType, { color: string; icon: any; label: string }> = {
  approved: { color: "border-l-4 border-green-600", icon: CheckCircle, label: "Approved" },
  rejected: { color: "border-l-4 border-red-600", icon: XCircle, label: "Rejected" },
  under_review: { color: "border-l-4 border-blue-600", icon: Clock, label: "Under Review" },
  closed: { color: "border-l-4 border-gray-600", icon: FileText, label: "Closed" },
  action_required: { color: "border-l-4 border-orange-600", icon: AlertCircle, label: "Action Required" },
  expiring: { color: "border-l-4 border-yellow-600", icon: Clock, label: "Expiring" },
  system: { color: "border-l-4 border-slate-400", icon: Bell, label: "System" },
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        <main>
          <Card>
            <CardHeader className="flex flex-col gap-3">
              <div className="flex items-center gap-3 w-full">
                <Input 
                  placeholder="Search permits..." 
                  value={query} 
                  onChange={(e) => setQuery(e.target.value)} 
                />
                <div className="flex items-center gap-2">
                  <Input 
                    type="date" 
                    value={fromDate} 
                    onChange={(e) => setFromDate(e.target.value)} 
                    className="w-[160px]" 
                  />
                  <Input 
                    type="date" 
                    value={toDate} 
                    onChange={(e) => setToDate(e.target.value)} 
                    className="w-[160px]" 
                  />
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setQuery(""); setFromDate(""); setToDate(""); }}
                  >
                    Reset
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button 
                    className={`px-3 py-1 rounded whitespace-nowrap ${tab === "all" ? "bg-muted" : ""}`} 
                    onClick={() => setTab("all")}
                  >
                    All ({stats.total})
                  </button>
                  <button 
                    className={`px-3 py-1 rounded whitespace-nowrap ${tab === "action_required" ? "bg-muted" : ""}`} 
                    onClick={() => setTab("action_required")}
                  >
                    Action Required ({stats.actionRequired})
                  </button>
                  <button 
                    className={`px-3 py-1 rounded whitespace-nowrap ${tab === "approved" ? "bg-muted" : ""}`} 
                    onClick={() => setTab("approved")}
                  >
                    Approved ({stats.approved})
                  </button>
                  <button 
                    className={`px-3 py-1 rounded whitespace-nowrap ${tab === "rejected" ? "bg-muted" : ""}`} 
                    onClick={() => setTab("rejected")}
                  >
                    Rejected ({stats.rejected})
                  </button>
                  <button 
                    className={`px-3 py-1 rounded whitespace-nowrap ${tab === "under_review" ? "bg-muted" : ""}`} 
                    onClick={() => setTab("under_review")}
                  >
                    Under Review ({stats.underReview})
                  </button>
                  <button 
                    className={`px-3 py-1 rounded whitespace-nowrap ${tab === "closed" ? "bg-muted" : ""}`} 
                    onClick={() => setTab("closed")}
                  >
                    Closed ({stats.closed})
                  </button>
                </div>

                <div className="ml-auto flex items-center gap-2 flex-shrink-0">
                  <Button variant="ghost" size="sm" onClick={markAllRead}>
                    Mark All as Read
                  </Button>
                  <Button variant="destructive" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Bulk actions */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const next: Record<string, boolean> = {};
                      filtered.forEach((n) => next[n.id] = checked);
                      setSelected(next);
                    }} 
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </label>
                <Button size="sm" variant="outline" onClick={bulkMarkRead}>
                  Mark Selected as Read
                </Button>
                <Button size="sm" variant="destructive" onClick={bulkClear}>
                  Clear Selected
                </Button>
              </div>

              {/* Notification list */}
              <div className="flex flex-col">
                {filtered.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <div className="mb-3 text-lg font-medium">No notifications found</div>
                    <div className="mb-3">Create a new permit request to get updates on your permits.</div>
                    <div className="flex justify-center">
                      <Button onClick={() => navigate('/alarms')}>
                        Create New Permit Request
                      </Button>
                    </div>
                  </div>
                ) : (
                  filtered.map((n) => {
                    const config = TYPE_CONFIG[n.type];
                    const Icon = config.icon;
                    
                    return (
                      <div 
                        key={n.id} 
                        className={`mb-3 rounded-md bg-white p-4 shadow-sm ${config.color} flex items-start gap-3`} 
                        role="article" 
                        aria-labelledby={`notif-${n.id}`}
                      >
                        <div className="flex-shrink-0 mt-1">
                          <Icon size={16} className="text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`inline-block h-3 w-3 rounded-full ${PRIORITY_COLOR[n.priority]}`} />
                                <span className="text-xs text-muted-foreground">{config.label}</span>
                                {n.actionRequired && (
                                  <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                                    Action Required
                                  </span>
                                )}
                                {!n.read && (
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                    New
                                  </span>
                                )}
                              </div>
                              
                              <div id={`notif-${n.id}`} className={`${n.read ? 'text-foreground' : 'font-semibold'} mb-1`}>
                                {n.title}
                              </div>
                              
                              <div className="text-sm text-muted-foreground mb-2">
                                {n.message}
                              </div>
                              
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Permit: {n.permitId}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</span>
                                {n.dueDate && (
                                  <>
                                    <span>•</span>
                                    <span className="text-orange-600 font-medium">
                                      Due: {formatDistanceToNow(new Date(n.dueDate), { addSuffix: true })}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <input 
                                type="checkbox" 
                                checked={!!selected[n.id]} 
                                onChange={(e) => toggleSelect(n.id, e.target.checked)}
                                aria-label={`Select notification ${n.id}`}
                              />
                            </div>
                          </div>
                          
                          <div className="mt-3 flex items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => navigate('/alarms')}
                            >
                              <Eye size={14} className="mr-1" />
                              View Permit
                            </Button>
                            
                            {n.actionRequired && (
                              <Button 
                                size="sm" 
                                onClick={() => handlePermitAction(n)}
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                Take Action
                              </Button>
                            )}
                            
                            <button 
                              onClick={() => toggleRead(n.id)}
                              className="text-xs px-2 py-1 rounded border hover:bg-gray-50"
                            >
                              {n.read ? 'Mark Unread' : 'Mark Read'}
                            </button>
                            
                            <button 
                              onClick={() => dismiss(n.id)}
                              className="text-red-600 p-1 rounded hover:bg-red-50"
                              title="Dismiss notification"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        <aside>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Permit Summary</CardTitle>
                <CardDescription>Your permit statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <span className="text-sm">Approved</span>
                    </div>
                    <div className="font-semibold">{stats.approved}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-600" />
                      <span className="text-sm">Under Review</span>
                    </div>
                    <div className="font-semibold">{stats.underReview}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle size={16} className="text-red-600" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <div className="font-semibold">{stats.rejected}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-sm">Closed</span>
                    </div>
                    <div className="font-semibold">{stats.closed}</div>
                  </div>
                  
                  <div className="flex items-center justify-between border-t pt-2 mt-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-orange-600" />
                      <span className="text-sm font-medium">Action Required</span>
                    </div>
                    <div className="font-semibold text-orange-600">{stats.actionRequired}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/alarms')}
                  >
                    <FileText size={16} className="mr-2" />
                    New Permit Request
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/alarms')}
                  >
                    <Search size={16} className="mr-2" />
                    View Draft Permits
                  </Button>
                  
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/alarms')}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Active Permits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}