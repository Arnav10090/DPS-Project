import React, { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ROLE_META, type Role } from "@/lib/roles";
import { User } from "lucide-react";

// Helper function to get role display info
const getRoleInfo = (role: string | null) => {
  if (!role || !(role in ROLE_META)) {
    return {
      color: "bg-gray-400",
      label: "Guest",
      textColor: "text-gray-700",
    };
  }

  const roleMeta = ROLE_META[role as Role];
  return {
    color: roleMeta.color,
    label: roleMeta.label,
    textColor: "text-gray-700", // Default text color, can be adjusted if needed
  };
};

export default function Header() {
  const today = useMemo(() => new Date().toLocaleDateString(), []);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get the user role from localStorage when the component mounts
    const role = localStorage.getItem("dps_role");
    setUserRole(role);
  }, []);

  const roleInfo = getRoleInfo(userRole);

  const onLogout = () => {
    // clear any client-side auth tokens here if present
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="w-full px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <input
            aria-label="Customer name or logo"
            placeholder="Customer / Logo"
            className="h-10 w-48 rounded-input border border-[hsl(4_90%_58%)] px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(207_75%_47%)]"
          />
        </div>
        <h1 className="text-center text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
          <p>Digital Permit System (DPS)</p>
        </h1>
        <div className="flex items-center gap-4 min-w-[280px] justify-end">
          <span className="text-sm text-gray-600" aria-label="Current date">
            {today}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-full inline-block"
                style={{ backgroundColor: roleInfo.color }}
                title={roleInfo.label}
                aria-label={`User role: ${roleInfo.label}`}
              />
              <span className={`text-xs font-medium ${roleInfo.textColor}`}>
                {roleInfo.label}
              </span>
            </div>
            <div className="h-5 w-px bg-gray-300 mx-1" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white cursor-pointer hover:shadow-md transition-shadow" title="User Profile" aria-label="User Profile">
                <User className="h-4 w-4" />
              </div>
            </div>
            <div className="h-5 w-px bg-gray-300 mx-1" />
            <div className="flex items-center gap-2" aria-label="Hitachi logo">
              <span className="text-xs uppercase tracking-widest font-bold text-gray-900">
                Hitachi
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            aria-label="Logout"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
