import { actionHandler } from "../../../../../libs/actions/src/actions";

async function postAttachments(report_version_id: number, fileData: FormData) {
  const endpoint = `reporting/report-version/${report_version_id}/attachments`;

  const response = await actionHandler(
    endpoint,
    "POST",
    `/reporting/reports/${report_version_id}/attachments`,
    {
      body: fileData,
    },
  );

  return response;
}

export default postAttachments;
