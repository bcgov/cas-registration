export interface ActivityFormProps {
  reportVersionId: number;
  facilityId: number;
  activityData: {
    activityId: number;
    sourceTypeMap: { [key: number]: string };
  };
  reportDate: string;
}
