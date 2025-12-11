import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  title: string;
  count: number | string;
  Icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  to?: string;
}

export default function StatusCard({ title, count, Icon, accentClass, to }: Props) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  const onClick = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((r) => [...r, { id, x, y }]);
    setTimeout(() => setRipples((r) => r.filter((i) => i.id !== id)), 600);
    if (to) nav(to);
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick((e as unknown) as React.MouseEvent)}
      className="relative group select-none rounded-card bg-white shadow-card hover:shadow-cardHover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary active:scale-[0.98]"
      aria-label={`${title} - ${count}`}
    >
      <div className={`absolute inset-0 rounded-card bg-gradient-to-br ${accentClass} opacity-[0.06]`} />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
            <Icon className="h-5 w-5 text-gray-700" />
          </div>
        </div>
        <div className="mt-3 text-sm font-medium text-gray-500">{title}</div>
        <div className="mt-1 text-3xl font-bold text-gray-900">{count}</div>
      </div>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="pointer-events-none absolute h-4 w-4 rounded-full bg-gray-400/30 animate-ripple"
          style={{ left: r.x - 8, top: r.y - 8 }}
        />
      ))}
      <div className="absolute inset-0 rounded-card ring-1 ring-black/5 group-hover:translate-y-[-4px] transition-transform" />
    </div>
  );
}
