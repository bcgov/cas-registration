import OperationDataGrid from "./OperationDataGrid";
import { OperationRow, OperationsSearchParams } from "./types";
import fetchOperationsPageData from "./fetchOperationsPageData";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Note from "@bciers/components/layout/Note";
import { auth } from "@/dashboard/auth";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Note>
      <b>Note:</b> View all the operations, which can be sorted or filtered by
      operator here.
    </Note>
    <h1>Operations</h1>
    {children}
  </>
);

export { Layout as InternalUserOperationsLayout };

export const ExternalUserOperationsLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <Layout>
    <div className="w-full flex justify-end">
      <Link className="link-button-blue" href={"operations/create/1"}>
        Add and Register an Operation
      </Link>
    </div>
    {children}
  </Layout>
);

// 🧩 Main component
export default async function Operations({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const session = await auth();

  const role = session?.user?.app_role;
  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(searchParams);
  if (!operations) {
    return <div>No operations data in database.</div>;
  }

  const isAuthorizedAdminUser =
    role?.includes("cas") && !role?.includes("pending");

  // Render the DataGrid component
  return (
    <Suspense fallback={<Loading />}>
      <div className="mt-5">
        <OperationDataGrid
          initialData={operations}
          isInternalUser={isAuthorizedAdminUser}
        />
      </div>
    </Suspense>
  );
}
