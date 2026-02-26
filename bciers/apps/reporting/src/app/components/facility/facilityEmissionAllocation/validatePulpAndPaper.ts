import { FormData } from "../FacilityEmissionAllocationForm";
import { EmissionAllocationData } from "../types";

const validatePulpAndPaper = (
  formData: FormData,
  overlappingIndustrialProcessEmissions: number,
): string[] => {
  const errors: string[] = [];

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
  if (!chemicalPulpAllocation)
    errors.push(
      "Missing Product: 'Pulp and paper: chemical pulp'. Please add the product on the operation review page",
    );
  else if (!limeRecoveredByKilnAllocation)
    errors.push(
      "Missing Product: 'Pulp and paper: lime recovered by kiln'. Please add the product on the operation review page",
    );
  else if (
    // overlapping industrial process emissions are necessarily allocated to either of these products,
    // we can give the user an early warning if they didn't allocate enough at this stage
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
