import { sumWithPrecision } from "@reporting/src/app/utils/numberUtils";

export const calculateMobileAnnualAmount = (formData: any) => {
  const mobileUnit = formData?.sourceTypes?.mobileFuelCombustionPartOfFacility;
  if (!mobileUnit || !mobileUnit.fuels) return;

  //  For each fuel, for each quarter amount, add to calculated annual fuel amount
  for (const fuel of mobileUnit.fuels) {
    let total = 0;
    if (fuel?.q1FuelAmount !== null && fuel?.q1FuelAmount !== undefined)
      total += fuel.q1FuelAmount;
    if (fuel?.q2FuelAmount !== null && fuel?.q2FuelAmount !== undefined)
      total += fuel.q2FuelAmount;
    if (fuel?.q3FuelAmount !== null && fuel?.q3FuelAmount !== undefined)
      total += fuel.q3FuelAmount;
    if (fuel?.q4FuelAmount !== null && fuel?.q4FuelAmount !== undefined)
      total += fuel.q4FuelAmount;
    fuel["annualFuelAmount"] = total; // Apply total
  }
};

export const calculateBiogenicTotalAllocated = (formData: any) => {
  const biogenic = formData?.biogenicIndustrialProcessEmissions;

  if (!biogenic) return;

  if (biogenic.doesUtilizeLimeRecoveryKiln && biogenic.biogenicEmissionsSplit) {
    const chemical =
      Number(biogenic.biogenicEmissionsSplit.chemicalPulpPercentage) || 0;
    const lime =
      Number(biogenic.biogenicEmissionsSplit.limeRecoveredByKilnPercentage) ||
      0;
    biogenic.biogenicEmissionsSplit.totalAllocated = sumWithPrecision(
      chemical,
      lime,
    );
  } else if (biogenic.biogenicEmissionsSplit) {
    // Kiln not utilized — clear any stale totalAllocated
    delete biogenic.biogenicEmissionsSplit.totalAllocated;
  }
};
