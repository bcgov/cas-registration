import Note from "@bciers/components/layout/Note";
import Link from "next/link";
import { Button } from "@mui/material";
import NewTabBanner from "@bciers/components/layout/NewTabBanner";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";

const ExternalContactsHeader = () => {
  return (
    <>
      <Note>
        <b>Note: </b>View the contacts of your operator, i.e. people who can
        represent the operator for GGIRCA purposes. Please keep the information
        up to date here.
      </Note>
      <h2 className="text-bc-primary-blue">Contacts</h2>

      <div className="text-right">
        <Link href={"/contacts/add-contact"}>
          <Button variant="contained">Add Contact</Button>
        </Link>
      </div>
    </>
  );
};

const InternalContactsHeader = () => {
  return (
    <>
      <Note>
        <b>Note: </b>View all the contacts, which can be sorted or filtered by
        operator here.
      </Note>
      <h2 className="text-bc-primary-blue">Contacts</h2>
    </>
  );
};

// Render the header component
export default async function ContactsHeader() {
  const role = await getSessionRole();
  const isExternalUser = !role.includes("cas_");

  return (
    <>
      <NewTabBanner />
      {isExternalUser ? <ExternalContactsHeader /> : <InternalContactsHeader />}
    </>
  );
}
