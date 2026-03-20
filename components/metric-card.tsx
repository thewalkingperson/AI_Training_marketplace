interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "primary" | "secondary";
}

export const MetricCard = ({ label, value, detail, tone = "default" }: MetricCardProps) => (
  <article
    className={[
      "surface-card rounded-[2rem] p-6",
      tone === "primary" ? "bg-primary text-white shadow-[0_24px_48px_rgba(163,56,15,0.14)]" : "",
      tone === "secondary" ? "bg-surface-container-low text-on-surface" : ""
    ].join(" ")}
  >
    <p className={tone === "primary" ? "font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/70" : "mono-kicker"}>
      {label}
    </p>
    <p className={tone === "primary" ? "mt-4 font-headline text-5xl italic text-white" : "mt-4 font-headline text-4xl italic text-on-surface"}>
      {value}
    </p>
    <p className={tone === "primary" ? "mt-3 max-w-xs text-sm leading-6 text-white/72" : "mt-3 text-sm leading-6 text-on-surface-variant"}>
      {detail}
    </p>
  </article>
);
