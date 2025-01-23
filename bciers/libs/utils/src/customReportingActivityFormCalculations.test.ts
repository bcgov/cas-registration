import { calculateMobileAnnualAmount } from "./customReportingActivityFormCalculations";

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

  it("does not calculate the annual fuel amount in mobile combustion form without all quarters", () => {
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
    expect(fuel.annualFuelAmount).toBe(undefined);
  });
});
