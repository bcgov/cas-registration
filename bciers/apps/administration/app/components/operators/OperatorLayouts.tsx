import Note from "@bciers/components/layout/Note";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Note>
      <b>Note:</b> View all the operators here.
    </Note>
    <h1>Operators</h1>
    {children}
  </>
);

export { Layout as InternalUserOperatorDataGridLayout };

export const ExternalUserOperatorDataGridLayout = ({
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
        Change an operator
      </a>
    </div>
    {children}
  </Layout>
);
