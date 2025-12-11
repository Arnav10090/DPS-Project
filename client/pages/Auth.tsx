import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Role, ROLE_META } from "@/lib/roles";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function AuthPage() {
  const [role, setRole] = React.useState<Role>(() => {
    const rp = new URLSearchParams(window.location.search).get("role");
    return rp && (ROLE_META as any)[rp] ? (rp as Role) : "requester";
  });
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    // TEMP: disable email/password constraints for testing. Restore validation later.
    // if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    //   setError("Please enter a valid email address.");
    //   return;
    // }
    // if (!password || password.length < 6) {
    //   setError("Password must be at least 6 characters.");
    //   return;
    // }
    setLoading(true);
    // simulate request
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    // persist selected role so layout/components can conditionally render role-specific tabs
    try {
      localStorage.setItem("dps_role", role);
    } catch (e) {
      // ignore storage errors
    }
    // on success redirect to main dashboard
    navigate("/");
  };

  const getUserNameByRole = (role: Role): string => {
    const names = {
      requester: "A. Sharma",
      approver: "V. Rao",
      safety: "S. Officer",
      admin: "Admin User",
    };
    return names[role] || "Unknown User";
  };

  const getDepartmentByRole = (role: Role): string => {
    const departments = {
      requester: "Maintenance",
      approver: "Operations",
      safety: "Safety Department",
      admin: "IT Administration",
    };
    return departments[role] || "General";
  };

  const primaryColor = ROLE_META[role].color;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white to-slate-50">
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
          {/* Branding side */}
          <div className="hidden md:flex flex-col items-start justify-center p-10 bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center gap-3 mb-6">
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: primaryColor,
                  borderRadius: 8,
                }}
              />
              <div>
                <div className="text-2xl font-semibold">
                  <p>Digital Permit System (DPS)</p>
                </div>
                <div className="text-sm text-gray-500">
                  Secure access to permits and approvals
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Welcome back. Select your role and sign in to continue to your
              dashboard.
            </div>
            <div
              className="mt-6 p-4 rounded border"
              style={{
                borderColor: primaryColor,
                background: `${primaryColor}10`,
              }}
            >
              <div className="text-sm font-medium text-slate-700">
                Current Role
              </div>
              <div className="text-sm" style={{ color: primaryColor }}>
                {ROLE_META[role].label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {ROLE_META[role].desc}
              </div>
            </div>
          </div>

          {/* Form side */}
          <div className="p-6 md:p-10">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold">
                    <p>Digital Permit System (DPS) - Login</p>
                  </h1>
                  <p className="text-sm text-gray-500">
                    Sign in to your account
                  </p>
                </div>
                {/* simple role color indicator */}
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: primaryColor }}
                  />
                  <div className="text-xs text-gray-500">
                    {ROLE_META[role].label}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                {/* Mobile: role dropdown */}
                <div className="lg:hidden">
                  <Label className="text-sm mb-1 block">Role</Label>
                  <Select
                    value={role}
                    onValueChange={(v) => setRole(v as Role)}
                  >
                    <SelectTrigger aria-label="Select role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="requester">Requester</SelectItem>
                      <SelectItem value="approver">Approver</SelectItem>
                      <SelectItem value="safety">Safety Officer</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Desktop: role tabs */}
                <div className="hidden lg:block">
                  <Tabs
                    defaultValue={role}
                    onValueChange={(v) => setRole(v as Role)}
                  >
                    <TabsList>
                      <TabsTrigger value="requester" className="px-3">
                        Requester
                      </TabsTrigger>
                      <TabsTrigger value="approver" className="px-3">
                        Approver
                      </TabsTrigger>
                      <TabsTrigger value="safety" className="px-3">
                        Safety Officer
                      </TabsTrigger>
                      <TabsTrigger value="admin" className="px-3">
                        Administrator
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <form onSubmit={onSubmit} aria-label="Login form">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      aria-label="Email"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Password</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        aria-label="Password"
                      />
                      <button
                        type="button"
                        className="text-sm text-gray-500"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={remember}
                          onCheckedChange={(v) => setRemember(!!v)}
                        />
                        <div className="text-sm">Remember me</div>
                      </div>
                      <Link
                        to={`/forgot?role=${role}`}
                        className="text-sm text-primary underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                  </div>

                  {error && <div className="text-sm text-red-600">{error}</div>}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full"
                      style={{
                        background: primaryColor,
                        borderColor: primaryColor,
                      }}
                      disabled={loading}
                    >
                      {loading
                        ? "Signing in..."
                        : `Login as ${ROLE_META[role].label}`}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="hidden">
                      New here?{" "}
                      <Link to="/signup" className="text-primary underline">
                        Sign up
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500">
                      Not the right role? Switch above
                    </div>
                  </div>
                </div>
              </form>

              <div className="mt-6 text-xs text-gray-400">
                By signing in you agree to the Terms & Conditions and Privacy
                Policy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
