import { describe, expect, it } from "vitest";
import { validateEmissionsMethodology } from "./activityFormValidators";

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
                    emissions: [
                      {
                        __errors: [],
                      },
                    ],
                  },
                ],
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

      const errors: any = {
        sourceTypes: {
          gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
            __errors: [],
            units: [
              {
                __errors: [],
                emissions: [
                  {
                    __errors: [],
                  },
                ],
              },
            ],
          },
        },
      };

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

      const errors: any = {
        sourceTypes: {
          gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
            __errors: [],
            fuels: [
              {
                __errors: [],
                emissions: [
                  {
                    __errors: [],
                  },
                ],
              },
            ],
          },
        },
      };

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

      const errors: any = {
        sourceTypes: {
          gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
            __errors: [],
            emissions: [
              {
                __errors: [],
              },
            ],
          },
        },
      };

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
                    emissions: [
                      { __errors: [] },
                      { __errors: [] },
                      { __errors: [] },
                    ],
                  },
                ],
              },
            ],
          },
        },
      };

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

  describe("when gas type is selected and methodology is present", () => {
    it("does not add error when methodology is valid", () => {
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
                        methodology: "CEMS",
                      },
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
            units: [
              {
                __errors: [],
                fuels: [
                  {
                    __errors: [],
                    emissions: [
                      {
                        __errors: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      };

      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units[0]
          .fuels[0].emissions[0].methodology,
      ).toBeUndefined();
    });
  });

  describe("when gas type is not selected", () => {
    it("does not add error when gas type is missing", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  emissions: [
                    {
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
                    emissions: [
                      {
                        __errors: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      };

      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units[0]
          .fuels[0].emissions[0].methodology,
      ).toBeUndefined();
    });

    it("does not add error when gas type is empty string", () => {
      const sourceTypes = {
        gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
          units: [
            {
              fuels: [
                {
                  emissions: [
                    {
                      gasType: "",
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
                    emissions: [
                      {
                        __errors: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
      };

      validateEmissionsMethodology(sourceTypes, errors);

      expect(
        errors.sourceTypes.gscFuelOrWasteLinearFacilitiesUsefulEnergy.units[0]
          .fuels[0].emissions[0].methodology,
      ).toBeUndefined();
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
        },
      };

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

      const errors: any = {
        sourceTypes: {
          gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
            __errors: [],
            units: [
              {
                __errors: [],
                fuels: [{ __errors: [] }],
              },
            ],
          },
        },
      };

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

      const errors: any = {
        sourceTypes: {
          gscFuelOrWasteLinearFacilitiesUsefulEnergy: {
            __errors: [],
            units: [
              {
                __errors: [],
                fuels: [{ __errors: [], emissions: [] }],
              },
            ],
          },
        },
      };

      // Should not throw an error
      expect(() =>
        validateEmissionsMethodology(sourceTypes, errors),
      ).not.toThrow();
    });
  });
});
