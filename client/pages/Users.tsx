import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import * as XLSX from "xlsx";

type User = {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive";
  lastLogin?: string;
};

const sampleUsers: User[] = [
  {
    id: "1",
    name: "Arnav Tiwari",
    employeeId: "WCS-001",
    email: "arnav.tiwari@example.com",
    department: "Operations",
    role: "Administrator",
    status: "active",
    lastLogin: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Maria Gonzalez",
    employeeId: "WCS-002",
    email: "maria.g@example.com",
    department: "Safety",
    role: "Safety Officer",
    status: "active",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "3",
    name: "John Doe",
    employeeId: "WCS-003",
    email: "john.doe@example.com",
    department: "Engineering",
    role: "Approver",
    status: "inactive",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    id: "4",
    name: "Alice Wong",
    employeeId: "WCS-004",
    email: "alice.w@example.com",
    department: "Operations",
    role: "Requester",
    status: "active",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "5",
    name: "David Park",
    employeeId: "WCS-005",
    email: "david.park@example.com",
    department: "Compliance",
    role: "Approver",
    status: "active",
    lastLogin: undefined,
  },
  {
    id: "6",
    name: "Sara Lee",
    employeeId: "WCS-006",
    email: "sara.lee@example.com",
    department: "Safety",
    role: "Requester",
    status: "inactive",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
];

type ImportedUser = {
  name: string;
  employeeId: string;
  email: string;
  phone?: string;
  gender?: string;
  department: string;
  role: string;
  status: "active" | "inactive";
  password: string;
};

type ImportResult = {
  success: boolean;
  row: number;
  data?: ImportedUser;
  error?: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState<string | null>(null);
  const [roles, setRoles] = useState<Record<string, boolean>>({
    Requester: true,
    Approver: true,
    "Safety Officer": true,
    Administrator: true,
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [importInProgress, setImportInProgress] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments = useMemo(
    () => Array.from(new Set(users.map((u) => u.department))),
    [users],
  );

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (query) {
        const q = query.toLowerCase();
        const matches = [u.name, u.employeeId, u.email, u.department, u.role]
          .join(" ")
          .toLowerCase();
        if (!matches.includes(q)) return false;
      }
      if (department && u.department !== department) return false;
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      const roleSelected = roles[u.role] ?? true;
      return roleSelected;
    });
  }, [users, query, department, roles, statusFilter]);

  const allSelected =
    filtered.length > 0 && filtered.every((u) => selected[u.id]);

  // Parse CSV content
  function parseCSV(text: string): string[][] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = "";
    let insideQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === "," && !insideQuotes) {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if ((char === "\n" || char === "\r") && !insideQuotes) {
        if (currentField || currentRow.length > 0) {
          currentRow.push(currentField.trim());
          if (currentRow.length > 1 || currentRow[0]) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = "";
        }
        if (char === "\r" && nextChar === "\n") {
          i++;
        }
      } else {
        currentField += char;
      }
    }

    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.length > 1 || currentRow[0]) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  // Validate and map CSV row to ImportedUser
  function validateRow(
    headers: string[],
    row: string[],
    rowIndex: number,
  ): ImportResult {
    try {
      // Find column indices by fuzzy matching
      const findColumnIndex = (target: string[]): number => {
        for (let i = 0; i < headers.length; i++) {
          const normalized = headers[i]
            .toLowerCase()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9]/g, "");
          for (const t of target) {
            if (normalized.includes(t) || t.includes(normalized)) {
              return i;
            }
          }
        }
        return -1;
      };

      // Find column indices with fuzzy matching
      const nameIdx = findColumnIndex(["fullname", "name"]);
      const employeeIdx = findColumnIndex(["employeeid", "id", "employee"]);
      const emailIdx = findColumnIndex(["email"]);
      const passwordIdx = findColumnIndex(["password", "pass"]);
      const phoneIdx = findColumnIndex(["phone"]);
      const genderIdx = findColumnIndex(["gender"]);
      const departmentIdx = findColumnIndex(["department", "dept"]);
      const roleIdx = findColumnIndex(["role"]);

      // Extract values safely
      const name = nameIdx >= 0 ? (row[nameIdx] || "").trim() : "";
      const employeeId =
        employeeIdx >= 0 ? (row[employeeIdx] || "").trim() : "";
      const email = emailIdx >= 0 ? (row[emailIdx] || "").trim() : "";
      const password =
        passwordIdx >= 0 && row[passwordIdx]
          ? (row[passwordIdx] || "").trim()
          : "DefaultPass123!";
      const phone = phoneIdx >= 0 ? (row[phoneIdx] || "").trim() : "";
      const gender = genderIdx >= 0 ? (row[genderIdx] || "").trim() : "";
      const department =
        departmentIdx >= 0 ? (row[departmentIdx] || "").trim() : "";
      const role = roleIdx >= 0 ? (row[roleIdx] || "").trim() : "";

      // Validation
      if (!name || name.length === 0)
        return {
          success: false,
          row: rowIndex,
          error: "Full Name is required",
        };
      if (!employeeId || employeeId.length === 0)
        return {
          success: false,
          row: rowIndex,
          error: "Employee ID is required",
        };
      if (!email || email.length === 0)
        return { success: false, row: rowIndex, error: "Email is required" };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { success: false, row: rowIndex, error: "Invalid email format" };
      if (!department || department.length === 0)
        return {
          success: false,
          row: rowIndex,
          error: "Department is required",
        };
      if (
        !role ||
        !["Requester", "Approver", "Safety Officer", "Administrator"].includes(
          role,
        )
      )
        return {
          success: false,
          row: rowIndex,
          error:
            "Invalid role. Must be: Requester, Approver, Safety Officer, or Administrator",
        };

      const status = "active";

      return {
        success: true,
        row: rowIndex,
        data: {
          name,
          employeeId,
          email,
          phone,
          gender,
          department,
          role,
          status,
          password,
        },
      };
    } catch (err) {
      return {
        success: false,
        row: rowIndex,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  // Handle file import
  async function handleFileImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportInProgress(true);
    setImportResults([]);

    try {
      const text = await file.text();
      const rows = parseCSV(text);

      if (rows.length < 2) {
        setImportResults([
          {
            success: false,
            row: 0,
            error: "File must contain headers and at least one data row",
          },
        ]);
        setImportInProgress(false);
        return;
      }

      const headers = rows[0];
      const results: ImportResult[] = [];
      const newUsers: User[] = [];

      // Validate all rows
      for (let i = 1; i < rows.length; i++) {
        const result = validateRow(headers, rows[i], i + 1);
        results.push(result);

        if (result.success && result.data) {
          const user: User = {
            id: `${users.length + newUsers.length + 1}`,
            name: result.data.name,
            employeeId: result.data.employeeId,
            email: result.data.email,
            department: result.data.department,
            role: result.data.role,
            status: result.data.status,
          };
          newUsers.push(user);
        }
      }

      // Add all valid users to the list
      if (newUsers.length > 0) {
        setUsers((prev) => [...prev, ...newUsers]);
      }

      setImportResults(results);
    } catch (err) {
      setImportResults([
        {
          success: false,
          row: 0,
          error: err instanceof Error ? err.message : "Failed to read file",
        },
      ]);
    } finally {
      setImportInProgress(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage system users, roles, and access for the Work Clearance
            System.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="hidden sm:inline-flex"
            onClick={() => setShowCreate(true)}
          >
            Add New User
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setImportResults([]);
              fileInputRef.current?.click();
            }}
          >
            Bulk Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileImport}
            className="hidden"
          />
          <Button variant="outline">Export User List</Button>
          <Button variant="ghost">User Activity Report</Button>
        </div>
      </header>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Input
              placeholder="Search users by name, email, or employee ID..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-[420px]"
            />
            <Select
              onValueChange={(v) => setDepartment(v === "all" ? null : v)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(v) => setStatusFilter(v || "all")}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">Role Filter</div>
            {Object.keys(roles).map((r) => (
              <label key={r} className="inline-flex items-center gap-2">
                <Checkbox
                  checked={roles[r]}
                  onCheckedChange={(v) =>
                    setRoles((s) => ({ ...s, [r]: Boolean(v) }))
                  }
                />
                <span className="text-sm">{r}</span>
              </label>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => {
                    const next: Record<string, boolean> = {};
                    filtered.forEach((u) => (next[u.id] = e.target.checked));
                    setSelected((s) => ({ ...s, ...next }));
                  }}
                />
                <span className="text-sm text-muted-foreground">
                  Select All
                </span>
              </label>
              <Select>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Bulk actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">Activate</SelectItem>
                  <SelectItem value="deactivate">Deactivate</SelectItem>
                  <SelectItem value="change-dept">Change Department</SelectItem>
                  <SelectItem value="export">Export Selected</SelectItem>
                  <SelectItem value="notify">Send Notifications</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Total Users: <span className="font-semibold">{users.length}</span>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>User</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="w-4">
                    <input
                      type="checkbox"
                      checked={!!selected[u.id]}
                      onChange={(e) =>
                        setSelected((s) => ({ ...s, [u.id]: e.target.checked }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-white">
                          {u.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{u.employeeId}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.department}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold ${u.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${u.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                      />
                      {u.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {u.lastLogin ? format(new Date(u.lastLogin), "PP p") : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        {u.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Full name" />
              <Input placeholder="Employee ID" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Email" />
              <Input type="password" placeholder="Password" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Phone" />
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Requester">Requester</SelectItem>
                  <SelectItem value="Approver">Approver</SelectItem>
                  <SelectItem value="Safety Officer">Safety Officer</SelectItem>
                  <SelectItem value="Administrator">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium">Account Active</div>
                <Switch defaultChecked />
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Profile Picture</div>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>NA</AvatarFallback>
                </Avatar>
                <Button variant="outline">Upload</Button>
              </div>
            </div>
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create User</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Results Modal */}
      <Dialog
        open={importResults.length > 0}
        onOpenChange={() => {
          if (!importInProgress) {
            setImportResults([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bulk Import Results</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-blue-50 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importResults.length}
                </div>
                <div className="text-xs text-blue-700">Total Rows</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResults.filter((r) => r.success).length}
                </div>
                <div className="text-xs text-green-700">Imported</div>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResults.filter((r) => !r.success).length}
                </div>
                <div className="text-xs text-red-700">Failed</div>
              </div>
            </div>

            <div className="max-h-80 space-y-2 overflow-y-auto">
              {importResults.map((result, idx) => (
                <div
                  key={idx}
                  className={`rounded-lg border p-3 text-sm ${
                    result.success
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
                >
                  <div className="font-medium">
                    Row {result.row}: {result.success ? "✓ Success" : "✗ Error"}
                  </div>
                  {result.success && result.data && (
                    <div className="mt-1 text-xs">
                      {result.data.name} ({result.data.email})
                    </div>
                  )}
                  {!result.success && result.error && (
                    <div className="mt-1 text-xs">{result.error}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
              <strong>Expected Excel/CSV Column Order:</strong>
              <div className="mt-1 font-mono text-xs">
                Full Name | Employee ID | Email | Password | Phone | Gender |
                Department | Role
              </div>
              <div className="mt-2">
                <strong>Required Fields:</strong>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>Full Name</li>
                  <li>Employee ID</li>
                  <li>Email (must be valid format)</li>
                  <li>Department</li>
                  <li>
                    Role (Requester, Approver, Safety Officer, or Administrator)
                  </li>
                </ul>
              </div>
              <div className="mt-2">
                <strong>Optional Fields:</strong>
                <ul className="mt-1 list-inside list-disc space-y-1">
                  <li>
                    Password (defaults to "DefaultPass123!" if left empty)
                  </li>
                  <li>Phone</li>
                  <li>Gender</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setImportResults([])}
              disabled={importInProgress}
            >
              Close
            </Button>
            {importResults.some((r) => r.success) && (
              <Button
                onClick={() => setImportResults([])}
                className="bg-green-600 hover:bg-green-700"
              >
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
