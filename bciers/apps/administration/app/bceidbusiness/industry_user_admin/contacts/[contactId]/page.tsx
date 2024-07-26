import Contact from "@/administration/app/components/contacts/Contact";

export default function Page({
  params: { contactId },
}: Readonly<{ params: { contactId: string } }>) {
  return <Contact contactId={contactId} />;
}
