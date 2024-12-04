import PersonResponsibleForm from "@reporting/src/app/components/operations/personResponsible/PersonResponsibleForm";

export default function Page({ params }: { params: { version_id: number } }) {
  return <PersonResponsibleForm version_id={params.version_id} />;
}
