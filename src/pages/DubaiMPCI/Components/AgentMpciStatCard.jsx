import { memo } from "react";
import {
  AssignmentOutlinedIcon,
  LocalShippingOutlinedIcon,
  PendingActionsOutlinedIcon,
  TaskAltOutlinedIcon,
  WarningAmberOutlinedIcon,
} from "@/components/ui/icons";

const ICONS = {
  pending: PendingActionsOutlinedIcon,
  warning: WarningAmberOutlinedIcon,
  truck: LocalShippingOutlinedIcon,
  check: TaskAltOutlinedIcon,
  list: AssignmentOutlinedIcon,
};

const AgentMpciStatCard = memo(function AgentMpciStatCard({
  title,
  value,
  subtitle,
  subpara,
  iconName,
  onClick,
  active = false,
  iconBgColor,
  iconColor,
  accentColor = "#1976D2",
  breakdown = [],
  onBreakdownClick,
}) {
  const Icon = ICONS[iconName] || AssignmentOutlinedIcon;
  const displayValue =
    typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : (value ?? "-");

  return (
    <div className="group relative h-full">
      <button
        type="button"
        onClick={onClick}
        className={`flex h-full w-full flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
          active ? "border-sky-400 ring-2 ring-sky-200" : "border-slate-200 hover:border-slate-300"
        }`}
        style={{ borderTop: `3px solid ${accentColor}` }}
      >
        <span className="flex items-start justify-between gap-3">
          <span>
            <span className="block text-[11px] font-semibold tracking-wide text-slate-500">{title}</span>
            <span className="mt-2 block text-3xl font-semibold text-slate-900">{displayValue}</span>
          </span>
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: iconBgColor, color: iconColor }}
          >
            <Icon />
          </span>
        </span>
        <span className="mt-3 block text-sm font-semibold text-slate-800">{subtitle}</span>
        <span className="mt-1 block text-xs text-slate-500">{subpara}</span>
      </button>
      {breakdown.length > 0 ? (
        <div className="invisible absolute left-0 right-0 top-full z-20 mt-2 rounded-xl border border-slate-200 bg-white p-3 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
          <p className="mb-2 text-xs font-semibold text-slate-500">
            {breakdown.some((item) => item.edtTitle) ? "FILING RISK" : "EXCEPTION BREAKDOWN"}
          </p>
          <div className="space-y-1">
            {breakdown.map((item) => (
              <button
                key={item.id}
                type="button"
                className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm hover:bg-slate-50"
                onClick={(event) => {
                  event.stopPropagation();
                  onBreakdownClick?.(item);
                }}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: item.color }} />
                  <span>
                    {item.title}
                    {item.edtTitle ? <span className="ml-1 text-xs text-slate-400">{item.edtTitle}</span> : null}
                  </span>
                </span>
                <span className="font-medium">{item.value ?? 0}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
});

export default AgentMpciStatCard;
