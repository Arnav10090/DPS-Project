import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Server, Database, Lock, GitPullRequest } from "lucide-react";

type AdminNotif = {
  id: string;
  title: string;
  body: string;
  time: string;
  category?: string;
  unread?: boolean;
};

const INITIAL: AdminNotif[] = [
  { id: "SEC-001", title: "CRITICAL: Multiple Failed Login Attempts Detected", body: "User: contractor.smith@company.com\nFailed Attempts: 8 in last 15 minutes\nSource IP: 192.168.1.45", time: "5 minutes ago", category: "security", unread: true },
  { id: "PERF-DB-01", title: "PERFORMANCE WARNING: Database Response Time Degraded", body: "Current Response Time: 2.3s (Normal < 1s)\nAffected: Permit search, report generation", time: "15 minutes ago", category: "performance", unread: true },
  { id: "SYNC-01", title: "DATA SYNC ISSUE: Tablet Synchronization Failed", body: "Device: Tablet-Plant-Floor-03\nPending Transactions: 7 permit updates", time: "30 minutes ago", category: "data", unread: false },
  { id: "USER-REG-01", title: "New User Registration Pending: Amanda Rodriguez", body: "Role Requested: Approver\nDepartment: Environmental Safety", time: "2 hours ago", category: "user", unread: true },
];

export default function AdminAlarms() {
  const [items, setItems] = useState<AdminNotif[]>(INITIAL);
  const [filter, setFilter] = useState<string>("all");

  const unreadCount = items.filter((i) => i.unread).length;

  const markAllRead = () => setItems((s) => s.map((i) => ({ ...i, unread: false })));
  const markRead = (id: string) => setItems((s) => s.map((i) => (i.id === id ? { ...i, unread: false } : i)));

  const filtered = items.filter((i) => (filter === "all" ? true : i.category === filter));

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-semibold">System Notifications &amp; Alerts</h1>
          <Badge variant="default">{unreadCount} Unread</Badge>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border px-3 py-2 text-sm">
            <option value="all">All</option>
            <option value="system">System</option>
            <option value="user">Users</option>
            <option value="security">Security</option>
            <option value="performance">Performance</option>
            <option value="today">Today</option>
          </select>
          <Button variant="outline" onClick={markAllRead}>Mark All as Read</Button>
          <Button variant="ghost">Export Notifications</Button>
        </div>
      </div>

      {/* Critical System Alerts */}
      <section className="mb-4">
        <div className="space-y-3">
          {items.filter((i) => i.category === "security" || i.category === "performance").map((it) => (
            <Card key={it.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="text-destructive" />
                      <div className="font-semibold">{it.title}</div>
                    </div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line mt-2">{it.body}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm text-muted-foreground">{it.time}</div>
                    <div className="flex gap-2">
                      <Button onClick={() => alert("Investigate " + it.id)}>Investigate</Button>
                      <Button variant="outline">Contact</Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Operational Notifications */}
      <section className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">Notifications</h2>
        </div>

        <div className="space-y-3">
          {filtered.map((n) => (
            <div key={n.id} className={`rounded-md border p-3 ${n.unread ? "bg-background" : "bg-card"}`}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{n.title}</div>
                    {n.unread && <span className="ml-2 inline-flex rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">Unread</span>}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">{n.body}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-xs text-muted-foreground">{n.time}</div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => markRead(n.id)}>Mark Read</Button>
                    <Button size="sm" variant="outline">Action</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
