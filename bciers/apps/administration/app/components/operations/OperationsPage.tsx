import { OperationRow } from "@/administration/app/components/operations/types";
import { OperationsSearchParams } from "@bciers/types/operations";
import OperationsDataGrid from "@/administration/app/components/operations/OperationsDataGrid";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { fetchOperationsPageData } from "@bciers/actions/api";

import AlertNote from "@bciers/components/form/components/AlertNote";
import { BC_GOV_TEXT } from "@bciers/styles";
import { InfoRounded } from "@mui/icons-material";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: OperationsSearchParams;
}) {
  const role = await getSessionRole();
  const isInternalUser = role.includes("cas_");

  // IRC users should only see Registered operations
  const filteredSearchParams = isInternalUser
    ? { ...searchParams, operation__status: "Registered" }
    : searchParams;

  // Fetch operations data
  const operations: {
    rows: OperationRow[];
    row_count: number;
  } = await fetchOperationsPageData(filteredSearchParams);
  if (!operations || "error" in operations)
    throw new Error("Failed to retrieve operations");

  const operationsWithoutContacts = operations.rows // this filter lists operations that are Registered but have no contacts(reps) assigned
    .filter(
      (operation) =>
        operation.operation__status === "Registered" &&
        (!operation.operation__contact_ids ||
          (operation.operation__contact_ids.length === 1 &&
            operation.operation__contact_ids[0] === null)),
    )
    .map((operation) => operation.operation__name);

  const shouldShowMissingContactsAlert =
    !isInternalUser && operationsWithoutContacts.length > 0;

  const missingContactsAlert = shouldShowMissingContactsAlert ? (
    <div className="min-h-[48px] box-border mt-4">
      <AlertNote
        alertType="ALERT"
        icon={<InfoRounded fontSize="inherit" sx={{ color: BC_GOV_TEXT }} />}
      >
        Missing Information: Please add an operation representative for{" "}
        {operationsWithoutContacts.join(", ")} in{" "}
        {operationsWithoutContacts.length > 1 ? "their" : "its"} operation
        information page.
      </AlertNote>
    </div>
  ) : null;

  const addAndRegisterOperationLink = !isInternalUser ? (
    <div className="w-full flex justify-end pb-6">
      <a
        className="link-button-blue"
        href="../registration/register-an-operation"
      >
        Add and Register an Operation
      </a>
    </div>
  ) : null;

  return (
    <>
      {missingContactsAlert}
      <h2 className="text-bc-primary-blue">Operations</h2>
      {addAndRegisterOperationLink}
      <OperationsDataGrid
        filteredSearchParams={filteredSearchParams}
        isInternalUser={isInternalUser}
        initialData={operations}
      />
    </>
  );
}
