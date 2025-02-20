/* eslint-disable */
import http from "k6/http";
import { check } from "k6";
import { crypto } from "k6/experimental/webcrypto";
import { getInternalUserParams } from "../../setup/params.js";

const transferEvent = () => {
  const HOST = __ENV.SERVER_HOST;
  const fromOperatorId = crypto.randomUUID();
  const toOperatorId = crypto.randomUUID();
  const operationId = crypto.randomUUID();

  // ##### GET #####
  // check(http.get(HOST + "/transfer-events", getInternalUserParams("cas_director")), {
  //   "is status 200": (r) => r.status === 200,
  // });


  // ##### POST #####
  const newTransferEvent = http.post(
    HOST + "/transfer-events",
    JSON.stringify({
      transfer_entity: "Operation",
      from_operator: fromOperatorId,
      to_operator: toOperatorId,
      operation: operationId,
    }),
    getInternalUserParams("cas_analyst"),
  );

  check(newTransferEvent, {
    "is status 201": (r) => r.status === 201,
  });

  // Get the transfer event ID from the POST response so we can use it in PUT test
  const newTransferEventId = JSON.parse(newTransferEvent.body).transfer_id;
  console.log("newTransferEventId: ", newTransferEventId);

  // ##### PUT #####

  // check(
  //   http.put(
  //     HOST + `/operations/${operationId}?submit=false&form_section=1`,
  //     JSON.stringify({
  //       operator_id: 2,
  //       name: "Test Operation Updated",
  //       status: "Pending",
  //       documents: [],
  //       regulated_products: [],
  //       activities: [],
  //       type: "Test Type Updated",
  //       naics_code: 21,
  //     }),
  //     industryUserParams,
  //   ),
  //   {
  //     "is status 200": (r) => r.status === 200,
  //   },
  // );
  //
  // check(
  //   http.put(
  //     HOST + `/operation/${operationId}/update-status`,
  //     JSON.stringify({
  //       status: "Approved",
  //     }),
  //     internalUserParams,
  //   ),
  //   {
  //     "is status 200": (r) => r.status === 200,
  //   },
  // );
};

export default transferEvent;
