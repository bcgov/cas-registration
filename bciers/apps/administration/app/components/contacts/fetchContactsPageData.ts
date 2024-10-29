import buildQueryParams from "@bciers/utils/src/buildQueryParams";
import { actionHandler } from "@bciers/actions";
import { ContactsSearchParams } from "./types";

// ↓ fetch data from server
const fetchContactsPageData = async (searchParams: ContactsSearchParams) => {
  try {
    const queryParams = buildQueryParams(searchParams);
    const pageData = await actionHandler(
      `registration/contacts${queryParams}`,
      "GET",
      "",
    );
    return {
      rows: pageData.items,
      row_count: pageData.count,
    };
  } catch (error) {
    throw error;
  }
};

export default fetchContactsPageData;
