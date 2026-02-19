import { FormValidation } from "@rjsf/utils";
import { sumWithPrecision } from "@reporting/src/app/utils/numberUtils";

export const validateBiogenicTotalAllocated = (
  formData: any,
  errors: FormValidation,
): void => {
  const biogenic = formData?.biogenicIndustrialProcessEmissions;
  if (
    biogenic?.doesUtilizeLimeRecoveryKiln &&
    biogenic?.biogenicEmissionsSplit
  ) {
    const FLOATING_POINT_PRECISION_FACTOR = 10000;

    const chemical =
      (Number(biogenic.biogenicEmissionsSplit.chemicalPulpPercentage) || 0) *
      FLOATING_POINT_PRECISION_FACTOR;
    const lime =
      (Number(biogenic.biogenicEmissionsSplit.limeRecoveredByKilnPercentage) ||
        0) * FLOATING_POINT_PRECISION_FACTOR;
    const total = sumWithPrecision(chemical, lime);

    if (total !== 100) {
      // Add error to prevent form submission
      if (!(errors as any).biogenicIndustrialProcessEmissions) {
        (errors as any).biogenicIndustrialProcessEmissions = {};
      }
      if (
        !(errors as any).biogenicIndustrialProcessEmissions
          .biogenicEmissionsSplit
      ) {
        (
          errors as any
        ).biogenicIndustrialProcessEmissions.biogenicEmissionsSplit = {};
      }
      if (
        !(errors as any).biogenicIndustrialProcessEmissions
          .biogenicEmissionsSplit.totalAllocated
      ) {
        (
          errors as any
        ).biogenicIndustrialProcessEmissions.biogenicEmissionsSplit.totalAllocated =
          {
            __errors: [],
          };
      }
      (
        errors as any
      ).biogenicIndustrialProcessEmissions.biogenicEmissionsSplit.totalAllocated.__errors.push(
        "The total allocation must add up to 100%",
      );
    }
  }
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

  Object.entries(sourceTypes).forEach(([sourceKey, sourceType]) => {
    const sourceErrors = (errors as any)?.sourceTypes?.[sourceKey];
    if (!sourceType || !sourceErrors) return;

    // Validate emissions at different levels
    sourceType.units?.forEach((unit: any, unitIdx: number) => {
      // Units -> Fuels -> Emissions
      validateEmissionsForItems(
        unit.fuels,
        (fuel: any) => fuel.emissions,
        (fuelIdx) => (idx) =>
          sourceErrors.units?.[unitIdx]?.fuels?.[fuelIdx]?.emissions?.[idx],
      );
      // Units -> Emissions
      validateEmissionsArray(
        unit.emissions,
        (idx) => sourceErrors.units?.[unitIdx]?.emissions?.[idx],
      );
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
