import Facilities from "../../facilities/facilities";
import { FacilitiesSearchParams } from "../../facilities/types";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: FacilitiesSearchParams;
}) {
  return (
    <>
      <Facilities searchParams={searchParams} />
    </>
  );
}
