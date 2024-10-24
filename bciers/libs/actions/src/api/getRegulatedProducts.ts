import { actionHandler } from "@bciers/actions";

async function getRegulatedProducts() {
  return await actionHandler("registration/regulated_products", "GET", "");
}

export default getRegulatedProducts;
