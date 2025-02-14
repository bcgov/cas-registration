import { EmissionAllocationData } from "./types";

// Function that makes sure the percentage does not show 100 when it is not exactly 100
const handlePercentageNearHundred = (value: number) => {
  let res;
  if (value > 100.0 && value < 100.01) {
    res = 100.01;
  } else if (value < 100.0 && value > 99.99) {
    res = 99.99;
  } else {
    res = value;
  }

  return parseFloat(res.toFixed(4));
};

// 🛠️ Function to calculate category products allocation sum and set total sum in products_emission_allocation_sum
export const calculateEmissionData = (category: EmissionAllocationData) => {
  const sum = category.products.reduce(
    (total, product) =>
      total + (parseFloat(product.allocated_quantity.toString()) || 0),
    0,
  );

  const emissionTotal = Number(category.emission_total);
  let percentage;

  if (emissionTotal) {
    percentage = handlePercentageNearHundred((sum / emissionTotal) * 100);
  } else {
    percentage = sum ? -1 : 100;
  }

  return {
    ...category,
    products_emission_allocation_sum:
      percentage < 0 || percentage > 100
        ? `This category is over-allocated by ${sum - emissionTotal}`
        : `${percentage.toFixed(2)}%`,
    emission_total: category.emission_total.toString(),
  };
};
