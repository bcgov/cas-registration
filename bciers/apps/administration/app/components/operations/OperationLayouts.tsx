import Note from "@bciers/components/layout/Note";
import { Alert } from "@mui/material";

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
  operationsWithoutContacts,
  children,
}: {
  operationsWithoutContacts: String[];
  children: React.ReactNode;
}) => (
  <>
    <Note>
      <b>Note:</b> View the operations owned by your operator here.
    </Note>

    <div className="min-h-[48px] box-border mt-4">
      {operationsWithoutContacts && operationsWithoutContacts.length > 0 && (
        <Alert severity="info" color="warning">
          Missing Information: Please add an operation representative for{" "}
          {operationsWithoutContacts.join(", ")} in{" "}
          {operationsWithoutContacts.length > 1 ? "their" : "its"} operation
          information page.
        </Alert>
      )}
    </div>
    <h1>Operations</h1>
    <div className="w-full flex justify-end">
      <a
        className="link-button-blue"
        href="../registration/register-an-operation"
      >
        Add and Register an Operation
      </a>
    </div>
    {children}
  </>
);
