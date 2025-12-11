import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  Clock, 
  Users, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Filter, 
  X, 
  Settings,
  Bell,
  Shield,
  FileText,
  CheckCircle2,
  XCircle,
  Zap,
  HardHat
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string;
  priority?: "critical" | "high" | "normal";
  unread?: boolean;
};

const INITIAL: Notification[] = [
  { id: "EP-2024-001", type: "Emergency", title: "URGENT: Emergency Permit EP-2024-001 requires immediate approval", body: "Work Type: Hot Work - Welding Operations\nLocation: Plant Floor - Section B\nSubmitted: 15 minutes ago by John Smith\nEstimated Start: In 2 hours\nAction Required: Review and approve within 30 minutes", time: "15 minutes ago", priority: "critical", unread: true },
  { id: "WP-2024-156", type: "Overdue", title: "OVERDUE: Permit WP-2024-156 pending approval for 2 days", body: "Work Type: Electrical Maintenance\nRequester: Sarah Johnson - Maintenance Dept.\nExpected Approval: 2 days ago\nRisk Level: Medium", time: "2 days ago", priority: "high", unread: true },
  { id: "WP-2024-160", type: "Submission", title: "New Permit Submission: WP-2024-160", body: "Permit WP-2024-160 - Confined Space Entry\nSubmitted by: Mike Chen (Operations)\nPriority: High\nDocuments Attached: 3 files", time: "2 hours ago", priority: "normal", unread: true },
  { id: "WP-2024-158", type: "Safety", title: "Safety Review Complete: WP-2024-158", body: "Safety Officer Dr. Lisa Park has approved with conditions\nAdditional Requirements: PPE mandatory, Air monitoring every 30 minutes", time: "1 hour ago", priority: "normal", unread: false },
  { id: "WP-2024-142", type: "Completion", title: "Work Completion Submitted: WP-2024-142", body: "Requester: Jennifer Lee has submitted completion\nWork Duration: 6 hours\nCompletion Photos: 8 images uploaded", time: "30 minutes ago", priority: "normal", unread: true },
];

const QUICK_FILTERS = [
  { key: "all", label: "All Notifications", icon: Bell },
  { key: "unread", label: "Unread", icon: MessageSquare },
  { key: "critical", label: "Critical Safety", icon: ShieldAlert },
  { key: "today", label: "Today", icon: Clock },
];

const TYPE_CONFIGS = {
  Emergency: { icon: ShieldAlert, color: "bg-red-100 text-red-800 border-red-300", bgColor: "bg-red-50" },
  Overdue: { icon: Clock, color: "bg-orange-100 text-orange-800 border-orange-300", bgColor: "bg-orange-50" },
  Submission: { icon: FileText, color: "bg-blue-100 text-blue-800 border-blue-300", bgColor: "bg-blue-50" },
  Safety: { icon: Shield, color: "bg-green-100 text-green-800 border-green-300", bgColor: "bg-green-50" },
  Completion: { icon: CheckCircle2, color: "bg-purple-100 text-purple-800 border-purple-300", bgColor: "bg-purple-50" },
};

const PRIORITY_CONFIGS = {
  critical: { 
    color: "bg-red-100 text-red-900 border-red-300", 
    label: "CRITICAL",
    pulse: true 
  },
  high: { 
    color: "bg-orange-100 text-orange-900 border-orange-300", 
    label: "HIGH",
    pulse: false 
  },
  normal: { 
    color: "bg-blue-100 text-blue-900 border-blue-300", 
    label: "NORMAL",
    pulse: false 
  },
};

export default function SafetyAlarms() {
  const [items, setItems] = useState<Notification[]>(INITIAL);
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
  const emergencyAlerts = items.filter((i) => i.type === "Emergency");

  return (
    <div className="space-y-6">
      {/* Header with Safety Theme */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <HardHat className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Safety Alert Center</h1>
              <p className="text-sm text-muted-foreground">Monitor and manage safety notifications</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
              {unreadCount} Unread
            </Badge>
            {criticalCount > 0 && (
              <Badge className="bg-red-100 text-red-800 border-red-300 animate-pulse">
                <ShieldAlert className="h-3 w-3 mr-1" />
                {criticalCount} Critical
              </Badge>
            )}
            {emergencyAlerts.length > 0 && (
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {emergencyAlerts.length} Emergency
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Filter Navigation */}
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-1 border">
        <div className="flex gap-1">
          {quickFiltersWithCounts.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.key}
                onClick={() => setQuickFilter(filter.key)}
                className={`
                  px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${quickFilter === filter.key
                    ? "bg-white text-foreground shadow-sm border"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                  }
                `}
              >
                <IconComponent className="h-4 w-4" />
                {filter.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  quickFilter === filter.key ? "bg-muted" : "bg-background/50"
                }`}>
                  {filter.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="text-sm text-muted-foreground pr-2">
          <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{items.length}</span> notifications
        </div>
      </div>

      {/* Search and Advanced Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search safety notifications, permits, or personnel..."
              className="pl-9 border-orange-200 focus:border-orange-400 focus:ring-orange-200"
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
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs bg-orange-100 text-orange-800">
                Active
              </Badge>
            )}
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearAllFilters} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <Card className="border-orange-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Read Status</label>
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
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Safety Priority</label>
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
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Alert Type</label>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Emergency">Emergency</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                      <SelectItem value="Submission">New Submission</SelectItem>
                      <SelectItem value="Safety">Safety Review</SelectItem>
                      <SelectItem value="Completion">Work Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Time Period</label>
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Critical Safety Alerts */}
      {criticalAlerts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">
              Critical Safety Alerts - Immediate Action Required
            </h2>
          </div>
          {criticalAlerts.map((alert) => {
            const typeConfig = TYPE_CONFIGS[alert.type as keyof typeof TYPE_CONFIGS];
            const priorityConfig = PRIORITY_CONFIGS[alert.priority || "normal"];
            const IconComponent = typeConfig?.icon || AlertTriangle;
            
            return (
              <Card key={alert.id} className="border-red-300 bg-gradient-to-r from-red-50 to-orange-50 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${typeConfig?.bgColor || "bg-red-50"}`}>
                          <IconComponent className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs font-medium ${priorityConfig.color} ${
                            priorityConfig.pulse ? "animate-pulse" : ""
                          }`}>
                            {priorityConfig.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            {alert.id}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 text-base">{alert.title}</h3>
                      <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                        {alert.body}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-xs text-muted-foreground font-medium">{alert.time}</div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">
                          <ShieldAlert className="h-4 w-4 mr-1" />
                          Review Now
                        </Button>
                        <Button size="sm" variant="outline">
                          <Users className="h-4 w-4 mr-1" />
                          Delegate
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}

      {/* Main Notifications Feed */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">All Safety Notifications</h2>
        </div>
        
        {filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-12">
              <div className="mx-auto mb-4 p-3 bg-muted/20 rounded-full w-fit">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No notifications match your filters</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search criteria or clearing active filters
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((notification) => {
              const typeConfig = TYPE_CONFIGS[notification.type as keyof typeof TYPE_CONFIGS];
              const priorityConfig = PRIORITY_CONFIGS[notification.priority || "normal"];
              const IconComponent = typeConfig?.icon || MessageSquare;
              
              return (
                <Card 
                  key={notification.id} 
                  className={`transition-all duration-200 hover:shadow-md cursor-pointer ${
                    notification.unread 
                      ? "border-orange-200 bg-gradient-to-r from-orange-50/50 to-transparent" 
                      : "border-border hover:border-orange-200"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg shrink-0 ${typeConfig?.bgColor || "bg-muted/20"}`}>
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3 className="font-medium text-foreground">{notification.title}</h3>
                          <Badge className={`text-xs ${priorityConfig.color}`}>
                            {priorityConfig.label}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {notification.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-muted-foreground">
                            {notification.id}
                          </Badge>
                          {notification.unread && (
                            <Badge className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                              New
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground whitespace-pre-line mb-4 leading-relaxed">
                          {notification.body}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {notification.time}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {notification.unread && (
                              <Button size="sm" variant="ghost" onClick={() => markRead(notification.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Read
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
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