import Facilities from "@reporting/src/app/components/reportInformation/Facilities/Facilities";

export default async function FacilitiesPage({
  version_id,
}: {
  version_id: number;
}) {
  return (
    <>
      <Facilities version_id={version_id} />
    </>
  );
}
