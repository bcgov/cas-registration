import Link from "next/link";
import { Button } from "@mui/material";
import { Suspense } from "react";
import Loading from "@bciers/components/loading/SkeletonGrid";
import Note from "@bciers/components/layout/Note";
import Contacts from "../../contacts/Contacts";
import { ContactsSearchParams } from "../../contacts/types";

export default async function ContactsPage({
  searchParams,
  isExternalUser,
}: Readonly<{ searchParams: ContactsSearchParams; isExternalUser: boolean }>) {
  const noteMsg = isExternalUser
    ? "View the contacts of your operator, i.e. people who can represent the operator for GGIRCA purposes. Please keep the information up to date here."
    : "View all the contacts, which can be sorted or filtered by operator here."; // for now, we are not showing the operator filter
  return (
    <>
      <Note>
        <b>Note: </b>
        {noteMsg}
      </Note>
      <h2 className="text-bc-primary-blue">Contacts</h2>
      {/* Conditionally render the button based on user's role */}
      {isExternalUser && (
        <div className="text-right">
          <Link href="#">
            <Button variant="contained">Add Contact</Button>
          </Link>
        </div>
      )}

      <Suspense fallback={<Loading />}>
        <Contacts searchParams={searchParams} isExternalUser={isExternalUser} />
      </Suspense>
    </>
  );
}
