import PersonResponsibleForm from "@reporting/src/app/components/person-responsible/PersonResponsibleForm";

export default async function Page({
  params,
}: {
  params: { version_id: number };
}) {
  return PersonResponsibleForm(params);
}
