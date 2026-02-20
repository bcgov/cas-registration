import { FormData } from "../FacilityEmissionAllocationForm";

// 🛠️ Function to validate that emissions totals equal emissions allocations
const validateEmissions = (formData: FormData): boolean => {
  // Ignore emissions if methodology is not applicable
  if (formData?.allocation_methodology === "Not Applicable") return true;

  const combinedEmissionAllocationData = [
    ...formData.basic_emission_allocation_data,
    ...formData.fuel_excluded_emission_allocation_data,
  ];

  return combinedEmissionAllocationData.every((allocation) => {
    const FLOATING_POINT_PRECISION_FACTOR = 10000; // used to avoid floating point precision issues
    const sum = allocation.products.reduce(
      (total, product) =>
        total +
        (parseFloat(product.allocated_quantity.toString()) *
          FLOATING_POINT_PRECISION_FACTOR || 0), // we multiply by the factor when adding
      0,
    );
    const emissionTotal = parseFloat(allocation.emission_total.toString()) || 0;

    return (
      parseFloat((sum / FLOATING_POINT_PRECISION_FACTOR).toFixed(4)) === // and then divide the factor away when comparing the result
      parseFloat(emissionTotal.toFixed(4))
    );
  });
};

export { validateEmissions };
