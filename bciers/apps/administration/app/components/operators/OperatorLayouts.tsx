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

export { Layout as InternalOperatorDataGridLayout };
