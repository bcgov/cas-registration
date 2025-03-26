import { actionHandler } from "../actions";

async function postSubmitReport(report_version_id: number, data: any) {
  const endpoint = `reporting/report-version/${report_version_id}/submit`;
  const payload = {
    acknowledgements: {
      acknowledgement_of_review: data.acknowledgement_of_review,
      acknowledgement_of_records: data.acknowledgement_of_records,
      acknowledgement_of_possible_costs: data.acknowledgement_of_possible_costs,
      acknowledgement_of_information:
        data.acknowledgement_of_information ?? null,
      acknowledgement_of_new_version:
        data.acknowledgement_of_new_version ?? null,
    },
    signature: data.signature,
  };
  return actionHandler(endpoint, "POST", endpoint, {
    body: JSON.stringify(payload),
  });
}

export default postSubmitReport;
