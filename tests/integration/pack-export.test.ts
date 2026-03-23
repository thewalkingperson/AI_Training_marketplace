import { beforeEach, describe, expect, test } from "vitest";

import { resetMockStore } from "@/lib/mock-store";
import { createPack } from "@/lib/services/packs";

describe("pack exports", () => {
  beforeEach(() => {
    resetMockStore();
  });

  test("filters out cases without the required rights", async () => {
    const evalPack = await createPack("usr_lab_1", "eval_pack", ["case_1", "case_2"]);
    const trainingPack = await createPack("usr_lab_1", "training_pack", ["case_1", "case_2"]);

    expect(evalPack.pack.caseIds).toContain("case_1");
    expect(trainingPack.pack.caseIds).toContain("case_2");
    expect(trainingPack.pack.caseIds).not.toContain("case_1");
  });
});
