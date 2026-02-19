import { describe, expect, it, test } from "vitest";
import {
  validateEmissionsMethodology,
  validateBiogenicTotalAllocated,
} from "./activityFormValidators";

const SOURCE_KEY = "gscUsefulEnergy";

// Helper to create base error structure
const createBaseErrorStructure = () => ({
  sourceTypes: {
    [SOURCE_KEY]: {
      __errors: [],
    },
  },
});

// Helper to create source types with a single emission nested under units -> fuels
const createSourceTypesWithEmission = (
  emission: object,
  sourceKey = SOURCE_KEY,
) => ({
  [sourceKey]: {
    units: [{ fuels: [{ emissions: [emission] }] }],
  },
});

// Helper to create error structure for units -> fuels -> emissions
const createUnitsWithFuelsErrorStructure = (emissionsCount = 1) => {
  const errors: any = createBaseErrorStructure();
  errors.sourceTypes[SOURCE_KEY].units = [
    {
      __errors: [],
      fuels: [
        {
          __errors: [],
          emissions: Array(emissionsCount)
            .fill(null)
            .map(() => ({ __errors: [] })),
        },
      ],
    },
  ];
  return errors;
};

// Helper to create error structure for units -> emissions (direct)
const createUnitsDirectEmissionsErrorStructure = () => {
  const errors: any = createBaseErrorStructure();
  errors.sourceTypes[SOURCE_KEY].units = [
    {
      __errors: [],
      emissions: [{ __errors: [] }],
    },
  ];
  return errors;
};

// Helper to create error structure for fuels -> emissions
const createFuelsErrorStructure = () => {
  const errors: any = createBaseErrorStructure();
  errors.sourceTypes[SOURCE_KEY].fuels = [
    {
      __errors: [],
      emissions: [{ __errors: [] }],
    },
  ];
  return errors;
};

// Helper to create error structure for direct emissions
const createDirectEmissionsErrorStructure = () => {
  const errors: any = createBaseErrorStructure();
  errors.sourceTypes[SOURCE_KEY].emissions = [{ __errors: [] }];
  return errors;
};

// Helper to create error structure for units -> fuels (no emissions)
const createUnitsWithFuelsNoEmissionsErrorStructure = () => {
  const errors: any = createBaseErrorStructure();
  errors.sourceTypes[SOURCE_KEY].units = [
    {
      __errors: [],
      fuels: [{ __errors: [] }],
    },
  ];
  return errors;
};

// Helper to create error structure for units -> fuels with empty emissions array
const createUnitsWithFuelsEmptyEmissionsErrorStructure = () => {
  const errors: any = createBaseErrorStructure();
  errors.sourceTypes[SOURCE_KEY].units = [
    {
      __errors: [],
      fuels: [{ __errors: [], emissions: [] }],
    },
  ];
  return errors;
};

describe("validateEmissionsMethodology", () => {
  describe("when gas type is selected and methodology is missing", () => {
    it("adds 'Select a Methodology' error for emissions in units -> fuels -> emissions", () => {
      const sourceTypes = createSourceTypesWithEmission({
        gasType: "CO2",
        methodology: { methodology: "" },
      });

      const errors = createUnitsWithFuelsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes[SOURCE_KEY].units[0].fuels[0].emissions[0]
          .methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("adds 'Select a Methodology' error for emissions in units -> emissions", () => {
      const sourceTypes = {
        [SOURCE_KEY]: {
          units: [{ emissions: [{ gasType: "CH4", methodology: {} }] }],
        },
      };

      const errors = createUnitsDirectEmissionsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes[SOURCE_KEY].units[0].emissions[0].methodology
          .methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("adds 'Select a Methodology' error for emissions in fuels -> emissions", () => {
      const sourceTypes = {
        [SOURCE_KEY]: {
          fuels: [
            {
              emissions: [
                { gasType: "N2O", methodology: { methodology: null } },
              ],
            },
          ],
        },
      };

      const errors = createFuelsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes[SOURCE_KEY].fuels[0].emissions[0].methodology
          .methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("adds 'Select a Methodology' error for emissions directly under source type", () => {
      const sourceTypes = {
        [SOURCE_KEY]: {
          emissions: [
            { gasType: "CO2", methodology: { methodology: undefined } },
          ],
        },
      };

      const errors = createDirectEmissionsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes[SOURCE_KEY].emissions[0].methodology.methodology
          .__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("handles multiple emissions with different gas types", () => {
      const sourceTypes = {
        [SOURCE_KEY]: {
          units: [
            {
              fuels: [
                {
                  emissions: [
                    { gasType: "CO2", methodology: { methodology: "" } },
                    { gasType: "CH4", methodology: { methodology: "" } },
                    { gasType: "N2O", methodology: {} },
                  ],
                },
              ],
            },
          ],
        },
      };

      const errors = createUnitsWithFuelsErrorStructure(3);
      validateEmissionsMethodology(sourceTypes, errors);

      const emissionsErrors =
        errors.sourceTypes[SOURCE_KEY].units[0].fuels[0].emissions;

      emissionsErrors.forEach((emissionError: any) => {
        expect(emissionError.methodology.methodology.__errors).toEqual([
          "Select a Methodology",
        ]);
      });
    });
  });

  describe("when error path is missing", () => {
    it("handles missing error path gracefully", () => {
      const sourceTypes = createSourceTypesWithEmission({
        gasType: "CO2",
        methodology: { methodology: "" },
      });

      const errors: any = {
        sourceTypes: {
          [SOURCE_KEY]: { __errors: [] },
        },
      };

      expect(() =>
        validateEmissionsMethodology(sourceTypes, errors),
      ).not.toThrow();
    });
  });

  describe("when handling multiple source types", () => {
    it("validates emissions across different source types", () => {
      const sourceTypes = {
        ...createSourceTypesWithEmission(
          { gasType: "CO2", methodology: { methodology: "" } },
          SOURCE_KEY,
        ),
        gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy: {
          fuels: [
            {
              emissions: [{ gasType: "CH4", methodology: { methodology: "" } }],
            },
          ],
        },
      };

      const errors: any = {
        sourceTypes: {
          [SOURCE_KEY]: {
            __errors: [],
            units: [
              {
                __errors: [],
                fuels: [{ __errors: [], emissions: [{ __errors: [] }] }],
              },
            ],
          },
          gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy: {
            __errors: [],
            fuels: [{ __errors: [], emissions: [{ __errors: [] }] }],
          },
        },
      };

      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes[SOURCE_KEY].units[0].fuels[0].emissions[0]
          .methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy
          .fuels[0].emissions[0].methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });
  });

  describe("edge cases", () => {
    it("handles null methodology object", () => {
      const sourceTypes = createSourceTypesWithEmission({
        gasType: "CO2",
        methodology: null,
      });

      const errors = createUnitsWithFuelsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes[SOURCE_KEY].units[0].fuels[0].emissions[0]
          .methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    test.each([
      [
        "handles missing emissions array",
        {
          [SOURCE_KEY]: {
            units: [{ fuels: [{}] }],
          },
        },
        createUnitsWithFuelsNoEmissionsErrorStructure(),
      ],
      [
        "handles empty emissions array",
        {
          [SOURCE_KEY]: {
            units: [{ fuels: [{ emissions: [] }] }],
          },
        },
        createUnitsWithFuelsEmptyEmissionsErrorStructure(),
      ],
    ])("%s", (_name, sourceTypes, errors) => {
      expect(() =>
        validateEmissionsMethodology(sourceTypes, errors),
      ).not.toThrow();
    });
  });
});

describe("validateBiogenicTotalAllocated", () => {
  describe("when lime recovery kiln is utilized", () => {
    test.each([
      // [description, chemicalPulpPercentage, limeRecoveredByKilnPercentage, expectError]
      ["total 110 (>100)", 60, 50, true],
      ["total 101", 51, 50, true],
      ["total 100 (exactly)", 60, 40, false],
      ["total 70 (<100)", 30, 40, true],
      ["string values summing >100", "60", "50", true],
      ["null/undefined both resolve to 0", null, undefined, false],
      ["floating point summing to 100 (33.33 + 66.67)", 33.33, 66.67, false],
      ["floating point exceeding 100 (50.5 + 50.5)", 50.5, 50.5, true],
      ["floating point under 100 (33.33 + 33.34)", 33.33, 33.34, true],
    ])(
      "%s",
      (
        _name,
        chemicalPulpPercentage,
        limeRecoveredByKilnPercentage,
        expectError,
      ) => {
        const formData: any = {
          biogenicIndustrialProcessEmissions: {
            doesUtilizeLimeRecoveryKiln: true,
            biogenicEmissionsSplit: {
              chemicalPulpPercentage,
              limeRecoveredByKilnPercentage,
            },
          },
        };

        const errors: any = { __errors: [] };
        validateBiogenicTotalAllocated(formData, errors);

        if (expectError) {
          expect(
            errors.biogenicIndustrialProcessEmissions.biogenicEmissionsSplit
              .totalAllocated.__errors,
          ).toContain("The total allocation must add up to 100%");
        } else {
          expect(errors.biogenicIndustrialProcessEmissions).toBeUndefined();
        }
      },
    );
  });

  describe("does not add error when", () => {
    test.each([
      [
        "doesUtilizeLimeRecoveryKiln is false",
        {
          doesUtilizeLimeRecoveryKiln: false,
          biogenicEmissionsSplit: {
            chemicalPulpPercentage: 60,
            limeRecoveredByKilnPercentage: 50,
          },
        },
      ],
      [
        "doesUtilizeLimeRecoveryKiln is undefined",
        {
          biogenicEmissionsSplit: {
            chemicalPulpPercentage: 60,
            limeRecoveredByKilnPercentage: 50,
          },
        },
      ],
      ["biogenicIndustrialProcessEmissions is missing", undefined],
      [
        "biogenicEmissionsSplit is missing",
        { doesUtilizeLimeRecoveryKiln: true },
      ],
    ])("%s", (_name, biogenicIndustrialProcessEmissions) => {
      const errors: any = { __errors: [] };
      validateBiogenicTotalAllocated(
        { biogenicIndustrialProcessEmissions },
        errors,
      );
      expect(errors.biogenicIndustrialProcessEmissions).toBeUndefined();
    });
  });
});
