import { getSnapshot } from "@/lib/mock-store";
import type { AuditEvent } from "@/lib/types";

interface RecordAuditInput {
  actorId: string;
  entityType: AuditEvent["entityType"];
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export const recordAuditEvent = ({
  actorId,
  entityType,
  entityId,
  action,
  metadata = {}
}: RecordAuditInput): AuditEvent => {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    actorId,
    entityType,
    entityId,
    action,
    metadata,
    createdAt: new Date().toISOString()
  };

  getSnapshot().auditEvents.unshift(event);
  return event;
};
