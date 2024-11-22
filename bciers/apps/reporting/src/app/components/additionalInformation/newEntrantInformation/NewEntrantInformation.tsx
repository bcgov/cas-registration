import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonForm";
import NewEntrantInformationForm from "./NewEntrantInformationForm";
import { getNewEntrantData } from "@reporting/src/app/utils/getNewEntrantData";

// Define type for Product to ensure consistency
type Product = {
  id: string | number;
  name: string;
};

export default async function NewEntrantInformation({
  versionId,
}: {
  versionId: number;
}) {
  const newEntrantData = await getNewEntrantData(versionId);
  const emissions = newEntrantData.report_new_entrant_data.emissions;
  const initialFormData = newEntrantData.report_new_entrant_data;
  const regulatedProducts = newEntrantData.regulated_products;
  // Mapping over the products to transform data
  const transformedProducts = regulatedProducts.reduce(
    (
      acc: { [x: string]: { production_amount: any } },
      product: { id: string | number },
    ) => {
      const selectedProduct = initialFormData.selected_products?.find(
        (p: { product_id: string | number }) => p.product_id === product.id,
      );

      acc[product.id] = {
        production_amount: selectedProduct?.production_amount || "",
      };
      return acc;
    },
    {},
  );

  const transformedEmissions = emissions.reduce(
    (
      acc: { [x: string]: any },
      emission: { id: string | number; emission_amount: null },
    ) => {
      acc[emission.id] = emission.emission_amount || null;
      return acc;
    },
    {},
  );

  return (
    <Suspense fallback={<Loading />}>
      <NewEntrantInformationForm
        versionId={versionId}
        products={regulatedProducts}
        initialFormData={{
          ...initialFormData,
          products: transformedProducts,
          emission_after_new_entrant: transformedEmissions,
        }}
        emissions={emissions}
      />
    </Suspense>
  );
}
