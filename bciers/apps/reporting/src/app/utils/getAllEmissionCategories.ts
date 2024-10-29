import { actionHandler } from "@bciers/actions";

export const getAllEmissionCategories = async () => {
  return actionHandler(
    `reporting/activities`,
    "GET",
    `reporting/emission-category`,
  );
};
