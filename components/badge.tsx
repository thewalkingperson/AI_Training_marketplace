import clsx from "clsx";

interface BadgeProps {
  tone?: "default" | "accent" | "success" | "warning";
  children: React.ReactNode;
}

export const Badge = ({ tone = "default", children }: BadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]",
      {
        "border-ink/10 bg-white/80 text-ink/70": tone === "default",
        "border-ember/20 bg-ember/10 text-ember": tone === "accent",
        "border-moss/20 bg-moss/10 text-moss": tone === "success",
        "border-sand/50 bg-sand/40 text-ink": tone === "warning"
      },
    )}
  >
    {children}
  </span>
);
