import Note from "@bciers/components/layout/Note";
import NewTabBanner from "@bciers/components/layout/NewTabBanner";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

export const InternalOperationsHeader = () => (
  <>
    <Note>
      <b>Note:</b> View all the operations, which can be sorted or filtered by
      operator here.
    </Note>
  </>
);

export const ExternalOperationsHeader = () => (
  <>
    <Note>
      <b>Note:</b> View the operations owned by your operator here.
    </Note>
  </>
);

// Render the header component
export default async function OperationsHeader() {
  const role = await getSessionRole();
  const isExternalUser = !role.includes("cas_");

  return (
    <>
      <NewTabBanner />
      {isExternalUser ? (
        <ExternalOperationsHeader />
      ) : (
        <InternalOperationsHeader />
      )}
    </>
  );
}
