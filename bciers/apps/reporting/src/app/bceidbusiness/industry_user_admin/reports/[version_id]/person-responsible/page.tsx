import PersonResponsibleForm from "@reporting/src/app/components/person-responsible/PersonResponsibleForm";
import { ReportVersionPageProps } from "@reporting/src/app/utils/types";

export default async function Page({
  params,
}: {
  params: ReportVersionPageProps;
}) {
  return <PersonResponsibleForm {...params} />;
}
