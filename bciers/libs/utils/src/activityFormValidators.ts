import { FormValidation } from "@rjsf/utils";
import { sumWithPrecision } from "@reporting/src/app/utils/numberUtils";

export const validateBiogenicTotalAllocated = (
  formData: any,
  errors: FormValidation,
): void => {
  const biogenic = formData?.biogenicIndustrialProcessEmissions;
  if (
    !biogenic?.doesUtilizeLimeRecoveryKiln ||
    !biogenic?.biogenicEmissionsSplit
  )
    return;

  const split = biogenic.biogenicEmissionsSplit;
  const hasAnyValue =
    split.chemicalPulpPercentage != null ||
    split.limeRecoveredByKilnPercentage != null;

  if (!hasAnyValue) return;

  const total = sumWithPrecision(
    Number(split.chemicalPulpPercentage) || 0,
    Number(split.limeRecoveredByKilnPercentage) || 0,
  );

  if (total !== 100) {
    addBiogenicTotalAllocatedError(errors);
  }
};

const addBiogenicTotalAllocatedError = (errors: FormValidation): void => {
  const e = errors as any;

  e.biogenicIndustrialProcessEmissions ??= {};
  e.biogenicIndustrialProcessEmissions.biogenicEmissionsSplit ??= {};
  e.biogenicIndustrialProcessEmissions.biogenicEmissionsSplit.totalAllocated ??=
    { __errors: [] };

  e.biogenicIndustrialProcessEmissions.biogenicEmissionsSplit.totalAllocated.__errors.push(
    "The total allocation must add up to 100%",
  );
};
export const validateEmissionsMethodology = (
  sourceTypes: Record<string, any>,
  errors: FormValidation,
): void => {
  const ensureErrorStructure = (errorPath: any): void => {
    if (!errorPath.methodology) {
      errorPath.methodology = { __errors: [] };
    }
    if (!errorPath.methodology.methodology) {
      errorPath.methodology.methodology = { __errors: [] };
    }
  };

  const validateEmissionsArray = (
    emissions: any[],
    getErrorPath: (index: number) => any,
  ) => {
    emissions?.forEach((emission, index) => {
      const errorPath = getErrorPath(index);
      if (!errorPath) return;

      // If gas type is selected, validate methodology
      if (emission?.gasType) {
        const hasMethodology =
          emission?.methodology?.methodology &&
          emission.methodology.methodology !== "";

        if (!hasMethodology) {
          ensureErrorStructure(errorPath);
          errorPath.methodology.methodology.__errors = ["Select a Methodology"];
        }
      }
    });
  };

  const validateEmissionsForItems = <T>(
    items: T[] | undefined,
    getEmissions: (item: T) => any[],
    getErrorPath: (idx: number) => (emissionIdx: number) => any,
  ): void => {
    items?.forEach((item, idx) =>
      validateEmissionsArray(getEmissions(item), getErrorPath(idx)),
    );
  };

  const validateEmissionsForUnit = (unit: any, unitErrors: any): void => {
    if (!unit || !unitErrors) return;

    // Units -> Fuels -> Emissions
    validateEmissionsForItems(
      unit.fuels,
      (fuel: any) => fuel.emissions,
      (fuelIdx) => (idx) => unitErrors.fuels?.[fuelIdx]?.emissions?.[idx],
    );

    // Units -> Emissions
    validateEmissionsArray(
      unit.emissions,
      (idx) => unitErrors.emissions?.[idx],
    );
  };

  Object.entries(sourceTypes).forEach(([sourceKey, sourceType]) => {
    const sourceErrors = (errors as any)?.sourceTypes?.[sourceKey];
    if (!sourceType || !sourceErrors) return;

    // Validate emissions at different levels
    sourceType.units?.forEach((unit: any, unitIdx: number) => {
      validateEmissionsForUnit(unit, sourceErrors.units?.[unitIdx]);
    });

    // Fuels -> Emissions
    validateEmissionsForItems(
      sourceType.fuels,
      (fuel: any) => fuel.emissions,
      (fuelIdx) => (idx) => sourceErrors.fuels?.[fuelIdx]?.emissions?.[idx],
    );

    // Direct emissions under source type
    validateEmissionsArray(
      sourceType.emissions,
      (idx) => sourceErrors.emissions?.[idx],
    );
  });
};

export const validateFuelName = (
  sourceTypes: Record<string, any>,
  errors: FormValidation,
): void => {
  const addFuelNameError = (fuelErrorPath: any): void => {
    if (!fuelErrorPath) return;

    fuelErrorPath.fuelType ??= {};
    fuelErrorPath.fuelType.fuelName ??= { __errors: [] };
    fuelErrorPath.fuelType.fuelName.__errors = ["Select a Fuel Name"];
  };

  const validateFuelsArray = (
    fuels: any[] | undefined,
    getFuelErrorPath: (index: number) => any,
  ): void => {
    fuels?.forEach((fuel, fuelIndex) => {
      const fuelErrorPath = getFuelErrorPath(fuelIndex);
      if (!fuelErrorPath) return;

      const hasFuelName = !!fuel?.fuelType?.fuelName;
      if (!hasFuelName) addFuelNameError(fuelErrorPath);
    });
  };

  Object.entries(sourceTypes).forEach(([sourceKey, sourceType]) => {
    const sourceErrors = (errors as any)?.sourceTypes?.[sourceKey];
    if (!sourceType || !sourceErrors) return;

    sourceType.units?.forEach((unit: any, unitIndex: number) => {
      validateFuelsArray(
        unit?.fuels,
        (fuelIndex) => sourceErrors.units?.[unitIndex]?.fuels?.[fuelIndex],
      );
    });

    validateFuelsArray(
      sourceType.fuels,
      (fuelIndex) => sourceErrors.fuels?.[fuelIndex],
    );
  });
};
