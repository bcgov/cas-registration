import { InternalFrontEndRoles } from "@bciers/utils/src/enums";
import { UUID } from "crypto";

export interface InternalAccessRequest {
  id: UUID;
  name: string;
  role: InternalFrontEndRoles;
  email: string;
  archived_at?: string;
}
