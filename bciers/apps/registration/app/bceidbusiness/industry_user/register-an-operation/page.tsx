// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability

import OperationRegistrationPage from "@/registration/app/components/operations/OperationRegistrationPage";
import { UUID } from "crypto";

export default async function Page({
  params,
  searchParams,
}: {
  params: Readonly<{ operation: UUID; step: string }>;
  searchParams: any;
}) {
  return (
    <>
      <OperationRegistrationPage
        step={1}
        operation={params?.operation}
        searchParams={searchParams}
      />
    </>
  );
}
