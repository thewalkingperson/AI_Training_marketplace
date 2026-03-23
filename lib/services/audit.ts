import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isDemoMode } from "@/lib/env";
import { getSnapshot } from "@/lib/mock-store";
import type { AuditEvent } from "@/lib/types";

interface RecordAuditInput {
  actorId: string;
  entityType: AuditEvent["entityType"];
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export const recordAuditEvent = async ({
  actorId,
  entityType,
  entityId,
  action,
  metadata = {}
}: RecordAuditInput): Promise<AuditEvent> => {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    actorId,
    entityType,
    entityId,
    action,
    metadata,
    createdAt: new Date().toISOString()
  };

  if (isDemoMode) {
    getSnapshot().auditEvents.unshift(event);
    return event;
  }

  const created = await prisma.auditEvent.create({
    data: {
      id: event.id,
      actorId,
      entityType,
      entityId,
      action,
      metadata: metadata as Prisma.InputJsonValue
    }
  });

  return {
    ...event,
    createdAt: created.createdAt.toISOString()
  };
};
