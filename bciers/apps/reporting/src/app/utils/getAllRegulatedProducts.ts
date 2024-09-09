import { actionHandler } from "@bciers/actions";

export const getAllRegulatedProducts = async () => {
  return actionHandler(`reporting/products`, "GET", `reporting/products`);
};
