interface SectionCardProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
}

export const SectionCard = ({ title, eyebrow, children, className }: SectionCardProps) => (
  <section className={`surface-panel rounded-[2rem] p-7 ${className ?? ""}`}>
    {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
    <h2 className="mt-3 font-headline text-[2rem] italic leading-tight text-on-surface">{title}</h2>
    <div className="mt-5 text-sm leading-7 text-on-surface-variant">{children}</div>
  </section>
);
