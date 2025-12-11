export type Role = "requester" | "approver" | "safety" | "admin";

export const ROLE_META: Record<
  Role,
  { label: string; color: string; desc: string; path: string }
> = {
  requester: {
    label: "Requester",
    color: "#3B82F6",
    desc: "Apply for permits and track requests",
    path: "/requester",
  },
  approver: {
    label: "Approver",
    color: "#10B981",
    desc: "Review and approve permit applications",
    path: "/approver",
  },
  safety: {
    label: "Safety Officer",
    color: "#F59E0B",
    desc: "Safety compliance and oversight",
    path: "/safety",
  },
  admin: {
    label: "Administrator",
    color: "#8B5CF6",
    desc: "System management and analytics",
    path: "/admin",
  },
};
