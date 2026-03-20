interface StatusPillProps {
  label: string;
  tone?: "accent" | "success" | "warning" | "danger" | "neutral";
}

const toneClasses: Record<NonNullable<StatusPillProps["tone"]>, string> = {
  accent: "bg-primary/12 text-primary",
  success: "bg-emerald-500/14 text-emerald-700",
  warning: "bg-amber-500/14 text-amber-700",
  danger: "bg-rose-500/14 text-rose-700",
  neutral: "bg-surface-container-high text-on-surface-variant"
};

export const StatusPill = ({ label, tone = "neutral" }: StatusPillProps) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 font-label text-[0.66rem] font-bold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
  >
    {label}
  </span>
);
