import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Forgot from "./pages/Forgot";
import Layout from "@/components/layout/Layout";
import RootRedirect from "@/components/common/RootRedirect";
import PermitDetails from "@/pages/PermitDetails";
import ApproverPermitDetails from "@/pages/ApproverPermitDetails";
import SafetyPermitDetails from "@/pages/SafetyPermitDetails";
import HTPermitForm from "@/pages/HTPermitForm";
import GasPermit from "./pages/GasPermit";
import WorkClosureRequest from "./pages/WorkClosureRequest";
import WorkClosureApproval from "./pages/WorkClosureApproval";
import ApprovalQueue from "./pages/ApprovalQueue";
import SafetyOfficerApprovalQueue from "./pages/SafetyOfficerApprovalQueue";
import ReviewPermits from "./pages/ReviewPermits";
import Users from "./pages/Users";
import RolesPermissions from "./pages/RolesPermissions";
import WorkClosureFlow from "./pages/WorkClosureFlow";
import FormBuilder from "./pages/FormBuilder";
import PermitsClosed from "./pages/Permits-closed";
import {
  Alarms,
  ContractorPerformance,
  OverallStatus,
  Spare,
  SystemArchitecture,
} from "@/pages/OtherPages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<RootRedirect />} />
            <Route path="permit-details" element={<PermitDetails />} />
            <Route
              path="approver-permit-details"
              element={<ApproverPermitDetails />}
            />
            <Route
              path="safety-permit-details"
              element={<SafetyPermitDetails />}
            />
            <Route path="users" element={<Users />} />
            <Route path="roles-permissions" element={<RolesPermissions />} />
            <Route path="work-closure-flow" element={<WorkClosureFlow />} />
            <Route path="form-builder" element={<FormBuilder />} />
            <Route
              path="work-closure-request"
              element={<WorkClosureRequest />}
            />
            <Route
              path="work-closure-approval"
              element={<WorkClosureApproval />}
            />
            <Route path="approval-queue" element={<ApprovalQueue />} />
            <Route
              path="safety-officer-approval-queue"
              element={<SafetyOfficerApprovalQueue />}
            />
            <Route path="review-permits" element={<ReviewPermits />} />
            <Route path="permits-closed" element={<PermitsClosed />} />
            <Route path="overall-status" element={<OverallStatus />} />
            <Route
              path="contractor-performance"
              element={<ContractorPerformance />}
            />
            <Route path="alarms" element={<Alarms />} />
            <Route
              path="system-architecture"
              element={<SystemArchitecture />}
            />
            <Route path="spare" element={<Spare />} />
            <Route path="ht-permit" element={<HTPermitForm />} />
            <Route path="gas-permit" element={<GasPermit />} />
          </Route>
          {/* Authentication route (standalone) */}
          <Route path="auth" element={<Auth />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot" element={<Forgot />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
