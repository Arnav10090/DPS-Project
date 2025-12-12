import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  HardHat,
  Settings,
  Check,
  AlertTriangle,
  Square,
} from "lucide-react";

type RoleKey = "Requester" | "Approver" | "Safety Officer" | "Administrator";

type PermissionState = "none" | "conditional" | "full";

type Permission = {
  id: string;
  label: string;
  description?: string;
  category: string;
};

const CATEGORIES: { id: string; label: string; permissions: Permission[] }[] = [
  {
    id: "permit",
    label: "Permit Management",
    permissions: [
      { id: "create_permit", label: "Create new permits", category: "permit" },
      {
        id: "edit_own",
        label: "Edit own permits (before approval)",
        category: "permit",
      },
      {
        id: "edit_any",
        label: "Edit any permit (admin override)",
        category: "permit",
      },
      {
        id: "delete_draft",
        label: "Delete permits (draft only)",
        category: "permit",
      },
      {
        id: "delete_any",
        label: "Delete any permit (admin)",
        category: "permit",
      },
      { id: "view_all", label: "View all permits", category: "permit" },
      {
        id: "view_department",
        label: "View department permits only",
        category: "permit",
      },
      { id: "export_permits", label: "Export permit data", category: "permit" },
    ],
  },
  {
    id: "approval",
    label: "Approval & Review",
    permissions: [
      { id: "approve", label: "Approve work requests", category: "approval" },
      { id: "reject", label: "Reject work requests", category: "approval" },
      {
        id: "send_back",
        label: "Send permits back for correction",
        category: "approval",
      },
      {
        id: "override_safety",
        label: "Override safety approvals",
        category: "approval",
      },
      {
        id: "bulk_approve",
        label: "Bulk approve permits",
        category: "approval",
      },
      {
        id: "emergency_bypass",
        label: "Emergency approval bypass",
        category: "approval",
      },
      {
        id: "approve_closure",
        label: "Approve permit closures",
        category: "approval",
      },
      {
        id: "digital_signature",
        label: "Digital signature authority",
        category: "approval",
      },
    ],
  },
  {
    id: "user",
    label: "User & Role Management",
    permissions: [
      { id: "create_user", label: "Create user accounts", category: "user" },
      { id: "edit_user", label: "Edit user profiles", category: "user" },
      { id: "deactivate_user", label: "Deactivate users", category: "user" },
      { id: "reset_password", label: "Reset user passwords", category: "user" },
      { id: "assign_roles", label: "Assign roles to users", category: "user" },
      { id: "create_roles", label: "Create custom roles", category: "user" },
      {
        id: "modify_role_perms",
        label: "Modify role permissions",
        category: "user",
      },
      {
        id: "view_activity",
        label: "View user activity logs",
        category: "user",
      },
    ],
  },
  {
    id: "system",
    label: "System Configuration",
    permissions: [
      {
        id: "modify_system",
        label: "Modify system settings",
        category: "system",
      },
      {
        id: "configure_notifications",
        label: "Configure notification templates",
        category: "system",
      },
      {
        id: "manage_departments",
        label: "Manage department structures",
        category: "system",
      },
      {
        id: "customize_templates",
        label: "Customize permit templates",
        category: "system",
      },
      {
        id: "configure_workflows",
        label: "Configure workflow rules",
        category: "system",
      },
      { id: "access_audit", label: "Access audit trail", category: "system" },
      {
        id: "system_reports",
        label: "Generate system reports",
        category: "system",
      },
      {
        id: "backup_restore",
        label: "Backup/restore data",
        category: "system",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety & Compliance",
    permissions: [
      {
        id: "override_checks",
        label: "Override safety checks",
        category: "safety",
      },
      {
        id: "access_safety_reports",
        label: "Access safety reports",
        category: "safety",
      },
      {
        id: "configure_rules",
        label: "Configure safety rules",
        category: "safety",
      },
      {
        id: "emergency_access",
        label: "Emergency system access",
        category: "safety",
      },
      {
        id: "compliance_audit",
        label: "Compliance audit access",
        category: "safety",
      },
      {
        id: "historical_data",
        label: "Historical data access",
        category: "safety",
      },
      {
        id: "archive_permits",
        label: "Archive old permits",
        category: "safety",
      },
      {
        id: "export_compliance",
        label: "Export compliance reports",
        category: "safety",
      },
    ],
  },
  {
    id: "notify",
    label: "Notification & Communication",
    permissions: [
      {
        id: "send_notifications",
        label: "Send system notifications",
        category: "notify",
      },
      {
        id: "configure_alerts",
        label: "Configure alert rules",
        category: "notify",
      },
      { id: "access_sms", label: "Access SMS settings", category: "notify" },
      {
        id: "access_email",
        label: "Email notification setup",
        category: "notify",
      },
      {
        id: "dashboard_alerts",
        label: "Dashboard alert management",
        category: "notify",
      },
      {
        id: "emergency_broadcast",
        label: "Emergency broadcast",
        category: "notify",
      },
      {
        id: "user_comm_logs",
        label: "User communication logs",
        category: "notify",
      },
    ],
  },
];

const defaultRoles: {
  key: RoleKey;
  color: string;
  users: number;
  description: string;
  icon: any;
}[] = [
  {
    key: "Requester",
    color: "#4285F4",
    users: 23,
    description:
      "Initiates work clearance requests and submits completion status",
    icon: Users,
  },
  {
    key: "Approver",
    color: "#34A853",
    users: 12,
    description: "Reviews, approves requests and validates work completion",
    icon: ShieldCheck,
  },
  {
    key: "Safety Officer",
    color: "#FF9800",
    users: 6,
    description:
      "Ensures compliance and conducts safety checks before approval",
    icon: HardHat,
  },
  {
    key: "Administrator",
    color: "#9C27B0",
    users: 2,
    description:
      "Full system access including user management and configurations",
    icon: Settings,
  },
];

export default function AdminRoles() {
  const [roles] = useState(defaultRoles);
  const [search, setSearch] = useState("");
  const [activeRole, setActiveRole] = useState<RoleKey | null>("Administrator");
  const [showCreate, setShowCreate] = useState(false);
  const [matrix, setMatrix] = useState<
    Record<string, Record<RoleKey, PermissionState>>
  >(() => {
    const m: Record<string, Record<RoleKey, PermissionState>> = {};
    CATEGORIES.forEach((cat) => {
      cat.permissions.forEach((p) => {
        m[p.id] = {
          Requester: "none",
          Approver: "conditional",
          "Safety Officer": "none",
          Administrator: "full",
        };
      });
    });
    return m;
  });

  const allPermissions = useMemo(
    () => CATEGORIES.flatMap((c) => c.permissions),
    [],
  );

  const [editingRole, setEditingRole] = useState<RoleKey | null>(null);

  function openEditForRole(roleKey: RoleKey) {
    setActiveRole(roleKey);
    setEditingRole(roleKey);
  }

  function togglePermission(permissionId: string, role: RoleKey) {
    setMatrix((prev) => {
      const cur = prev[permissionId][role];
      const next: PermissionState =
        cur === "none"
          ? "conditional"
          : cur === "conditional"
            ? "full"
            : "none";
      return {
        ...prev,
        [permissionId]: { ...prev[permissionId], [role]: next },
      };
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
          <p className="text-sm text-muted-foreground">
            Define and manage roles, permissions, and role assignments across
            the Work Clearance System.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreate(true)}>Create New Role</Button>
          <Button variant="outline">Import Role Template</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search roles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 overflow-x-auto py-2">
              {roles
                .filter((r) =>
                  r.key.toLowerCase().includes(search.toLowerCase()),
                )
                .map((r) => {
                  const Icon = r.icon;
                  const active = activeRole === r.key;
                  return (
                    <div
                      key={r.key}
                      className={cn(
                        "min-w-[360px] flex-shrink-0 flex items-center justify-between gap-3 rounded-lg p-3 cursor-pointer",
                        active ? "ring-2 ring-offset-2" : "hover:bg-muted",
                      )}
                      role="button"
                      tabIndex={0}
                      onClick={() => openEditForRole(r.key)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openEditForRole(r.key);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          style={{ background: r.color }}
                          className="flex h-12 w-12 items-center justify-center rounded-md text-white"
                        >
                          <Icon />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{r.key}</div>
                            <div className="text-xs rounded-full bg-muted px-2 py-1 text-muted-foreground">
                              {r.users} active users
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {r.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForRole(r.key);
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          View Users
                        </Button>
                        <Button size="sm" variant="ghost">
                          Duplicate
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium">Permissions</div>
              <div className="text-sm text-muted-foreground">
                Role: <span className="font-semibold">{activeRole}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">
                Permission Matrix
              </div>
              <Switch />
            </div>
          </CardHeader>
          <CardContent>
            {/* Legend */}
            <div className="mb-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-md border bg-transparent">
                  <Square className="text-muted-foreground" size={14} />
                </div>
                <div className="text-sm text-muted-foreground">No access</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-md bg-orange-100">
                  <AlertTriangle className="text-orange-600" size={14} />
                </div>
                <div className="text-sm text-muted-foreground">
                  Conditional access
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 flex items-center justify-center rounded-md bg-green-100">
                  <Check className="text-green-600" size={14} />
                </div>
                <div className="text-sm text-muted-foreground">Full access</div>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto py-2">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="min-w-[420px] flex-shrink-0 rounded-md border bg-background p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium">{cat.label}</div>
                  </div>
                  <div className="space-y-2">
                    {cat.permissions.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-4 rounded-md px-2 py-2 hover:bg-muted/50"
                      >
                        <div>
                          <div className="font-medium">{p.label}</div>
                          {p.description && (
                            <div className="text-xs text-muted-foreground">
                              {p.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {(Object.keys(matrix[p.id]) as RoleKey[]).map(
                            (rk) => {
                              const state = matrix[p.id][rk];
                              return (
                                <button
                                  key={rk}
                                  onClick={() => togglePermission(p.id, rk)}
                                  className="h-8 w-8 flex items-center justify-center rounded-md border"
                                  title={`${rk}: ${state}`}
                                  aria-label={`${rk} permission`}
                                >
                                  {state === "full" ? (
                                    <Check
                                      className="text-green-600"
                                      size={16}
                                    />
                                  ) : state === "conditional" ? (
                                    <AlertTriangle
                                      className="text-orange-600"
                                      size={16}
                                    />
                                  ) : (
                                    <Square
                                      className="text-muted-foreground"
                                      size={16}
                                    />
                                  )}
                                </button>
                              );
                            },
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          <form className="grid gap-4">
            <Input placeholder="Role name" />
            <Input placeholder="Description" />
            <div className="flex items-center gap-3">
              <div className="text-sm">Role color</div>
              <input type="color" defaultValue="#4285F4" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingRole}
        onOpenChange={(open) => {
          if (!open) setEditingRole(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role - {editingRole}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="rounded-md border bg-background p-3">
                <div className="mb-2 font-medium">{cat.label}</div>
                <div className="space-y-2">
                  {cat.permissions.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-4 rounded-md px-2 py-2"
                    >
                      <div>
                        <div className="font-medium">{p.label}</div>
                        {p.description && (
                          <div className="text-xs text-muted-foreground">
                            {p.description}
                          </div>
                        )}
                      </div>
                      <div>
                        <select
                          value={
                            editingRole ? matrix[p.id][editingRole] : "none"
                          }
                          onChange={(e) => {
                            const v = e.target.value as PermissionState;
                            if (!editingRole) return;
                            setMatrix((prev) => ({
                              ...prev,
                              [p.id]: { ...prev[p.id], [editingRole]: v },
                            }));
                          }}
                          className="rounded-md border px-2 py-1"
                        >
                          <option value="none">No access</option>
                          <option value="conditional">Conditional</option>
                          <option value="full">Full access</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingRole(null)}>
                Cancel
              </Button>
              <Button onClick={() => setEditingRole(null)}>Save</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
