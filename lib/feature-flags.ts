import { env } from "@/lib/env";
import type { ArtifactType } from "@/lib/types";

export const isArtifactTypeEnabled = (artifactType: ArtifactType) => {
  if (artifactType === "code_repo") {
    return true;
  }

  return env.allowNonCodeArtifacts;
};
