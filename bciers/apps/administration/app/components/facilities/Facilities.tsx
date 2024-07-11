import { FacilityRow, FacilitiesSearchParams } from "./types";
import FacilityDataGrid from "./FacilityDataGrid";
import fetchFacilitiesPageData from "./fetchFacilitiesPageData";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Link from "next/link";
import { Button } from "@mui/material";
import Note from "@bciers/components/layout/Note";

const FacilitiesLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Note>
      <b>Note: </b>View the facilities of this operation here.
    </Note>
    <h2 className="text-bc-primary-blue">Facilities</h2>
    {children}
  </>
);

export { FacilitiesLayout as InternalUserFacilitiesLayout };

export const ExternalUserFacilitiesLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <>
    <FacilitiesLayout>
      <div className="text-right">
        <Link href="#">
          <Button variant="contained">Add Facility</Button>
        </Link>
      </div>
    </FacilitiesLayout>
    {children}
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
