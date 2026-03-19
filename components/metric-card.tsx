interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
}

export const MetricCard = ({ label, value, detail }: MetricCardProps) => (
  <article className="rounded-4xl border border-ink/10 bg-white/90 p-6 shadow-card backdrop-blur">
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink/45">{label}</p>
    <p className="mt-3 text-4xl font-semibold text-ink">{value}</p>
    <p className="mt-2 text-sm text-ink/65">{detail}</p>
  </article>
);
