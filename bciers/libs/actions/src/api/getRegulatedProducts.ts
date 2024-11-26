import { actionHandler } from "@bciers/actions";

async function getRegulatedProducts() {
  return actionHandler("registration/v2/regulated_products", "GET", "");
}

export default getRegulatedProducts;
