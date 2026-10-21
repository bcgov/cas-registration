import { actionHandler } from "@bciers/actions";

async function postCommentThread(
  reportVersionId: number,
  comment: string,
  facilityId?: string,
) {
  const endpoint = `reporting/v2/report-version/${reportVersionId}/threads`;
  const pathToRevalidate = `reporting/v2/report-version/${reportVersionId}/threads`;
  const response = await actionHandler(endpoint, "POST", pathToRevalidate, {
    body: JSON.stringify({
      facility_id: facilityId,
      comment: comment,
    }),
  });

  return response;
}

export default postCommentThread;
