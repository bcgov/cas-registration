import Link from "next/link";
import Note from "@bciers/components/layout/Note";

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

export { Layout as InternalUserOperationDataGridLayout };

export const ExternalUserOperationDataGridLayout = ({
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
