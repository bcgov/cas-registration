import { FacilityRow, FacilitiesSearchParams } from "./types";
import FacilityDataGrid from "./FacilityDataGrid";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import fetchFacilitiesPageData from "./fetchFacilitiesPageData";
import Link from "next/link";
import { Button } from "@mui/material";
import Note from "@bciers/components/layout/Note";

const Layout = () => (
  <>
    <Note>
      <b>Note: </b>View the facilities of this operation here.
    </Note>
    <h2 className="text-bc-primary-blue">Facilities</h2>
  </>
);

export { Layout as InternalUserLayout };

export const ExternalUserLayout = () => (
  <>
    <Layout />
    <div className="text-right">
      <Link href="#">
        <Button variant="contained">Add Facility</Button>
      </Link>
    </div>
  </>
);

// 🧩 Main component
export default async function Facilities({
  operationId,
  searchParams,
}: Readonly<{
  operationId: string;
  searchParams: FacilitiesSearchParams;
}>) {
  const facilities: {
    rows: FacilityRow[];
    row_count: number;
  } = await fetchFacilitiesPageData(operationId, searchParams);

  if (!facilities) {
    return <div>No facilities data in database.</div>;
  }

  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <FacilityDataGrid operationId={operationId} initialData={facilities} />
      </div>
    </Suspense>
  );
}
