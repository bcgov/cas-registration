import { actionHandler } from "@bciers/actions";

async function getRegulatedProducts() {
  const response = await actionHandler(
    "registration/regulated_products",
    "GET",
    "",
  );
  return response;
}

export default getRegulatedProducts;
