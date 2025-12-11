import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Clock, Users, MessageSquare, CheckCircle, AlertTriangle, Search, Filter, X, Settings } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  priority?: "critical" | "high" | "normal";
  unread?: boolean;
};

const INITIAL: AppNotification[] = [
  { id: "EP-2024-001", type: "Emergency", title: "URGENT: Emergency Permit EP-2024-001 requires immediate approval", body: "Work Type: Hot Work - Welding Operations\nLocation: Plant Floor - Section B\nSubmitted: 15 minutes ago by John Smith\nEstimated Start: In 2 hours\nAction Required: Review and approve within 30 minutes", time: "15 minutes ago", priority: "critical", unread: true },
  { id: "WP-2024-156", type: "Overdue", title: "OVERDUE: Permit WP-2024-156 pending approval for 2 days", body: "Work Type: Electrical Maintenance\nRequester: Sarah Johnson - Maintenance Dept.\nExpected Approval: 2 days ago\nRisk Level: Medium", time: "2 days ago", priority: "high", unread: true },
  { id: "WP-2024-160", type: "Submission", title: "New Permit Submission: WP-2024-160", body: "Permit WP-2024-160 - Confined Space Entry\nSubmitted by: Mike Chen (Operations)\nPriority: High\nDocuments Attached: 3 files", time: "2 hours ago", priority: "normal", unread: true },
  { id: "WP-2024-158", type: "Safety", title: "Safety Review Complete: WP-2024-158", body: "Safety Officer Dr. Lisa Park has approved with conditions\nAdditional Requirements: PPE mandatory, Air monitoring every 30 minutes", time: "1 hour ago", priority: "normal", unread: false },
  { id: "WP-2024-142", type: "Completion", title: "Work Completion Submitted: WP-2024-142", body: "Requester: Jennifer Lee has submitted completion\nWork Duration: 6 hours\nCompletion Photos: 8 images uploaded", time: "30 minutes ago", priority: "normal", unread: true },
];

const QUICK_FILTERS = [
  { key: "all", label: "All", count: 0 },
  { key: "unread", label: "Unread", count: 0 },
  { key: "critical", label: "Critical", count: 0 },
  { key: "today", label: "Today", count: 0 },
];

const TYPE_ICONS = {
  Emergency: ShieldAlert,
  Overdue: Clock,
  Submission: MessageSquare,
  Safety: CheckCircle,
  Completion: CheckCircle,
};

const PRIORITY_COLORS = {
  critical: "bg-red-100 text-red-800 border-red-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  normal: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function ApproverAlarms() {
  const [items, setItems] = useState<AppNotification[]>(INITIAL);
  const [quickFilter, setQuickFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read">("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "critical" | "high" | "normal">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "Emergency" | "Overdue" | "Submission" | "Safety" | "Completion">("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const unreadCount = useMemo(() => items.filter((i) => i.unread).length, [items]);
  
  const criticalCount = useMemo(() => 
    items.filter((i) => i.priority === "critical" || i.priority === "high").length, 
  [items]);

  const todayCount = useMemo(() => 
    items.filter((i) => /minute|hour/i.test(i.time)).length,
  [items]);

  const quickFiltersWithCounts = QUICK_FILTERS.map(f => ({
    ...f,
    count: f.key === "all" ? items.length :
           f.key === "unread" ? unreadCount :
           f.key === "critical" ? criticalCount :
           f.key === "today" ? todayCount : 0
  }));

  const markAllRead = () => setItems((s) => s.map((i) => ({ ...i, unread: false })));
  const markRead = (id: string) => setItems((s) => s.map((i) => (i.id === id ? { ...i, unread: false } : i)));

  const isToday = (s: string) => /minute|hour/i.test(s);
  const isThisWeek = (s: string) => /day/i.test(s) || isToday(s);

  const hasActiveFilters = useMemo(() => {
    return searchQuery.trim() || 
           statusFilter !== "all" || 
           priorityFilter !== "all" || 
           typeFilter !== "all" || 
           timeFilter !== "all" ||
           quickFilter !== "all";
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, timeFilter, quickFilter]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setTypeFilter("all");
    setTimeFilter("all");
    setQuickFilter("all");
    setShowAdvancedFilters(false);
  };

  const filtered = items.filter((i) => {
    // Quick filter
    if (quickFilter === "unread" && !i.unread) return false;
    if (quickFilter === "critical" && !(i.priority === "critical" || i.priority === "high")) return false;
    if (quickFilter === "today" && !isToday(i.time)) return false;

    // Text search
    const text = `${i.id} ${i.title} ${i.body}`.toLowerCase();
    if (searchQuery.trim() && !text.includes(searchQuery.toLowerCase())) return false;

    // Advanced filters
    if (statusFilter === "unread" && !i.unread) return false;
    if (statusFilter === "read" && i.unread) return false;

    if (priorityFilter !== "all" && i.priority !== priorityFilter) return false;

    if (typeFilter !== "all" && i.type !== typeFilter) return false;

    if (timeFilter === "today" && !isToday(i.time)) return false;
    if (timeFilter === "week" && !isThisWeek(i.time)) return false;

    return true;
  });

  const criticalAlerts = items.filter((i) => i.priority === "critical" || i.priority === "high");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Notifications & Alerts</h1>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {unreadCount} Unread
            </Badge>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {criticalCount} Critical
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            Mark All Read
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-1">
        <div className="flex gap-1">
          {quickFiltersWithCounts.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setQuickFilter(filter.key)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${quickFilter === filter.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }
              `}
            >
              {filter.label}
              <span className="ml-2 text-xs opacity-70">({filter.count})</span>
            </button>
          ))}
        </div>
        <div className="text-sm text-muted-foreground">
          Showing {filtered.length} of {items.length} notifications
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications by ID, title, or content..."
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant={showAdvancedFilters ? "default" : "outline"}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Advanced Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                Active
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters} className="text-muted-foreground">
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-muted/20 rounded-lg border">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="unread">Unread Only</SelectItem>
                  <SelectItem value="read">Read Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                  <SelectItem value="Submission">Submission</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Completion">Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Timeframe</label>
              <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as any)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Critical Alerts Section */}
      {criticalAlerts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Critical Alerts Requiring Immediate Action
          </h2>
          {criticalAlerts.map((n) => {
            const IconComponent = TYPE_ICONS[n.type as keyof typeof TYPE_ICONS] || MessageSquare;
            return (
              <Card key={n.id} className="border-destructive/20 bg-destructive/5">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <IconComponent className="h-5 w-5 text-destructive" />
                        <Badge className={`text-xs ${PRIORITY_COLORS[n.priority || "normal"]}`}>
                          {n.priority?.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {n.type}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{n.title}</h3>
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {n.body}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="text-xs text-muted-foreground">{n.time}</div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => window.alert("Review \"" + n.id + "\"")}>
                          Review Now
                        </Button>
                        <Button size="sm" variant="outline">
                          Delegate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </section>
      )}

      {/* Main Notifications Feed */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">All Notifications</h2>
        
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No notifications match your current filters</p>
            <p className="text-sm">Try adjusting your search criteria or clearing filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => {
              const IconComponent = TYPE_ICONS[notification.type as keyof typeof TYPE_ICONS] || MessageSquare;
              return (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 hover:shadow-md ${
                    notification.unread ? "border-primary/20 bg-primary/5" : "border-border"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <IconComponent className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-foreground pr-2">{notification.title}</h3>
                          <Badge className={`text-xs ${PRIORITY_COLORS[notification.priority || "normal"]}`}>
                            {notification.priority?.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          {notification.unread && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-pre-line mb-3">
                          {notification.body}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                          <div className="flex gap-2">
                            {notification.unread && (
                              <Button size="sm" variant="ghost" onClick={() => markRead(notification.id)}>
                                Mark Read
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}