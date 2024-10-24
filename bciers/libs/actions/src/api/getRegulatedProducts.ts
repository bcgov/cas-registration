import { actionHandler } from "@bciers/actions";

async function getRegulatedProducts() {
  return actionHandler("registration/regulated_products", "GET", "");
}

export default getRegulatedProducts;
