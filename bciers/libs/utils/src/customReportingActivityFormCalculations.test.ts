import { describe, expect, it, test } from "vitest";
import {
  calculateMobileAnnualAmount,
  calculateBiogenicTotalAllocated,
  clearMobileFuelAmountsOnFuelClear,
  type BiogenicFormData,
  type MobileCombustionFormData,
} from "./customReportingActivityFormCalculations";

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
    } satisfies MobileCombustionFormData;

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
    } satisfies MobileCombustionFormData;

    calculateMobileAnnualAmount(jsonForm);
    const fuel =
      jsonForm.sourceTypes.mobileFuelCombustionPartOfFacility.fuels[0];
    expect(fuel.annualFuelAmount).toBe(1);
  });
});

describe("clearMobileFuelAmountsOnFuelClear", () => {
  it("clears all fuel amounts when fuelName transitions from a value to empty", () => {
    const prevForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [{ fuelType: { fuelName: "Natural Gas" } }],
        },
      },
    } satisfies MobileCombustionFormData;
    const jsonForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [
            {
              fuelType: { fuelName: "" },
              q1FuelAmount: 10,
              q2FuelAmount: 20,
              q3FuelAmount: 30,
              q4FuelAmount: 40,
              annualFuelAmount: 100,
            },
          ],
        },
      },
    } satisfies MobileCombustionFormData;

    clearMobileFuelAmountsOnFuelClear(jsonForm, prevForm);
    const fuel =
      jsonForm.sourceTypes.mobileFuelCombustionPartOfFacility.fuels[0];

    expect(fuel.q1FuelAmount).toBeUndefined();
    expect(fuel.q2FuelAmount).toBeUndefined();
    expect(fuel.q3FuelAmount).toBeUndefined();
    expect(fuel.q4FuelAmount).toBeUndefined();
    expect(fuel.annualFuelAmount).toBeUndefined();
  });

  it("does not clear amounts when fuelName is present", () => {
    const prevForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [{ fuelType: { fuelName: "Natural Gas" } }],
        },
      },
    } satisfies MobileCombustionFormData;
    const jsonForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [
            {
              fuelType: { fuelName: "Natural Gas" },
              q1FuelAmount: 10,
              q2FuelAmount: 20,
              q3FuelAmount: 30,
              q4FuelAmount: 40,
              annualFuelAmount: 100,
            },
          ],
        },
      },
    } satisfies MobileCombustionFormData;

    clearMobileFuelAmountsOnFuelClear(jsonForm, prevForm);
    const fuel =
      jsonForm.sourceTypes.mobileFuelCombustionPartOfFacility.fuels[0];

    expect(fuel.q1FuelAmount).toBe(10);
    expect(fuel.q2FuelAmount).toBe(20);
    expect(fuel.q3FuelAmount).toBe(30);
    expect(fuel.q4FuelAmount).toBe(40);
    expect(fuel.annualFuelAmount).toBe(100);
  });

  it("does not clear amounts when fuelName was never set (user typing without selecting fuel)", () => {
    const prevForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [{ fuelType: { fuelName: "" } }],
        },
      },
    } satisfies MobileCombustionFormData;
    const jsonForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [
            {
              fuelType: { fuelName: "" },
              q1FuelAmount: 10,
            },
          ],
        },
      },
    } satisfies MobileCombustionFormData;

    clearMobileFuelAmountsOnFuelClear(jsonForm, prevForm);
    const fuel =
      jsonForm.sourceTypes.mobileFuelCombustionPartOfFacility.fuels[0];

    expect(fuel.q1FuelAmount).toBe(10);
  });

  it("only clears the fuel whose fuelName was explicitly cleared", () => {
    const prevForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [
            { fuelType: { fuelName: "Propane" } },
            { fuelType: { fuelName: "Diesel" } },
          ],
        },
      },
    } satisfies MobileCombustionFormData;
    const jsonForm = {
      sourceTypes: {
        mobileFuelCombustionPartOfFacility: {
          fuels: [
            {
              fuelType: { fuelName: "" },
              q1FuelAmount: 5,
              annualFuelAmount: 5,
            },
            {
              fuelType: { fuelName: "Diesel" },
              q1FuelAmount: 15,
              annualFuelAmount: 15,
            },
          ],
        },
      },
    } satisfies MobileCombustionFormData;

    clearMobileFuelAmountsOnFuelClear(jsonForm, prevForm);
    const fuels = jsonForm.sourceTypes.mobileFuelCombustionPartOfFacility.fuels;

    expect(fuels[0].q1FuelAmount).toBeUndefined();
    expect(fuels[0].annualFuelAmount).toBeUndefined();
    expect(fuels[1].q1FuelAmount).toBe(15);
    expect(fuels[1].annualFuelAmount).toBe(15);
  });

  it("does nothing and does not throw when fuels are missing", () => {
    const jsonForm = {
      sourceTypes: { mobileFuelCombustionPartOfFacility: {} },
    };
    expect(() => clearMobileFuelAmountsOnFuelClear(jsonForm, {})).not.toThrow();
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
