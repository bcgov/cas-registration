import { describe, expect, it } from "vitest";
import {
  calculateMobileAnnualAmount,
  calculateBiogenicTotalAllocated,
} from "./customReportingActivityFormCalculations";

interface BiogenicFormData {
  biogenicIndustrialProcessEmissions?: {
    doesUtilizeLimeRecoveryKiln?: boolean;
    scheduleC?: {
      chemicalPulpAmount?: number | string | null;
      limeRecoveredByKilnAmount?: number | string | null;
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
    it("calculates total allocation correctly with both values", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
          scheduleC: {
            chemicalPulpAmount: 60,
            limeRecoveredByKilnAmount: 40,
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(100);
    });

    it("calculates total allocation with only chemical pulp amount", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
          scheduleC: {
            chemicalPulpAmount: 75,
            limeRecoveredByKilnAmount: null,
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(75);
    });

    it("calculates total allocation with only lime recovered amount", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
          scheduleC: {
            chemicalPulpAmount: undefined,
            limeRecoveredByKilnAmount: 50,
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(50);
    });

    it("handles string values correctly", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
          scheduleC: {
            chemicalPulpAmount: "30",
            limeRecoveredByKilnAmount: "70",
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(100);
    });

    it("handles decimal values correctly", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
          scheduleC: {
            chemicalPulpAmount: 33.33,
            limeRecoveredByKilnAmount: 66.67,
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(100);
    });

    it("sets total to 0 when both values are null or undefined", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
          scheduleC: {
            chemicalPulpAmount: null,
            limeRecoveredByKilnAmount: undefined,
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(0);
    });

    it("initializes totalAllocated if it doesn't exist", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
          scheduleC: {
            chemicalPulpAmount: 50,
            limeRecoveredByKilnAmount: 30,
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(80);
    });
  });

  describe("when lime recovery kiln is not utilized", () => {
    it("sets total to 0 when doesUtilizeLimeRecoveryKiln is false", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: false,
          scheduleC: {
            chemicalPulpAmount: 60,
            limeRecoveredByKilnAmount: 40,
            totalAllocated: 100,
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(0);
    });

    it("sets total to 0 when doesUtilizeLimeRecoveryKiln is undefined", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          scheduleC: {
            chemicalPulpAmount: 60,
            limeRecoveredByKilnAmount: 40,
            totalAllocated: 100,
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(0);
    });
  });

  describe("edge cases", () => {
    it("does nothing when biogenicIndustrialProcessEmissions is missing", () => {
      const formData: BiogenicFormData = {};

      // Should not throw an error
      expect(() => calculateBiogenicTotalAllocated(formData)).not.toThrow();
    });

    it("does nothing when biogenicIndustrialProcessEmissions is null", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: null,
      };

      // Should not throw an error
      expect(() => calculateBiogenicTotalAllocated(formData)).not.toThrow();
    });

    it("does nothing when scheduleC is missing but lime kiln is used", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
        },
      };

      // Should not throw an error
      expect(() => calculateBiogenicTotalAllocated(formData)).not.toThrow();
    });

    it("updates existing totalAllocated value", () => {
      const formData: BiogenicFormData = {
        biogenicIndustrialProcessEmissions: {
          doesUtilizeLimeRecoveryKiln: true,
          scheduleC: {
            chemicalPulpAmount: 40,
            limeRecoveredByKilnAmount: 35,
            totalAllocated: 999, // Old value should be overwritten
          },
        },
      };

      calculateBiogenicTotalAllocated(formData);

      expect(
        formData.biogenicIndustrialProcessEmissions?.scheduleC?.totalAllocated,
      ).toBe(75);
    });
  });
});
