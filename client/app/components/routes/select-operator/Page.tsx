import { Suspense } from "react";
import { redirect } from "next/navigation";
import Loading from "@/app/components/loading/SkeletonField";
import SelectOperator from "@/app/components/routes/select-operator/form/SelectOperator";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { actionHandler } from "@/app/utils/actions";
import { Status } from "@/app/utils/enums";
import { getUserFullName } from "@/app/utils/getUserFullName";

const getUserOperatorStatus = async () => {
  try {
    return await actionHandler(
      `registration/user-operator-status-from-user`,
      "GET",
      "",
    );
  } catch (error) {
    throw error;
  }
};

const getUserOperatorId = async () => {
  try {
    return await actionHandler(`registration/user-operator-id`, "GET", "");
  } catch (error) {
    throw error;
  }
};

export default async function MyOperatorPage() {
  const session = await getServerSession(authOptions);
  const userName = getUserFullName(session);

  const userOperatorIdResponse = await getUserOperatorId();
  const userOperatorId = userOperatorIdResponse?.user_operator_id;

  const { status } = await getUserOperatorStatus();

  const isRedirectToForm =
    status === Status.APPROVED || status === Status.PENDING;

  if (isRedirectToForm) {
    redirect(`/dashboard/select-operator/user-operator/${userOperatorId}/1`);
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
