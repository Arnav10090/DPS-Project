<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.1-646CFF?style=for-the-badge&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express" alt="Express">
</p>

<h1 align="center">🛡️ Digital Permit System (DPS)</h1>

<p align="center">
  <strong>A comprehensive, role-based digital permit management system for industrial safety and work authorization workflows.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-user-roles">Roles</a> •
  <a href="#-api-endpoints">API</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## 📋 Overview

The **Digital Permit System (DPS)** is a modern, full-stack web application designed to digitize and streamline industrial work permit processes. It replaces traditional paper-based permit systems with an efficient, trackable, and audit-ready digital solution.

The system supports multiple user roles with customized dashboards, real-time notifications, and comprehensive approval workflows for various permit types including High-Tension (HT) work permits and Gas permits.

---

## ✨ Features

### 🎯 Core Functionality
| Feature | Description |
|---------|-------------|
| **Multi-Role Dashboard** | Customized views for Requesters, Approvers, Safety Officers, and Administrators |
| **Permit Lifecycle Management** | Complete tracking from request → approval → work closure |
| **Dynamic Form Builder** | Create and customize permit forms on-the-fly |
| **Real-time Notifications** | Email alerts for permit status changes |
| **Work Closure Flow** | Structured process for completing and closing permits |
| **Analytics & Charts** | Visual insights with contractor statistics and KPIs |

### 🔐 Security & Compliance
- **Role-Based Access Control (RBAC)** - Granular permissions for different user types
- **Audit Trail** - Complete history of all permit activities
- **Multi-Level Approval** - Sequential approval from Approvers and Safety Officers
- **Hold & Return Mechanisms** - Ability to hold permits or return for corrections

### 📊 Dashboard Widgets
- Status Cards with real-time counters
- Contractor Statistics Charts
- Contractor KPI Analytics
- User Activity Monitoring (Admin)
- Security Alerts Tracking

---

## 🛠️ Tech Stack

### Frontend
```
├── React 18          # UI Library with Hooks
├── TypeScript        # Type-safe development
├── Vite 7            # Lightning-fast build tool
├── TailwindCSS 3     # Utility-first CSS
├── Radix UI          # Accessible component primitives
├── React Router 6    # Client-side routing
├── TanStack Query    # Server state management
├── Recharts          # Data visualization
├── Framer Motion     # Smooth animations
└── React Three Fiber # 3D graphics support
```

### Backend
```
├── Express 5         # Web framework
├── Node.js           # Runtime environment
├── Nodemailer        # Email notifications
├── Zod               # Schema validation
└── XLSX              # Excel file handling
```

### Development Tools
```
├── pnpm              # Fast, disk-efficient package manager
├── Prettier          # Code formatting
├── Vitest            # Unit testing
└── SWC               # Fast TypeScript/JavaScript compilation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **pnpm** >= 10.x (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Arnav10090/DPS-Project.git
   cd DPS-Project
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your email configuration:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@dps.local
   ```

4. **Start development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

---

## 📁 Project Structure

```
DPS_System/
├── 📂 client/                  # Frontend application
│   ├── 📂 components/          # Reusable UI components
│   │   ├── 📂 charts/          # Chart components (Recharts)
│   │   ├── 📂 common/          # Shared components
│   │   ├── 📂 layout/          # Layout components
│   │   ├── 📂 permit/          # Permit-specific components
│   │   └── 📂 ui/              # shadcn/ui components
│   ├── 📂 hooks/               # Custom React hooks
│   ├── 📂 lib/                 # Utility functions
│   ├── 📂 pages/               # Page components
│   ├── App.tsx                 # Main application entry
│   └── global.css              # Global styles
│
├── 📂 server/                  # Backend application
│   ├── 📂 lib/                 # Server utilities
│   ├── 📂 routes/              # API route handlers
│   ├── index.ts                # Express server setup
│   └── node-build.ts           # Production build entry
│
├── 📂 shared/                  # Shared types and utilities
├── 📂 public/                  # Static assets
├── 📂 netlify/                 # Netlify serverless functions
│
├── vite.config.ts              # Vite frontend configuration
├── vite.config.server.ts       # Vite server configuration
├── tailwind.config.ts          # TailwindCSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

---

## 👥 User Roles

| Role | Description | Key Capabilities |
|------|-------------|------------------|
| **🔵 Requester** | Work permit initiators | Create permits, track status, request work closure |
| **🟢 Approver** | Department approvers | Review & approve permits, return for corrections, place holds |
| **🟡 Safety Officer** | Safety compliance officers | Final safety approval, reject unsafe permits |
| **🔴 Administrator** | System administrators | Manage users, roles, permissions, view analytics |
| **⚪ Contractor** | External contractors | View assigned permits, submit completion reports |

### Role-Specific Dashboards

<details>
<summary><strong>🔵 Requester Dashboard</strong></summary>

- Total Permits Overview
- Approved Permits Count
- Rejected Permits Count
- Permits Under Hold
- Personal Analytics Chart

</details>

<details>
<summary><strong>🟢 Approver Dashboard</strong></summary>

- New Permits Queue
- Approved/Pending/Returned Permits
- Permits Under Hold
- Rejected Permits
- Approval Statistics

</details>

<details>
<summary><strong>🔴 Administrator Dashboard</strong></summary>

- Total Users & New Users
- Active Roles & Permissions
- Security Alerts
- Currently Online Users
- Pending Actions & Permission Issues

</details>

---

## 📄 Available Pages

| Route | Description |
|-------|-------------|
| `/` | Dynamic dashboard (role-based) |
| `/auth` | Login page |
| `/signup` | Registration page |
| `/permit-details` | Permit detail view |
| `/ht-permit` | High-Tension permit form |
| `/gas-permit` | Gas work permit form |
| `/approval-queue` | Approver's queue |
| `/safety-officer-approval-queue` | Safety officer's queue |
| `/work-closure-request` | Work completion request |
| `/work-closure-approval` | Closure approval workflow |
| `/users` | User management (Admin) |
| `/roles-permissions` | RBAC management (Admin) |
| `/form-builder` | Dynamic form creator |
| `/overall-status` | Permit analytics |
| `/contractor-performance` | KPI tracking |

---

## 📧 Email Notifications

The system supports automated email notifications via Nodemailer:

- **Permit Submitted** - Notify approvers of new permits
- **Permit Approved** - Notify requester of approval
- **Permit Returned** - Notify requester with correction feedback
- **Permit Rejected** - Notify requester with rejection reason
- **Work Closure Requested** - Notify stakeholders
- **Work Closure Approved** - Final completion notification

---

## 🔧 Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Build client only
pnpm build:client

# Build server only
pnpm build:server

# Start production server
pnpm start

# Run tests
pnpm test

# Format code
pnpm format.fix

# Type check
pnpm typecheck
```

---

## 🚢 Deployment

### Netlify (Recommended)

The project includes Netlify configuration for seamless deployment:

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist/spa`
3. Add environment variables in Netlify dashboard
4. Deploy!

### Docker

```dockerfile
# Build the image
docker build -t dps-system .

# Run the container
docker run -p 3000:3000 --env-file .env dps-system
```

### Manual Deployment

```bash
# Build the application
pnpm build

# Start the production server
pnpm start
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

**Project Link**: [https://github.com/Arnav10090/DPS-Project](https://github.com/Arnav10090/DPS-Project)

---

<p align="center">
  Made with ❤️ for Industrial Safety
</p>
