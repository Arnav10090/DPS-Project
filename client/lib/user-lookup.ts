// Sample users data - in production, this would come from your backend/database
// For now, we're using the same data as client/pages/Users.tsx
export interface UserData {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  department: string;
  role: string;
  status: "active" | "inactive";
  lastLogin?: string;
}

export const SAMPLE_USERS: UserData[] = [
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
    name: "Emma Johnson",
    employeeId: "WCS-006",
    email: "emma.j@example.com",
    department: "Safety",
    role: "Safety Officer",
    status: "active",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
  {
    id: "7",
    name: "Michael Chen",
    employeeId: "WCS-007",
    email: "michael.chen@example.com",
    department: "Maintenance",
    role: "Requester",
    status: "active",
    lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
];

/**
 * Find a user by name (case-insensitive)
 * Returns the user if found, undefined otherwise
 */
export const findUserByName = (name: string): UserData | undefined => {
  if (!name || typeof name !== "string") return undefined;
  return SAMPLE_USERS.find(
    (u) => u.name.toLowerCase().trim() === name.toLowerCase().trim()
  );
};

/**
 * Get email address for a user by name
 * Returns the email if user is found and email is valid, undefined otherwise
 */
export const getEmailByName = (name: string): string | undefined => {
  const user = findUserByName(name);
  if (user && user.email && user.email.includes("@")) {
    return user.email;
  }
  return undefined;
};

/**
 * Get emails for multiple user names
 * Filters out any invalid or not found users
 */
export const getEmailsByNames = (names: (string | undefined)[]): string[] => {
  return names
    .map((name) => getEmailByName(name || ""))
    .filter((email): email is string => !!email);
};

/**
 * Get all users of a specific role
 */
export const getUsersByRole = (role: string): UserData[] => {
  return SAMPLE_USERS.filter(
    (u) => u.role.toLowerCase() === role.toLowerCase()
  );
};

/**
 * Get email addresses for all users of a specific role
 */
export const getEmailsByRole = (role: string): string[] => {
  return getUsersByRole(role)
    .map((u) => u.email)
    .filter((email) => email && email.includes("@"));
};
