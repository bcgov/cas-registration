import { Suspense } from "react";
import { permanentRedirect } from "next/navigation";
import Loading from "@bciers/components/loading/SkeletonField";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";
import Link from "next/link";
import { auth } from "@/dashboard/auth";
import { actionHandler } from "@bciers/actions";
import { OperatorStatus, UserOperatorStatus } from "@bciers/utils/src/enums";
import getUserFullName from "@bciers/utils/src/getUserFullName";
import SelectOperator from "@/app/components/userOperators/SelectOperator";

export const getUserOperator = async () => {
  try {
    return await actionHandler(
      `registration/v1/user-operators/pending`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
};

export default async function MyOperatorPage() {
  const session = await auth();
  const userName = getUserFullName(session);
  const userOperator = await getUserOperator();
  const isNew = userOperator.is_new;
  const { status, id, operatorId, operatorStatus, operatorLegalName } =
    userOperator;
  if (status === UserOperatorStatus.APPROVED) {
    // Using permanentRedirect instead of redirect to avoid the double rendering bug
    // https://github.com/vercel/next.js/issues/57257
    return permanentRedirect(
      `/dashboard/select-operator/user-operator/${id}/1?title=${operatorLegalName}`,
    );
  }

  if (
    status === UserOperatorStatus.PENDING ||
    (operatorStatus === OperatorStatus.DRAFT && !isNew)
  ) {
    if (isNew) {
      return permanentRedirect(
        `/dashboard/select-operator/received/add-operator/${operatorId}?title=${operatorLegalName}`,
      );
    }
    return permanentRedirect(
      `/dashboard/select-operator/received/request-access/${operatorId}?title=${operatorLegalName}`,
    );
  }

  return (
    <>
      {/* Streaming to render UI parts in a client incrementally, as soon as possible */}
      <section className="text-center my-auto text-2xl flex flex-col gap-3 mx-auto">
        <p>
          Hi <b>{userName}!</b>
        </p>
        <p>Which operator would you like to log in to?</p>
      </section>
      <section className="text-center text-2xl flex flex-col">
        {/* slow-loading components (data-fetching) can be wrapped using the <Suspense/> component boundary until they’ve been rendered on the server */}
        <Suspense fallback={<Loading />}>
          <SelectOperator />
        </Suspense>
        <p>
          Don&apos;t see the operator?{" "}
          <Link
            href="/dashboard/select-operator/user-operator/create/1"
            className="underline hover:no-underline mr-2"
            style={{ color: BC_GOV_LINKS_COLOR }}
          >
            Add Operator
          </Link>
          instead
        </p>
      </section>
    </>
  );
}
