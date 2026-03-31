import type { ReactNode } from "react";
import ReportingPageHeading from "@reporting/src/app/components/layout/ReportingPageHeading";

export default async function ReportingVersionLayout(
  props: Readonly<{
    children: ReactNode;
    params: Promise<{ version_id: string }>;
  }>,
) {
  const params = await props.params;
  const { children } = props;

  return (
    <>
      <ReportingPageHeading version_id={+params.version_id} />
      {children}
    </>
  );
}
