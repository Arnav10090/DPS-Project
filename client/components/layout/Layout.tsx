import { Outlet } from "react-router-dom";
import Header from "./Header";
import NavTabs from "./NavTabs";
import AlertTicker from "@/components/common/AlertTicker";
import FooterAlerts from "@/components/common/FooterAlerts";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NavTabs />
      <AlertTicker />
      <main className="flex-1 pb-24">
        <div className="mx-auto max-w-[1400px] px-8 py-4">
          <Outlet />
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <FooterAlerts />
      </div>
    </div>
  );
}
