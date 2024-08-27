// import CancelIcon from "@mui/icons-material/Cancel";
// import Link from "next/link";
// import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";
import { Operator } from "../userOperators/types";
// import SelectOperatorConfirmForm from "./SelectOperatorConfirmForm";

import getOperator from "../operators/getOperator";

// import getOperatorHasAdmin from "../operators/getOperatorHasAdmin";
// import getOperatorAccessDeclined from "../operators/getOperatorAccessDeclined";

// export default async function SelectOperatorConfirmPage({
//   params,
// }: Readonly<{
//   params: { id: string };
// }>) {
//   const operator: Operator | { error: string } = await getOperator(params.id);
//   const hasAdmin: boolean | { error: string } = await getOperatorHasAdmin(
//     params.id,
//   );
//   const accessDeclined: boolean | { error: string } =
//     await getOperatorAccessDeclined(params.id);

//   if (accessDeclined) {
//     const declinedHasAdminJSX: JSX.Element = (
//       <>
//         <p>
//           Your access request was declined by an Administrator of{" "}
//           <b>{(operator as Operator).legal_name}</b>
//         </p>
//         <p className="text-center">
//           If you believe this is an error and you should be granted access,
//           please contact the administrator of{" "}
//           <b>{(operator as Operator).legal_name}</b>
//         </p>
//       </>
//     );

//     const declinedNoAdminJSX: JSX.Element = (
//       <>
//         <p>
//           Your Administrator access request to be the Operation Representative
//           of <b>{(operator as Operator).legal_name}</b> was declined.
//         </p>
//         <p className="text-center">
//           If you believe this is an error and you should be granted access,
//           please email us at <br />
//           <a
//             href="mailto:GHGRegulator@gov.bc.ca"
//             className="text-black font-bold no-underline"
//           >
//             GHGRegulator@gov.bc.ca
//           </a>
//         </p>
//       </>
//     );
//     return (
//       <section className="text-center my-auto text-2xl flex flex-col gap-3">
//         <span>
//           <CancelIcon sx={{ color: "#FF0000", fontSize: 50 }} />
//         </span>
//         {hasAdmin ? declinedHasAdminJSX : declinedNoAdminJSX}
//         <span className="text-sm">
//           <Link
//             href="/select-operator"
//             className="underline hover:no-underline text-sm"
//             style={{ color: BC_GOV_LINKS_COLOR }}
//           >
//             Select another operator
//           </Link>
//         </span>
//       </section>
//     );
//   }

//   if (
//     "error" in operator ||
//     (typeof hasAdmin !== "boolean" && "error" in hasAdmin)
//   ) {
//     return <div>Server Error. Please try again later.</div>;
//   }

//   return <SelectOperatorConfirmForm hasAdmin={hasAdmin} operator={operator} />;
// }
import getContact from "../contacts/getContact";
import ContactForm from "../contacts/ContactForm";
import { contactsUiSchema } from "../../data/jsonSchema/contact";
import { ContactFormData, UserOperatorUser } from "../contacts/types";
import getUserOperatorUsers from "../contacts/getUserOperatorUsers";
import { createContactSchema } from "../contacts/createContactSchema";
import Note from "@bciers/components/layout/Note";
import { auth } from "@/dashboard/auth";
import { FrontEndRoles } from "@bciers/utils/enums";

// 🧩 Main component
export default async function SelectOperatorConfirmPage({
  id,
}: Readonly<{ id?: string }>) {
  let contactFormData: ContactFormData | { error: string } = {};
  const isCreating: boolean = !id;
  let userOperatorUsers: UserOperatorUser[] | { error: string } = [];
  const operator: Operator | { error: string } = await getOperator(params.id);
  if (id) {
    contactFormData = await getContact(id);
    if ("error" in contactFormData) {
      return (
        <div>
          <h3>Contact Information Not Found</h3>
          <p>
            Sorry, we couldn&apos;t find the contact information you were
            looking for.
          </p>
        </div>
      );
    }
  }

  const noteMsg = isCreating
    ? "Once added, this new contact can be selected wherever needed or applicable."
    : "View or update information of this contact here.";

  // To get the user's role from the session
  const session = await auth();
  const role = session?.user?.app_role ?? "";

  return (
    <>
      <Note>
        <b>Note: </b>
        {noteMsg}
      </Note>
    </>
  );
}
