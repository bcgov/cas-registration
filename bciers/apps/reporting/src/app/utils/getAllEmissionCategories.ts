import { actionHandler } from "@bciers/actions";

export const getAllEmissionCategories = async () => {
  return actionHandler(
    `reporting/emission-category`,
    "GET",
    `reporting/emission-category`,
  );
};
