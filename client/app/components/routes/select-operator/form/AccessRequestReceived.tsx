import Link from "next/link";
import { BC_GOV_LINKS_COLOR } from "@/app/styles/colors";
import { fetchAPI } from "@/utils/api";
import { Operator } from "@/app/components/routes/select-operator/form/types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

// 📚 runtime mode for dynamic data to allow build w/o api
export const runtime = "edge";

export async function getOperator(id: number) {
  try {
    return await fetchAPI(`registration/operators/${id}`);
  } catch (e) {
    return null;
  }
}

export default async function AccessRequestReceived({
  params,
}: {
  params: { id: number };
}) {
  const operator: Operator = await getOperator(params.id);

  if (!operator) {
    return <div>Server Error. Please try again later.</div>;
  }
  return (
    <section className="text-center my-60 text-2xl flex flex-col gap-3">
      <span>
        <CheckCircleIcon sx={{ color: "#2E8540", fontSize: 50 }} />
      </span>
      <p>
        Your request to access <b>{operator.legal_name}</b> as its administrator
        has been received.
      </p>
      <p>
        We will review your request as soon as possible. Once approved, you will
        receive a confirmation email.
      </p>
      <p>
        You can then log back in using your Business BCeID with full
        permissions.
      </p>
      <Link
        href="#"
        className="underline hover:no-underline"
        style={{ color: BC_GOV_LINKS_COLOR }}
      >
        Have not received the confirmation email yet?
      </Link>
    </section>
  );
}
