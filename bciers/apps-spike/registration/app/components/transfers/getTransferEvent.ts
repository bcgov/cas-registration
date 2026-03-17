import { actionHandler } from "@bciers/actions";
import { UUID } from "crypto";

// 🛠️ Function to fetch a transfer event by uuid
export default async function getTransferEvent(uuid: UUID) {
  return actionHandler(
    `registration/transfer-events/${uuid}`,
    "GET",
    `/transfers/${uuid}`,
  );
}
