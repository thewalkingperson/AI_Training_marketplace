import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/scholarships/status-pill";
import { getScholarshipSnapshot } from "@/lib/scholarships/mock-store";

const fieldClassName =
  "mt-2 w-full rounded-[1rem] border border-outline/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface";

export default function ScholarshipSignupPage() {
  const snapshot = getScholarshipSnapshot();
  const adultStudent = snapshot.students.find((student) => student.age >= 18)!;
  const minorStudent = snapshot.students.find((student) => student.age < 18)!;
  const adultConsent = snapshot.consents.find((item) => item.studentId === adultStudent.id)!;
  const minorConsent = snapshot.consents.find((item) => item.studentId === minorStudent.id)!;
  const parentConsent = snapshot.parentConsents.find((item) => item.studentId === minorStudent.id)!;

  return (
    <div className="space-y-8">
      <section className="surface-panel rounded-[2rem] p-7">
        <p className="section-kicker">Onboarding</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatusPill label="ages 13+ only" tone="accent" />
          <StatusPill label="under 18 needs parent" tone="warning" />
          <StatusPill label="essay automation opt-in" tone="success" />
        </div>
        <h1 className="mt-4 font-headline text-[3rem] italic leading-tight text-on-surface">
          Sign up once, then let the agent work quietly in the background.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-on-surface-variant">
          v1 collects a reusable student profile, records consent for matching, drafting, submission, monitoring, and
          billing, and blocks users under 13. Any student under 18 needs a linked parent or guardian consent before
          automation turns on.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <SectionCard title="Primary student profile" eyebrow="Adult path">
          <form className="grid gap-4">
            <label>
              <span className="mono-kicker">Full name</span>
              <input className={fieldClassName} defaultValue={adultStudent.fullName} />
            </label>
            <label>
              <span className="mono-kicker">Email</span>
              <input className={fieldClassName} defaultValue={adultStudent.email} />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mono-kicker">School</span>
                <input className={fieldClassName} defaultValue={adultStudent.schoolName} />
              </label>
              <label>
                <span className="mono-kicker">Major</span>
                <input className={fieldClassName} defaultValue={adultStudent.major} />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label>
                <span className="mono-kicker">Age</span>
                <input className={fieldClassName} defaultValue={adultStudent.age} />
              </label>
              <label>
                <span className="mono-kicker">Academic year</span>
                <input className={fieldClassName} defaultValue={adultStudent.academicYear.replaceAll("_", " ")} />
              </label>
              <label>
                <span className="mono-kicker">GPA</span>
                <input className={fieldClassName} defaultValue={adultStudent.gpa} />
              </label>
            </div>
            <label>
              <span className="mono-kicker">Essay fact bank</span>
              <textarea
                className={`${fieldClassName} min-h-36`}
                defaultValue={adultStudent.essayFacts.join("\n\n")}
              />
            </label>
            <div className="rounded-[1.4rem] bg-surface-container-lowest p-4">
              <p className="mono-kicker">Consent scope</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Signed for {adultConsent.scope.join(", ")} and pre-authorized classes:{" "}
                {adultConsent.scholarshipClassAuthorization.join(", ")}.
              </p>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Minor-safe enrollment example" eyebrow="Parent consent">
          <div className="space-y-4">
            <div className="rounded-[1.4rem] bg-surface-container-lowest p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="mono-kicker">Student</p>
                  <p className="mt-2 font-headline text-3xl italic text-on-surface">{minorStudent.fullName}</p>
                </div>
                <StatusPill label="parent-linked" tone="warning" />
              </div>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Age {minorStudent.age}, {minorStudent.academicYear.replaceAll("_", " ")}, {minorStudent.major} at{" "}
                {minorStudent.schoolName}.
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-surface-container-high p-5">
              <p className="mono-kicker">Parent consent</p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                {parentConsent.parentName} ({parentConsent.relation}) signed on{" "}
                {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
                  new Date(parentConsent.signedAt),
                )}.
              </p>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Automation scope mirrors the student consent: {minorConsent.scope.join(", ")}.
              </p>
            </div>
            <div className="rounded-[1.4rem] bg-on-surface p-5 text-surface">
              <p className="mono-kicker text-white/60">Hard block</p>
              <p className="mt-3 text-sm leading-7 text-white/75">
                Users under 13 never reach this flow. They are blocked before profile creation and cannot create a
                consent bundle.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/scholarships/dashboard" className="ember-button px-6 py-4">
          Preview wins-first dashboard
        </Link>
        <Link href="/scholarships/admin" className="ghost-button px-6 py-4">
          Review ops console
        </Link>
      </div>
    </div>
  );
}
