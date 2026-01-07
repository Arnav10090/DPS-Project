import { useEffect, useMemo, useState } from "react";

interface AlertItem {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  time: string;
}

function generateMockAlerts(): AlertItem[] {
  const base: AlertItem[] = [
    {
      id: Math.random().toString(36).slice(2),
      message: "Permit PTW-1023 awaiting approval beyond SLA",
      severity: "warning",
      time: new Date().toLocaleTimeString(),
    },
    {
      id: Math.random().toString(36).slice(2),
      message: "Safety observation raised for Contractor X",
      severity: "error",
      time: new Date().toLocaleTimeString(),
    },
    {
      id: Math.random().toString(36).slice(2),
      message: "System health nominal",
      severity: "info",
      time: new Date().toLocaleTimeString(),
    },
  ];
  return base;
}

export default function FooterAlerts() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>(() => generateMockAlerts());

  useEffect(() => {
    const id = setInterval(() => {
      setAlerts((prev) => {
        const next = generateMockAlerts();
        const merged = [...next, ...prev].slice(0, 10);
        return merged;
      });
    }, 30000);
    return () => clearInterval(id);
  }, []);

  const latestTop = useMemo(() => alerts[0], [alerts]);

  return (
    <div className="w-full bg-[#fff3cd] border-t">
      <div className="w-full px-4 py-2">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 text-left"
          aria-expanded={open}
          aria-controls="alerts-panel"
        >
          <div className="flex items-center gap-3">
            <span className="h-4 w-1.5 bg-[#ff9800] rounded" />
            <span className="font-medium">
              System & Solutions related Alarms message at bottom, which can be
              extend for S/E rows. Top side latest alarms
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {open ? "Collapse" : "Expand"}
          </span>
        </button>
        <div
          id="alerts-panel"
          className={`grid transition-all ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <ul className="mt-2 divide-y">
              {alerts.map((a) => (
                <li
                  key={a.id}
                  className="py-2 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        a.severity === "error"
                          ? "bg-brand-error"
                          : a.severity === "warning"
                            ? "bg-brand-warning"
                            : "bg-[hsl(207_75%_47%)]"
                      }`}
                      aria-label={a.severity}
                    />
                    <span>{a.message}</span>
                  </div>
                  <span className="text-gray-500">{a.time}</span>
                </li>
              ))}
            </ul>
            {latestTop ? (
              <div className="mt-2 text-xs text-gray-600">
                Latest: {latestTop.message}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
