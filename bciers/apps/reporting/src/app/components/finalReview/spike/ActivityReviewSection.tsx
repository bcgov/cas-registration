import { Table, TableBody, TableRow } from "@mui/material";
import { FinalReviewCard } from "./FinalReviewSection";
import { DataCell, LabelCell } from "./FinalReviewTable";
import React from "react";
import { activityHeaderStyle } from "./styles";

const mappings: Record<string, string> = {
  unitName: "Unit Name",
  gscUnitName: "Unit Name",
  gscUnitType: "Unit Type",
  gscUnitDescription: "Unit Description",
  fuelDescription: "Fuel Description",
  annualFuelAmount: "Annual Fuel Amount",
  fuelType: "Fuel Type",
  fuelClassification: "Fuel Classification",
};
const camelToTitleCase = (str: string) => {
  return (
    str.charAt(0).toUpperCase() +
    str
      .slice(1)
      .replace(/([A-Z])/g, " $1")
      .trim()
  );
};
const mapFieldLabel = (fieldLabel: string) => {
  return mappings[fieldLabel] || camelToTitleCase(fieldLabel);
};
const byLabel = (order: string[]) => {
  const reverseOrder = [...order].reverse();
  return (a: [string, unknown], b: [string, unknown]) => {
    const aIndex = reverseOrder.indexOf(a[0]);
    const bIndex = reverseOrder.indexOf(b[0]);
    if ((aIndex === -1 && bIndex === -1) || aIndex === bIndex) return 0;
    if (aIndex > bIndex) return -1;
    return 1;
  };
};

const renderFieldList = (fieldList: [string, unknown][]) => {
  if (fieldList.length === 0) return null;

  return (
    <Table size="small">
      <TableBody>
        {fieldList.map(([k, v], index) => {
          if (k === "divider")
            return (
              <TableRow
                key={`actfield-${k}-${index}`}
                style={{ height: "1em" }}
              />
            );
          return (
            <TableRow key={`actfield-${k}-${index}`}>
              <LabelCell variant="compact" label={mapFieldLabel(k) || ""} />
              <DataCell
                variant="compact"
                data={JSON.stringify(v).replace(/(^"|"$)/g, "")}
              />
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

const excludeFromEntries = (keys: string[]) => {
  return (entry: [string, unknown]) => {
    return !keys.includes(entry[0]);
  };
};

const EmissionView: React.FC<{ index: number; data: any }> = ({
  index,
  data,
}) => {
  const emissionFields = Object.entries(data).filter(
    excludeFromEntries(["methodology"]),
  );
  const methodologyFields = Object.entries(data.methodology)
    .filter(excludeFromEntries(["_field_display_titles"]))
    .sort(byLabel(["methodology"]))
    .map(([label, value]) => {
      if (data.methodology._field_display_titles)
        return [
          data.methodology._field_display_titles[label] ||
            camelToTitleCase(label),
          value,
        ] as [string, unknown];
      return [camelToTitleCase(label), value] as [string, unknown];
    });

  return (
    <div
      style={{
        margin: "1em 0 1em 4em",
        paddingLeft: "1em",
        border: "1px solid #013366",
        borderLeft: "5px solid #013366",
        padding: "5px",
      }}
    >
      <h4 style={{ ...activityHeaderStyle, margin: "0.5em", border: "none" }}>
        Emission {index + 1}: {data.gasType}
      </h4>
      {renderFieldList([
        ...emissionFields,
        ["divider", null],
        ...methodologyFields,
      ])}
    </div>
  );
};

const FuelView: React.FC<{ index: number; data: any }> = ({ index, data }) => {
  const fuelFields: [string, unknown][] = [
    ...Object.entries(data).filter(
      excludeFromEntries(["emissions", "fuelType"]),
    ),
    ["fuelType", data.fuelType.fuelName || ("Unknown Fuel Type" as unknown)],
    [
      "fuelClassification",
      data.fuelType.fuelClassification ||
        ("Unknown Fuel Classification" as unknown),
    ],
  ];
  const sortedFuelFields = fuelFields.sort(
    byLabel(["fuelType", "fuelClassification"]),
  );

  const emissions = data.emissions || [];

  return (
    <>
      <h4
        style={{
          ...activityHeaderStyle,
          marginLeft: "2em",
        }}
      >
        Fuel {index + 1}: {data.fuelType.fuelName}
      </h4>
      {renderFieldList(sortedFuelFields)}
      {emissions.map((emission: any, index: number) => (
        <EmissionView
          key={"emissionview" + index}
          index={index}
          data={emission}
        />
      ))}
    </>
  );
};

const UnitView: React.FC<{ index: number; data: any }> = ({ index, data }) => {
  const unitFields = Object.entries(data).filter(
    excludeFromEntries(["fuels", "emissions"]),
  );

  const fuels = data.fuels || [];
  const emissions = data.emissions || [];

  return (
    <>
      <h4 style={activityHeaderStyle}>Unit {index + 1}</h4>
      {renderFieldList(unitFields)}
      {fuels.map((fuel: any, index: number) => (
        <FuelView key={"fuelview" + index} index={index} data={fuel} />
      ))}
      {emissions.map((emission: any, index: number) => (
        <EmissionView
          key={"emissionview" + index}
          index={index}
          data={emission}
        />
      ))}
    </>
  );
};

const SourceTypeView: React.FC<{ name: string; data: any }> = ({
  name,
  data,
}) => {
  const sourceTypeFields = Object.entries(data).filter(
    excludeFromEntries(["units", "fuels", "emissions"]),
  );

  const units = data.units || [];
  const fuels = data.fuels || [];
  const emissions = data.emissions || [];

  return (
    <>
      <h3 style={{ color: "#013366", marginTop: "2px" }}>{name}</h3>
      {renderFieldList(sourceTypeFields)}
      {units.map((unit: any, index: number) => (
        <UnitView key={"unitview" + index} index={index} data={unit} />
      ))}
      {fuels.map((fuel: any, index: number) => (
        <FuelView key={"fuelview" + index} index={index} data={fuel} />
      ))}
      {emissions.map((emission: any, index: number) => (
        <EmissionView
          key={"emissionview" + index}
          index={index}
          data={emission}
        />
      ))}
    </>
  );
};

const ActivityView: React.FC<{ activityData: any }> = ({ activityData }) => {
  const activityFields = Object.entries(activityData).filter(
    excludeFromEntries(["activity", "source_types"]),
  );

  const sourceTypes = Object.entries(activityData.source_types || {});

  return (
    <FinalReviewCard title={activityData.activity}>
      {activityFields.length > 0 && renderFieldList(activityFields)}

      {sourceTypes.map(([stName, stData]) => (
        <SourceTypeView key={"stview" + stName} name={stName} data={stData} />
      ))}
    </FinalReviewCard>
  );
};

interface Props {
  activityData: Record<string, any>;
}

export const ActivityReviewSection: React.FC<Props> = ({ activityData }) => {
  const activities = Object.values(activityData);

  return (
    <>
      {activities.map((activity, index) => (
        <ActivityView key={activity.activity + index} activityData={activity} />
      ))}
    </>
  );
};
