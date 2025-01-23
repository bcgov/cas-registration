export const calculateMobileAnnualAmount = (formData: any) => {
  const mobileUnit = formData?.sourceTypes?.mobileFuelCombustionPartOfFacility;
  if (!mobileUnit || !mobileUnit.fuels) return;

  // For each fuel, calculate annual amount if all quarters are present
  for (const fuel of mobileUnit.fuels) {
    if (
      !fuel?.q1FuelAmount ||
      !fuel?.q2FuelAmount ||
      !fuel?.q3FuelAmount ||
      !fuel?.q4FuelAmount
    )
      return;
    const total =
      fuel.q1FuelAmount +
      fuel.q2FuelAmount +
      fuel.q3FuelAmount +
      fuel.q4FuelAmount;
    fuel["annualFuelAmount"] = total; // Apply total
  }
};
