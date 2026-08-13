import { RegulatedProduct } from "../../operations/types";
import { FormData } from "../FacilityEmissionAllocationForm";
import { EmissionAllocationData } from "../types";

const validatePulpAndPaper = (
  formData: FormData,
  overlappingIndustrialProcessEmissions: number,
  reportingYear: number,
  regulatedProducts: RegulatedProduct[],
): string[] => {
  const errors: string[] = [];

  // Ignore pulp and paper (return no errors) if methodology is not applicable
  // This methodology is only allowed in 2024
  if (formData?.allocation_methodology === "Not Applicable") return [];

  const industrialEmissionAllocations =
    formData?.basic_emission_allocation_data?.find(
      (allocation: EmissionAllocationData) =>
        allocation.emission_category_name === "Industrial process emissions",
    );
  const chemicalPulpAllocation = industrialEmissionAllocations?.products?.find(
    (p) => p.product_name === "Pulp and paper: chemical pulp",
  );
  const limeRecoveredByKilnAllocation =
    industrialEmissionAllocations?.products?.find(
      (p) => p.product_name === "Pulp and paper: lime recovered by kiln",
    );
  if (!chemicalPulpAllocation && limeRecoveredByKilnAllocation)
    errors.push(
      "Missing Product: 'Pulp and paper: chemical pulp'. Please add the product on the operation review page and report production amounts.",
    );
  if (!limeRecoveredByKilnAllocation && chemicalPulpAllocation) {
    // Check if reporting year is valid for this product before pushing error message
    const limeRegulatedProduct = regulatedProducts.find(
      (p) => p.name === "Pulp and paper: lime recovered by kiln",
    );
    if (limeRegulatedProduct) {
      const fromYear = new Date(
        limeRegulatedProduct.valid_from,
      ).getUTCFullYear();
      const toYear = new Date(limeRegulatedProduct.valid_to).getUTCFullYear();
      if (reportingYear >= fromYear && reportingYear <= toYear) {
        errors.push(
          "Missing Product: 'Pulp and paper: lime recovered by kiln'. Please add the product on the operation review page and report production amounts.",
        );
      }
    }
  }
  if (
    // overlapping industrial process emissions are necessarily allocated to either of these products,
    // we can give the user an early warning if they didn't allocate enough at this stage
    limeRecoveredByKilnAllocation &&
    chemicalPulpAllocation &&
    chemicalPulpAllocation.allocated_quantity +
      limeRecoveredByKilnAllocation.allocated_quantity -
      overlappingIndustrialProcessEmissions <
      0
  )
    errors.push(
      `Invalid allocation: Industrial Process quantity allocated betwen 'Pulp and paper:
        chemical pulp' and 'Pulp and paper: lime recovered by kiln' is too low`,
    );

  return errors;
};

export { validatePulpAndPaper };
