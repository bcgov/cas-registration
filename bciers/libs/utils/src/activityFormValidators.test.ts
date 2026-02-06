import { describe, expect, it } from "vitest";
import { validateEmissionsMethodology } from "./activityFormValidators";

// Helper to create base error structure
const createBaseErrorStructure = () => ({
  sourceTypes: {
    gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
      __errors: [],
    },
  },
});

// Helper to create error structure for units -> fuels -> emissions
const createUnitsWithFuelsErrorStructure = (emissionsCount = 1) => {
  const errors: any = createBaseErrorStructure();
  errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units = [
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
  errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units = [
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
  errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.fuels = [
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
  errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.emissions = [
    { __errors: [] },
  ];
  return errors;
};

// Helper to create error structure for units -> fuels (no emissions)
const createUnitsWithFuelsNoEmissionsErrorStructure = () => {
  const errors: any = createBaseErrorStructure();
  errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units = [
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
  errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units = [
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
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  emissions: [
                    {
                      gasType: "CO2",
                      methodology: {
                        methodology: "",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const errors = createUnitsWithFuelsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units[0]
          .fuels[0].emissions[0].methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("adds 'Select a Methodology' error for emissions in units -> emissions", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              emissions: [
                {
                  gasType: "CH4",
                  methodology: {},
                },
              ],
            },
          ],
        },
      };

      const errors = createUnitsDirectEmissionsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units[0]
          .emissions[0].methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("adds 'Select a Methodology' error for emissions in fuels -> emissions", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          fuels: [
            {
              emissions: [
                {
                  gasType: "N2O",
                  methodology: {
                    methodology: null,
                  },
                },
              ],
            },
          ],
        },
      };

      const errors = createFuelsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.fuels[0]
          .emissions[0].methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("adds 'Select a Methodology' error for emissions directly under source type", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          emissions: [
            {
              gasType: "CO2",
              methodology: {
                methodology: undefined,
              },
            },
          ],
        },
      };

      const errors = createDirectEmissionsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy
          .emissions[0].methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("handles multiple emissions with different gas types", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  emissions: [
                    {
                      gasType: "CO2",
                      methodology: { methodology: "" },
                    },
                    {
                      gasType: "CH4",
                      methodology: { methodology: "" },
                    },
                    {
                      gasType: "N2O",
                      methodology: {},
                    },
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
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units[0]
          .fuels[0].emissions;

      expect(emissionsErrors[0].methodology.methodology.__errors).toEqual([
        "Select a Methodology",
      ]);
      expect(emissionsErrors[1].methodology.methodology.__errors).toEqual([
        "Select a Methodology",
      ]);
      expect(emissionsErrors[2].methodology.methodology.__errors).toEqual([
        "Select a Methodology",
      ]);
    });
  });

  describe("when error path is missing", () => {
    it("handles missing error path gracefully", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  emissions: [
                    {
                      gasType: "CO2",
                      methodology: { methodology: "" },
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const errors: any = {
        sourceTypes: {
          gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
            __errors: [],
          },
        },
      };

      // Should not throw an error
      expect(() =>
        validateEmissionsMethodology(sourceTypes, errors),
      ).not.toThrow();
    });
  });

  describe("when handling multiple source types", () => {
    it("validates emissions across different source types", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  emissions: [
                    {
                      gasType: "CO2",
                      methodology: { methodology: "" },
                    },
                  ],
                },
              ],
            },
          ],
        },
        gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy: {
          fuels: [
            {
              emissions: [
                {
                  gasType: "CH4",
                  methodology: { methodology: "" },
                },
              ],
            },
          ],
        },
      };

      const errors: any = {
        sourceTypes: {
          gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
            __errors: [],
            units: [
              {
                __errors: [],
                fuels: [
                  {
                    __errors: [],
                    emissions: [{ __errors: [] }],
                  },
                ],
              },
            ],
          },
          gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy: {
            __errors: [],
            fuels: [
              {
                __errors: [],
                emissions: [{ __errors: [] }],
              },
            ],
          },
        },
      };

      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units[0]
          .fuels[0].emissions[0].methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesWithoutUsefulEnergy
          .fuels[0].emissions[0].methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });
  });

  describe("edge cases", () => {
    it("handles null methodology object", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  emissions: [
                    {
                      gasType: "CO2",
                      methodology: null,
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const errors = createUnitsWithFuelsErrorStructure();
      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units[0]
          .fuels[0].emissions[0].methodology.methodology.__errors,
      ).toEqual(["Select a Methodology"]);
    });

    it("handles missing emissions array", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [{}],
            },
          ],
        },
      };

      const errors = createUnitsWithFuelsNoEmissionsErrorStructure();

      // Should not throw an error
      expect(() =>
        validateEmissionsMethodology(sourceTypes, errors),
      ).not.toThrow();
    });

    it("handles empty emissions array", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  emissions: [],
                },
              ],
            },
          ],
        },
      };

      const errors = createUnitsWithFuelsEmptyEmissionsErrorStructure();

      // Should not throw an error
      expect(() =>
        validateEmissionsMethodology(sourceTypes, errors),
      ).not.toThrow();
    });
  });
});
