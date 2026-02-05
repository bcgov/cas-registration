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

  // Only calculate if lime recovery kiln is used and scheduleC exists
  if (biogenic.doesUtilizeLimeRecoveryKiln && biogenic.scheduleC) {
    // Initialize totalAllocated if it doesn't exist
    if (biogenic.scheduleC.totalAllocated === undefined) {
      biogenic.scheduleC.totalAllocated = 0;
    }

    const chemical = Number(biogenic.scheduleC.chemicalPulpAmount) || 0;
    const lime = Number(biogenic.scheduleC.limeRecoveredByKilnAmount) || 0;

    // Update the total field automatically
    biogenic.scheduleC.totalAllocated = chemical + lime;
  } else if (biogenic.scheduleC) {
    // Set to 0 when not using lime recovery kiln
    biogenic.scheduleC.totalAllocated = 0;
  }
};
