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
      <a
        className="link-button-blue"
        href="../registration/register-an-operation"
      >
        Add and Register an Operation
      </a>
    </div>
    {children}
  </Layout>
);
