import clsx from "clsx";

interface BadgeProps {
  tone?: "default" | "accent" | "success" | "warning" | "danger";
  children: React.ReactNode;
}

export const Badge = ({ tone = "default", children }: BadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full px-3 py-1 font-label text-[0.6rem] font-bold uppercase tracking-[0.16em]",
      {
        "bg-surface-container-high text-on-surface-variant": tone === "default",
        "bg-primary-fixed text-primary": tone === "accent",
        "bg-tertiary-fixed text-tertiary": tone === "success",
        "bg-surface-container-highest text-on-surface": tone === "warning",
        "bg-error-container text-error": tone === "danger"
      },
    )}
  >
    {children}
  </span>
);
