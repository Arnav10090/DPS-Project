import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { Role, ROLE_META } from "@/lib/roles";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export default function SignupPage() {
  const [role, setRole] = React.useState<Role>("requester");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [accept, setAccept] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const validate = () => {
    if (!name || name.trim().length < 2) {
      return "Please enter your full name.";
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return "Password must include letters and numbers.";
    }
    if (password !== confirm) {
      return "Passwords do not match.";
    }
    if (!accept) {
      return "You must accept the Terms and Privacy Policy.";
    }
    return null;
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success("Account created successfully. Please sign in.");
    navigate("/auth");
  };

  const primaryColor = ROLE_META[role].color;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white to-slate-50">
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
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
                  Digital Permit Status
                </div>
                <div className="text-sm text-gray-500">Create your account</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Choose your role and sign up to access tailored dashboards and
              workflows.
            </div>
            <div
              className="mt-6 p-4 rounded border"
              style={{
                borderColor: primaryColor,
                background: `${primaryColor}10`,
              }}
            >
              <div className="text-sm font-medium text-slate-700">
                Selected Role
              </div>
              <div className="text-sm" style={{ color: primaryColor }}>
                {ROLE_META[role].label}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {ROLE_META[role].desc}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <div className="max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-xl font-bold">Create account</h1>
                  <p className="text-sm text-gray-500">
                    Sign up to get started
                  </p>
                </div>
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

              <form onSubmit={onSubmit} aria-label="Signup form">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Full name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Jane Cooper"
                      aria-label="Full name"
                    />
                  </div>

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
                        placeholder="Create a password"
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
                    <div className="mt-1 text-xs text-gray-500">
                      Use at least 8 characters with letters and numbers.
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">Confirm password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Re-enter your password"
                      aria-label="Confirm password"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={accept}
                        onCheckedChange={(v) => setAccept(!!v)}
                      />
                      <div className="text-sm">
                        I agree to the Terms & Privacy Policy
                      </div>
                    </div>
                    <Link
                      to={`/auth?role=${role}`}
                      className="text-sm text-primary underline"
                    >
                      Have an account? Login
                    </Link>
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
                        ? "Creating account..."
                        : `Sign up as ${ROLE_META[role].label}`}
                    </Button>
                  </div>
                </div>
              </form>

              <div className="mt-6 text-xs text-gray-400">
                By creating an account you agree to the Terms & Conditions and
                Privacy Policy.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
