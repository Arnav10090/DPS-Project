import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ROLE_META } from "@/lib/roles";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const roleParam = (params.get("role") ||
    "requester") as keyof typeof ROLE_META;
  const role = Object.prototype.hasOwnProperty.call(ROLE_META, roleParam)
    ? roleParam
    : ("requester" as keyof typeof ROLE_META);
  const primaryColor = ROLE_META[role].color;
  const roleLabel = ROLE_META[role].label;

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    toast.success("Password reset link sent. Check your email.");
    navigate(`/auth?role=${role}`);
  };

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
                <div className="text-sm text-gray-500">Password recovery</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Enter your email and we'll send you a secure link to reset your
              password.
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
                {roleLabel}
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
                  <h1 className="text-xl font-bold">Forgot password</h1>
                  <p className="text-sm text-gray-500">
                    We'll send you reset instructions
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ background: primaryColor }}
                  />
                  <div className="text-xs text-gray-500">{roleLabel}</div>
                </div>
              </div>

              <form onSubmit={onSubmit} aria-label="Forgot password form">
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
                      {loading ? "Sending link..." : "Send reset link"}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Link
                      to={`/auth?role=${role}`}
                      className="text-primary underline"
                    >
                      Back to login
                    </Link>
                    <Link
                     to={`/signup?role=${role}`}
                      className="text-primary underline"
                    >
                      Create account
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
