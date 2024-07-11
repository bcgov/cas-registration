import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import { FacilitiesSearchParams } from "../../facilities/types";
import Facilities from "../../facilities/Facilities";
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

export default async function FacilitiesPage({
  operationId,
  searchParams,
}: Readonly<{
  operationId: string;
  searchParams: FacilitiesSearchParams;
}>) {
  return (
    <Suspense fallback={<Loading />}>
      <Facilities operationId={operationId} searchParams={searchParams} />
    </Suspense>
  );
}
