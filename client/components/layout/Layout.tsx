import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavTabs from "./NavTabs";
import AlertTicker from "@/components/common/AlertTicker";
import FooterAlerts from "@/components/common/FooterAlerts";

export default function Layout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <NavTabs />
      <AlertTicker />
      <main className="flex-1 w-full overflow-hidden">
        <div className="w-full h-full px-4 py-4 pb-20 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <FooterAlerts />
      </div>
    </div>
  );
}
