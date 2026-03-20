import { scholarshipSnapshot } from "@/lib/scholarships/mock-data";
import type { ScholarshipSnapshot } from "@/lib/scholarships/types";

let state: ScholarshipSnapshot = structuredClone(scholarshipSnapshot);

export const getScholarshipSnapshot = (): ScholarshipSnapshot => state;

export const resetScholarshipStore = () => {
  state = structuredClone(scholarshipSnapshot);
};
