import { actionHandler } from "@bciers/actions";

async function getAuditLog(entityType: string, entityId: string) {
  return actionHandler(`audit-log/${entityType}/${entityId}`, "GET", "");
}

export default getAuditLog;
