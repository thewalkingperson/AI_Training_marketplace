import { describe, expect, test } from "vitest";

import { scholarshipSnapshot } from "@/lib/scholarships/mock-data";
import {
  studentConsentInputSchema,
  studentProfileInputSchema,
  validateStudentEnrollment
} from "@/lib/scholarships/validations";

describe("scholarship enrollment validation", () => {
  test("blocks users under 13", () => {
    const student = {
      ...scholarshipSnapshot.students[0],
      age: 12
    };

    expect(() => studentProfileInputSchema.parse(student)).toThrow(/>=13/i);
  });

  test("requires parent consent for minors", () => {
    const minor = scholarshipSnapshot.students.find((item) => item.id === "student_devon")!;
    const consent = scholarshipSnapshot.consents.find((item) => item.studentId === minor.id)!;

    expect(() =>
      validateStudentEnrollment({
        student: minor,
        consent,
        parentConsent: null
      }),
    ).toThrow(/parent or guardian consent/i);
  });

  test("rejects revoked consent", () => {
    const student = scholarshipSnapshot.students.find((item) => item.id === "student_maya")!;
    const consent = {
      ...scholarshipSnapshot.consents.find((item) => item.studentId === student.id)!,
      revoked: true
    };

    expect(() => studentConsentInputSchema.parse(consent)).not.toThrow();
    expect(() =>
      validateStudentEnrollment({
        student,
        consent,
        parentConsent: null
      }),
    ).toThrow(/revoked consent/i);
  });
});
