import { actionHandler } from "@bciers/actions";
import buildQueryParams from "@bciers/utils/src/buildQueryParams";

export interface AttachmentsSearchParams {
  [key: string]: string | number | undefined;
  page?: number;
  sort_field?: string;
  sort_order?: string;
}

export default async function getAttachmentsList(
  searchParams: AttachmentsSearchParams,
) {
  const queryParams = buildQueryParams(searchParams);
  const endpoint = `reporting/attachments${queryParams}`;

  const pageData = await actionHandler(endpoint, "GET", "");

  if (pageData.error) {
    throw new Error(`Failed to fetch the list of attachments`);
  }

  return {
    rows: pageData?.items,
    row_count: pageData?.count,
  };
}
