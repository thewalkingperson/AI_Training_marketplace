import { z } from "zod";

import { SCHOLARSHIP_POLICY_CONFIG } from "@/lib/scholarships/config";

export const studentProfileInputSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().min(2),
  email: z.string().email(),
  age: z.number().int().min(SCHOLARSHIP_POLICY_CONFIG.minimumStudentAge),
  schoolName: z.string().min(2),
  academicYear: z.enum(["incoming_freshman", "freshman", "sophomore", "junior", "senior"]),
  major: z.string().min(2),
  gpa: z.number().min(0).max(4),
  citizenship: z.enum(["us_citizen", "permanent_resident", "international"]),
  householdIncomeBand: z.enum(["lt_50k", "50k_100k", "100k_200k", "gt_200k"]),
  firstGenerationStudent: z.boolean(),
  statesOfResidence: z.array(z.string().min(2)).min(1),
  interests: z.array(z.string().min(2)).min(1),
  achievements: z.array(z.string().min(2)).min(1),
  essayFacts: z.array(z.string().min(5)).min(2),
  preferences: z.object({
    autoSubmitEligible: z.boolean(),
    allowEssayAutomation: z.boolean(),
    notificationChannel: z.enum(["email", "sms"])
  })
});

export const studentConsentInputSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  scope: z.array(z.enum(["match", "draft", "submit", "monitor", "bill"])).min(1),
  scholarshipClassAuthorization: z.array(z.enum(["direct_form", "email_submission", "essay_capable"])).min(1),
  revoked: z.boolean(),
  signedAt: z.string().datetime()
});

export const parentConsentInputSchema = z.object({
  id: z.string().min(1),
  studentId: z.string().min(1),
  parentName: z.string().min(2),
  parentEmail: z.string().email(),
  relation: z.string().min(2),
  signedAt: z.string().datetime()
});

export const validateStudentEnrollment = (input: {
  student: z.input<typeof studentProfileInputSchema>;
  consent: z.input<typeof studentConsentInputSchema>;
  parentConsent?: z.input<typeof parentConsentInputSchema> | null;
}) => {
  const student = studentProfileInputSchema.parse(input.student);
  const consent = studentConsentInputSchema.parse(input.consent);
  const parentConsent = input.parentConsent ? parentConsentInputSchema.parse(input.parentConsent) : null;

  if (consent.revoked) {
    throw new Error("Revoked consent cannot be used for active automation.");
  }

  if (student.age < SCHOLARSHIP_POLICY_CONFIG.adultAge && !parentConsent) {
    throw new Error("Parent or guardian consent is required for students under 18.");
  }

  return { student, consent, parentConsent };
};
