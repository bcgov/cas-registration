import { ContactRow, ContactsSearchParams } from "./types";
import fetchContactsPageData from "./fetchContactsPageData";
import ContactDataGrid from "./ContactDataGrid";

// 🧩 Main component
export default async function Contacts({
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
    <div className="mt-5">
      <ContactDataGrid initialData={contacts} isExternalUser={isExternalUser} />
    </div>
  );
}
