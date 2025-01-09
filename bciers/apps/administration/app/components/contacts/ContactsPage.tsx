import { ContactRow, ContactsSearchParams } from "./types";
import fetchContactsPageData from "./fetchContactsPageData";
import ContactsDataGrid from "./ContactsDataGrid";
import Note from "@bciers/components/layout/Note";
import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";

const ExternalContactsLayout = () => {
  return (
    <>
      <Note>
        <b>Note: </b>View the contacts of your operator, i.e. people who can
        represent the operator for GGIRCA purposes. Please keep the information
        up to date here.
      </Note>
      <h2 className="text-bc-primary-blue">Contacts</h2>

      <div className="text-right">
        <Link href={`/contacts/add-contact`}>
          <Button variant="contained">Add Contact</Button>
        </Link>
      </div>
    </>
  );
};

const InternalContactsLayout = () => {
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

// 🧩 Main component
export default async function ContactsPage({
  searchParams,
  isExternalUser = true,
}: Readonly<{
  searchParams: ContactsSearchParams;
  isExternalUser?: boolean;
}>) {
  const contacts: {
    rows: ContactRow[];
    row_count: number;
  } = await fetchContactsPageData(searchParams);

  if (!contacts) {
    return <div>No contacts data in database.</div>;
  }

  // Render the DataGrid component
  return (
    <>
      {isExternalUser ? <ExternalContactsLayout /> : <InternalContactsLayout />}
      <Suspense fallback={<Loading />}>
        <div className="mt-5">
          <ContactsDataGrid
            initialData={contacts}
            isExternalUser={isExternalUser}
          />
        </div>
      </Suspense>
    </>
  );
}
