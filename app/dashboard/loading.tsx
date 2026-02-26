import { Lightbulb } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <Lightbulb
          className="h-12 w-12 animate-pulse text-violet-600 drop-shadow-[0_0_12px_rgba(124,58,237,0.5)]"
          strokeWidth={1.5}
        />
        <p className="text-sm font-medium text-slate-600">Loading dashboard…</p>
      </div>
    </div>
  );
}
