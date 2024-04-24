import OperatorsPage from "@/app/components/routes/operators/OperatorsPage";
import { OperatorsSearchParams } from "@/app/components/userOperators/types";

export default async function Page({
  searchParams,
}: {
  searchParams: OperatorsSearchParams;
}) {
  return <OperatorsPage searchParams={searchParams} />;
}
