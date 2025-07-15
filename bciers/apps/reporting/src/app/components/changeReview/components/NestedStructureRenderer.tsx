import React from "react";
import { Box } from "@mui/material";
import { renderFieldChange, renderFieldChanges } from "./FieldRenderer";
import { generateDisplayLabel } from "@reporting/src/app/components/changeReview/utils/fieldUtils";
// Helper function to render emissions changes
export const renderEmissionsChanges = (
  oldEmissions: any[],
  newEmissions: any[],
): React.ReactNode => {
  const maxEmissions = Math.max(oldEmissions.length, newEmissions.length);

  if (maxEmissions === 0) return null;

  return (
    <>
      {Array.from({ length: maxEmissions }, (_, emissionIndex) => {
        const oldEmission = oldEmissions[emissionIndex];
        const newEmission = newEmissions[emissionIndex];

        if (!oldEmission && !newEmission) return null;

        return (
          <Box key={`emission-${emissionIndex}`} ml={4} mb={2}>
            <Box
              className="font-bold mb-2"
              sx={{ fontSize: "0.9rem", color: "#38598A" }}
            >
              Emission {emissionIndex + 1}
            </Box>

            {renderFieldChanges(oldEmission, newEmission, [])}
          </Box>
        );
      })}
    </>
  );
};
// Helper function to render fuels changes
export const renderFuelsChanges = (
  oldFuels: any[],
  newFuels: any[],
): React.ReactNode => {
  const maxFuels = Math.max(oldFuels.length, newFuels.length);

  if (maxFuels === 0) return null;

  return (
    <>
      {Array.from({ length: maxFuels }, (_, fuelIndex) => {
        const oldFuel = oldFuels[fuelIndex];
        const newFuel = newFuels[fuelIndex];

        if (!oldFuel && !newFuel) return null;

        return (
          <Box key={`fuel-${fuelIndex}`} ml={2} mb={2}>
            <Box
              className="font-bold mb-2"
              sx={{ fontSize: "1rem", color: "#38598A" }}
            >
              Fuel {fuelIndex + 1}
            </Box>

            {renderFieldChanges(oldFuel, newFuel, ["emissions"])}
            {renderEmissionsChanges(
              oldFuel?.emissions || [],
              newFuel?.emissions || [],
            )}
          </Box>
        );
      })}
    </>
  );
};
// Helper function to render units changes
export const renderUnitsChanges = (
  oldUnits: any[],
  newUnits: any[],
): React.ReactNode => {
  const maxUnits = Math.max(oldUnits.length, newUnits.length);

  return (
    <>
      {Array.from({ length: maxUnits }, (_, unitIndex) => {
        const oldUnit = oldUnits[unitIndex];
        const newUnit = newUnits[unitIndex];

        if (!oldUnit && !newUnit) return null;

        return (
          <Box key={`unit-${unitIndex}`} mb={3}>
            <Box
              className="font-bold mb-2"
              sx={{ fontSize: "1.1rem", color: "#38598A" }}
            >
              Unit {unitIndex + 1}
            </Box>

            {renderFieldChanges(oldUnit, newUnit, ["fuels", "emissions"])}
            {renderFuelsChanges(oldUnit?.fuels || [], newUnit?.fuels || [])}
            {renderEmissionsChanges(
              oldUnit?.emissions || [],
              newUnit?.emissions || [],
            )}
          </Box>
        );
      })}
    </>
  );
};

// Function to render nested source type changes (units -> fuels -> emissions)
export const renderNestedSourceTypeChanges = (
  sourceTypeData: any,
): React.ReactNode => {
  if (!sourceTypeData || typeof sourceTypeData !== "object") {
    return null;
  }

  return (
    <Box>
      {/* Render source type level fields (excluding units, fuels, emissions) */}
      {(sourceTypeData.fields || []).map((field: any) =>
        renderFieldChange(field, generateDisplayLabel(field.field), 0),
      )}

      {/* Render units */}
      {Object.entries(sourceTypeData.units || {}).map(
        ([unitIndex, unitData]) => {
          const typedUnitData = unitData as any;

          return (
            <Box key={`unit-${unitIndex}`} mb={3}>
              <Box
                className="font-bold mb-2"
                sx={{ fontSize: "1.1rem", color: "#38598A" }}
              >
                Unit {parseInt(unitIndex) + 1}
              </Box>

              {(typedUnitData.fields || []).map((field: any) =>
                renderFieldChange(field, generateDisplayLabel(field.field), 1),
              )}

              {Object.entries(typedUnitData.fuels || {}).map(
                ([fuelIndex, fuelData]) => {
                  const typedFuelData = fuelData as any;

                  return (
                    <Box key={`fuel-${fuelIndex}`} ml={2} mb={2}>
                      <Box
                        className="font-bold mb-2"
                        sx={{ fontSize: "1rem", color: "#38598A" }}
                      >
                        Fuel {parseInt(fuelIndex) + 1}
                      </Box>

                      {(typedFuelData.fields || []).map((field: any) =>
                        renderFieldChange(
                          field,
                          generateDisplayLabel(field.field),
                          2,
                        ),
                      )}

                      {Object.entries(typedFuelData.emissions || {}).map(
                        ([emissionIndex, emissionData]) => {
                          const typedEmissionData = emissionData as any;

                          return (
                            <Box
                              key={`emission-${emissionIndex}`}
                              ml={2}
                              mb={2}
                            >
                              <Box
                                className="font-bold mb-2"
                                sx={{ fontSize: "0.9rem", color: "#38598A" }}
                              >
                                Emission {parseInt(emissionIndex) + 1}
                              </Box>

                              {(typedEmissionData.fields || []).map(
                                (field: any) =>
                                  renderFieldChange(
                                    field,
                                    generateDisplayLabel(field.field),
                                    3,
                                  ),
                              )}
                            </Box>
                          );
                        },
                      )}
                    </Box>
                  );
                },
              )}

              {Object.entries(typedUnitData.emissions || {}).map(
                ([emissionIndex, emissionData]) => {
                  const typedEmissionData = emissionData as any;

                  return (
                    <Box key={`unit-emission-${emissionIndex}`} ml={2} mb={2}>
                      <Box
                        className="font-bold mb-2"
                        sx={{ fontSize: "0.9rem", color: "#38598A" }}
                      >
                        Emission {parseInt(emissionIndex) + 1}
                      </Box>

                      {(typedEmissionData.fields || []).map((field: any) =>
                        renderFieldChange(
                          field,
                          generateDisplayLabel(field.field),
                          3,
                        ),
                      )}
                    </Box>
                  );
                },
              )}
            </Box>
          );
        },
      )}
    </Box>
  );
};
