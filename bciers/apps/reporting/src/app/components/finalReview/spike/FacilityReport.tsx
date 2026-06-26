import { ActivityReviewSection } from "./ActivityReviewSection";

interface Props {
  title: string;
  facilityData: any;
}

export const FinalReviewFacilityReport: React.FC<Props> = ({
  title,
  facilityData,
}) => {
  const cardTitle = `Report Information - ${title}`;

  return (
    <>
      <h2>{cardTitle}</h2>
      <ActivityReviewSection activityData={facilityData.activity_data} />
    </>
  );
};
