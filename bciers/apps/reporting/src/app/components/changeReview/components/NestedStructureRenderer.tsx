import React from "react";
import { Box } from "@mui/material";
import { renderFieldChange, renderFieldChanges } from "./FieldRenderer";
import { generateDisplayLabel } from "@reporting/src/app/components/changeReview/utils/fieldUtils";
import StatusLabel from "@bciers/components/form/fields/StatusLabel";
// Helper function to determine if all fields are new (added)
const isWholeAdded = (oldObj: any, newObj: any) => {
  // If object has fields, check if any field is added
  if (newObj?.fields && Array.isArray(newObj.fields)) {
    return newObj.fields.some(
      (f: any) => f.old_value == null && f.new_value != null,
    );
  }
  // Otherwise, consider whole object added if newObj exists
  return !oldObj && !!newObj;
};

const isWholeDeleted = (oldObj: any, newObj: any) => {
  // If object has fields, check if any field is deleted
  if (oldObj?.fields && Array.isArray(oldObj.fields)) {
    return oldObj.fields.some(
      (f: any) => f.old_value != null && f.new_value == null,
    );
  }
  // Otherwise, consider whole object deleted if oldObj exists but newObj does not
  return !!oldObj && !newObj;
};

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

        const added = isWholeAdded(oldEmission || {}, newEmission || {});
        const deleted = isWholeDeleted(oldEmission || {}, newEmission || {});

        return (
          <Box key={`emission-${emissionIndex}`} ml={4} mb={2}>
            <Box
              className="font-bold mb-2"
              sx={{ fontSize: "0.9rem", color: "#38598A" }}
            >
              Emission {emissionIndex + 1}{" "}
              {added && <StatusLabel type="added" />}{" "}
              {deleted && <StatusLabel type="deleted" />}
            </Box>
            {renderFieldChanges(oldEmission, newEmission, [])}
          </Box>
        );
      })}
    </>
  );
};

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

export const renderNestedSourceTypeChanges = (
  sourceTypeData: any,
): React.ReactNode => {
  if (!sourceTypeData || typeof sourceTypeData !== "object") return null;

  return (
    <Box>
      {/* Render source type fields */}
      {(sourceTypeData.fields || []).map((field: any) =>
        renderFieldChange(field, generateDisplayLabel(field.field), 0),
      )}

      {/* Render units */}
      {Object.entries(sourceTypeData.units || {}).map(
        ([unitIndex, unitData]) => {
          const typedUnitData = unitData as any;
          const unitAdded = isWholeAdded({}, typedUnitData);
          const unitDeleted = isWholeDeleted({}, typedUnitData);

          return (
            <Box key={`unit-${unitIndex}`} mb={3}>
              <Box
                className="font-bold mb-2"
                sx={{ fontSize: "1.1rem", color: "#38598A" }}
              >
                Unit {parseInt(unitIndex) + 1}{" "}
                {(unitAdded || unitDeleted) && (
                  <StatusLabel type={unitAdded ? "added" : "deleted"} />
                )}
              </Box>

              {(typedUnitData.fields || []).map((field: any) =>
                renderFieldChange(field, generateDisplayLabel(field.field), 1),
              )}

              {/* Fuels */}
              {Object.entries(typedUnitData.fuels || {}).map(
                ([fuelIndex, fuelData]) => {
                  const typedFuelData = fuelData as any;
                  const fuelAdded = isWholeAdded({}, typedFuelData);
                  const fuelDeleted = isWholeDeleted({}, typedFuelData);

                  return (
                    <Box key={`fuel-${fuelIndex}`} ml={2} mb={2}>
                      <Box
                        className="font-bold mb-2"
                        sx={{ fontSize: "1rem", color: "#38598A" }}
                      >
                        Fuel {parseInt(fuelIndex) + 1}{" "}
                        {(fuelAdded || fuelDeleted) && (
                          <StatusLabel type={fuelAdded ? "added" : "deleted"} />
                        )}
                      </Box>

                      {(typedFuelData.fields || []).map((field: any) =>
                        renderFieldChange(
                          field,
                          generateDisplayLabel(field.field),
                          2,
                        ),
                      )}

                      {/* Emissions */}
                      {Object.entries(typedFuelData.emissions || {}).map(
                        ([emissionIndex, emissionData]) => {
                          const typedEmissionData = emissionData as any;

                          const emissionAdded = isWholeAdded(
                            {},
                            typedEmissionData,
                          );
                          const emissionDeleted = isWholeDeleted(
                            {},
                            typedEmissionData,
                          );

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
                                Emission {parseInt(emissionIndex) + 1}{" "}
                                {(emissionAdded || emissionDeleted) && (
                                  <StatusLabel
                                    type={emissionAdded ? "added" : "deleted"}
                                  />
                                )}
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
            </Box>
          );
        },
      )}
    </Box>
  );
};
