import PersonResponsible from "@reporting/src/app/components/operations/PersonResponsible";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  return <PersonResponsible version_id={params.version_id} />;
}
