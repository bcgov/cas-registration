import { Table, TableBody, TableRow } from "@mui/material";
import { FinalReviewCard } from "./FinalReviewSection";
import { DataCell, LabelCell } from "./FinalReviewTable";

const renderFieldList = (fieldList: [string, unknown][]) => {
  if (fieldList.length === 0) return null;

  return (
    <Table size="small">
      <TableBody>
        {fieldList.map(([k, v], index) => (
          <TableRow key={`actfield-${k}-${index}`}>
            <LabelCell label={k || ""} />
            <DataCell data={JSON.stringify(v)} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const excludeFromEntries = (keys: string[]) => {
  return (entry: [string, unknown]) => {
    return !keys.includes(entry[0]);
  };
};

const UnitView: React.FC<{ index: number; data: any }> = ({ index, data }) => {
  const unitFields = Object.entries(data).filter(
    excludeFromEntries(["fuels", "emissions"]),
  );

  const fuels = data.fuels || [];
  const emissions = data.emissions || [];

  return (
    <>
      <h4>Unit {index + 1}</h4>
      {renderFieldList(unitFields)}
      {JSON.stringify(fuels, null, 2)}
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
      <h4>{name}</h4>
      {renderFieldList(sourceTypeFields)}
      {units.map((unit: any, index: number) => (
        <UnitView key={"unitview" + index} index={index} data={unit} />
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
