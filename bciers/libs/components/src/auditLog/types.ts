export interface AuditLogSnapshotField {
  label: string;
  value: unknown;
}

export interface AuditLogEntry {
  action: "create" | "update" | "delete";
  timestamp: string;
  snapshot: Record<string, AuditLogSnapshotField>;
  changed_fields: string[];
  reason: string | null;
  actor_guid: string | null;
  actor_display_name: string | null;
}

export interface AuditLogListResponse {
  entity_display_name: string;
  entries: AuditLogEntry[];
}
