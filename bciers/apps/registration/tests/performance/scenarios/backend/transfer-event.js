/* eslint-disable */
import { SERVER_HOST } from "../../setup/constants.js";
import { getUserParams, makeRequest } from "../../setup/helpers.js";

import { fail } from "k6";

const fromOperatorId = "a35fb5ad-edd9-4465-982e-81b824644d07";
const toOperatorId = "685d581b-5698-411f-ae00-de1d97334a71";
const operationId = "8494e89c-489b-441b-a05d-e935b1d82487";

function createTransferEvent() {
  const payload = JSON.stringify({
    transfer_entity: "Operation",
    from_operator: fromOperatorId,
    to_operator: toOperatorId,
    operation: operationId,
    effective_date: "2025-12-01T09:00:00Z",
  });

  const res = makeRequest(
    "POST",
    `${SERVER_HOST}/transfer-events`,
    payload,
    getUserParams("cas_analyst"),
    201,
    "Creating transfer event failed",
  );
  return JSON.parse(res.body).transfer_id;
}

function updateTransferEvent(transferEventId) {
  const payload = JSON.stringify({
    operation: operationId,
    transfer_entity: "Operation",
    effective_date: "2025-10-01T09:00:00Z",
  });

  makeRequest(
    "PATCH",
    `${SERVER_HOST}/transfer-events/${transferEventId}`,
    payload,
    getUserParams("cas_analyst"),
    200,
    "Updating transfer event failed",
  );
}

function deleteTransferEvent(transferEventId) {
  makeRequest(
    "DELETE",
    `${SERVER_HOST}/transfer-events/${transferEventId}`,
    null,
    getUserParams("cas_analyst"),
    200,
    "Deleting transfer event failed",
  );
}

function fetchTransferEvents() {
  makeRequest(
    "GET",
    `${SERVER_HOST}/transfer-events`,
    null,
    getUserParams("cas_analyst"),
    200,
    "Fetching transfer events failed",
  );
}

export default function () {
  const transferEventId = createTransferEvent();
  updateTransferEvent(transferEventId);
  deleteTransferEvent(transferEventId);
  fetchTransferEvents();
}
