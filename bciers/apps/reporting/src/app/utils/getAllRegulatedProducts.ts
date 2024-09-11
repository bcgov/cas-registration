import { actionHandler } from "@bciers/actions";

export const getAllRegulatedProducts = async () => {
  return actionHandler(
    `registration/regulated_products`,
    "GET",
    `reporting/products`,
  );
};
