import { sumWithPrecision } from "@reporting/src/app/utils/numberUtils";

interface FuelItem {
  fuelType?: { fuelName?: string };
  q1FuelAmount?: number | null;
  q2FuelAmount?: number | null;
  q3FuelAmount?: number | null;
  q4FuelAmount?: number | null;
  annualFuelAmount?: number | null;
}

export interface MobileCombustionFormData {
  sourceTypes?: {
    mobileFuelCombustionPartOfFacility?: {
      fuels?: FuelItem[];
    };
  };
}

export interface BiogenicFormData {
  biogenicIndustrialProcessEmissions?: {
    doesUtilizeLimeRecoveryKiln?: boolean;
    biogenicEmissionsSplit?: {
      chemicalPulpPercentage?: number | string | null;
      limeRecoveredByKilnPercentage?: number | string | null;
      totalAllocated?: number;
    };
  } | null;
}

export const clearMobileFuelAmountsOnFuelClear = (
  formData: MobileCombustionFormData,
  prevFormData: MobileCombustionFormData,
): boolean => {
  const mobileUnit = formData?.sourceTypes?.mobileFuelCombustionPartOfFacility;
  const prevMobileUnit =
    prevFormData?.sourceTypes?.mobileFuelCombustionPartOfFacility;
  if (!mobileUnit?.fuels) return false;

  let anyCleared = false;
  mobileUnit.fuels.forEach((fuel, i) => {
    const prevFuelName = prevMobileUnit?.fuels?.[i]?.fuelType?.fuelName;
    // Only clear when the fuel name transitioned from a value to empty —
    // i.e. the user explicitly cleared it. Typing amounts with no fuel ever
    // selected should not trigger clearing or a form remount.
    if (!fuel?.fuelType?.fuelName && prevFuelName) {
      const hasValues =
        fuel.q1FuelAmount != null ||
        fuel.q2FuelAmount != null ||
        fuel.q3FuelAmount != null ||
        fuel.q4FuelAmount != null;
      if (hasValues) {
        fuel.q1FuelAmount = undefined;
        fuel.q2FuelAmount = undefined;
        fuel.q3FuelAmount = undefined;
        fuel.q4FuelAmount = undefined;
        fuel.annualFuelAmount = undefined;
        anyCleared = true;
      }
    }
  });
  return anyCleared;
};

export const calculateMobileAnnualAmount = (
  formData: MobileCombustionFormData,
) => {
  const mobileUnit = formData?.sourceTypes?.mobileFuelCombustionPartOfFacility;
  if (!mobileUnit?.fuels) return;

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

export const calculateBiogenicTotalAllocated = (formData: BiogenicFormData) => {
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
