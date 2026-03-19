interface SectionCardProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}

export const SectionCard = ({ title, eyebrow, children }: SectionCardProps) => (
  <section className="rounded-4xl border border-ink/10 bg-white/85 p-7 shadow-card backdrop-blur">
    {eyebrow ? (
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sea">{eyebrow}</p>
    ) : null}
    <h2 className="mt-2 text-2xl font-semibold text-ink">{title}</h2>
    <div className="mt-5 text-sm leading-7 text-ink/72">{children}</div>
  </section>
);
