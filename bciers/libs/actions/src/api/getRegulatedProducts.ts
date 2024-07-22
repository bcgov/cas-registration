import { actionHandler } from "@bciers/actions";

async function getRegulatedProducts() {
  try {
    return await actionHandler("registration/regulated_products", "GET", "");
  } catch (error) {
    throw error;
  }
}

export default getRegulatedProducts;
