import Note from "@bciers/components/layout/Note";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

export const InternalDashboardHeader = () => (
  <>
    <Note>
    The BC Carbon Registry is established under the Greenhouse Gas Industrial Reporting and Control Act. The BC Carbon Registry enables the issuance, transfer and retirement of compliance units used to fulfill the compliance obligation of regulated operations under the Act, and supports the Province of British Columbia's annual commitment to have a carbon neutral public sector.
    </Note>
  </>
);


// Render the header component
export default async function DashboardHeader() {
  const role = await getSessionRole();
  const isExternalUser = !role.includes("cas_");

  return (
    <>
      {isExternalUser ? (<div></div>) : (
        <InternalDashboardHeader />
      )}
    </>
  );
}
