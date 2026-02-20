import { describe, expect, it, test } from "vitest";
import {
  calculateMobileAnnualAmount,
  calculateBiogenicTotalAllocated,
} from "./customReportingActivityFormCalculations";

interface BiogenicFormData {
  biogenicIndustrialProcessEmissions?: {
    doesUtilizeLimeRecoveryKiln?: boolean;
    biogenicEmissionsSplit?: {
      chemicalPulpPercentage?: number | string | null;
      limeRecoveredByKilnPercentage?: number | string | null;
      totalAllocated?: number;
    };
  } | null;
}

describe("customReportingActivityFormCalculations", () => {
  it("calculates the annual fuel amount in mobile combustion form with each quarter", () => {
    const jsonForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [
            {
              q1FuelAmount: 1,
              q2FuelAmount: 2,
              q3FuelAmount: 3,
              q4FuelAmount: 4,
              annualFuelAmount: undefined,
            },
          ],
        },
      },
    };

    calculateMobileAnnualAmount(jsonForm);
    const fuel =
      jsonForm.sourceTypes.mobileFuelCombustionPartOfFacility.fuels[0];

    expect(fuel.annualFuelAmount).toBe(10);
  });

  it("calculates the annual fuel amount in mobile combustion form with filled quarters", () => {
    const jsonForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [
            {
              q1FuelAmount: 1,
              annualFuelAmount: undefined,
            },
          ],
        },
      },
    };

    calculateMobileAnnualAmount(jsonForm);
    const fuel =
      jsonForm.sourceTypes.mobileFuelCombustionPartOfFacility.fuels[0];
    expect(fuel.annualFuelAmount).toBe(1);
  });
});

describe("calculateBiogenicTotalAllocated", () => {
  describe("when lime recovery kiln is utilized", () => {
    test.each([
      // [description, chemicalPulpPercentage, limeRecoveredByKilnPercentage, expectedTotal]
      ["both values provided", 60, 40, 100],
      ["only chemical pulp amount", 75, null, 75],
      ["only lime recovered percentage", undefined, 50, 50],
      ["string values", "30", "70", 100],
      ["decimal values (33.33 + 66.67)", 33.33, 66.67, 100],
      ["both null/undefined", null, undefined, 0],
      ["partial values (40 + 35)", 40, 35, 75],
      ["existing totalAllocated is overwritten", 40, 35, 75],
    ])(
      "%s",
      (
        _name,
        chemicalPulpPercentage,
        limeRecoveredByKilnPercentage,
        expectedTotal,
      ) => {
        const formData: BiogenicFormData = {
          biogenicIndustrialProcessEmissions: {
            doesUtilizeLimeRecoveryKiln: true,
            biogenicEmissionsSplit: {
              chemicalPulpPercentage,
              limeRecoveredByKilnPercentage,
              totalAllocated: 999, // always set to confirm it gets overwritten
            },
          },
        };

        calculateBiogenicTotalAllocated(formData);

        expect(
          formData.biogenicIndustrialProcessEmissions?.biogenicEmissionsSplit
            ?.totalAllocated,
        ).toBe(expectedTotal);
      },
    );
  });

  describe("when lime recovery kiln is not utilized", () => {
    test.each([
      [
        "doesUtilizeLimeRecoveryKiln is false",
        {
          doesUtilizeLimeRecoveryKiln: false,
          biogenicEmissionsSplit: {
            chemicalPulpPercentage: 60,
            limeRecoveredByKilnPercentage: 40,
            totalAllocated: 100,
          },
        },
      ],
      [
        "doesUtilizeLimeRecoveryKiln is undefined",
        {
          biogenicEmissionsSplit: {
            chemicalPulpPercentage: 60,
            limeRecoveredByKilnPercentage: 40,
            totalAllocated: 100,
          },
        },
      ],
    ])(
      "%s — totalAllocated is removed",
      (_name, biogenicIndustrialProcessEmissions) => {
        const formData: BiogenicFormData = {
          biogenicIndustrialProcessEmissions,
        };

        calculateBiogenicTotalAllocated(formData);

        expect(
          formData.biogenicIndustrialProcessEmissions?.biogenicEmissionsSplit
            ?.totalAllocated,
        ).toBeUndefined();
      },
    );
  });

  describe("edge cases", () => {
    test.each([
      ["biogenicIndustrialProcessEmissions is missing", {}],
      [
        "biogenicIndustrialProcessEmissions is null",
        { biogenicIndustrialProcessEmissions: null },
      ],
    ])("does nothing when %s", (_name, formData) => {
      expect(() => calculateBiogenicTotalAllocated(formData)).not.toThrow();
    });
  });
});
