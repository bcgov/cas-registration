import { actionHandler } from "@bciers/actions";

// 🛠️ Function to fetch operations
export const fetchFacilitiesPageData = async (version_id: number) => {
  const pageData = await actionHandler(
    `reporting/report-version/${version_id}/facility-report-list`,
    "GET",
    "",
  );
  console.log("vers", version_id);

  console.log("page data", pageData);
  return {
    rows: pageData.items,
    row_count: pageData.count,
  };
};
