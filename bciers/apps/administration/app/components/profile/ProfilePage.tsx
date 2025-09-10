import { actionHandler, getToken } from "@bciers/actions";
import {
  UserProfileFormData,
  UserProfilePartialFormData,
} from "@bciers/types/form/formData";
import { auth } from "@/dashboard/auth";
import getUserFullName from "@bciers/utils/src/getUserFullName";
import UserForm from "@/administration/app/components/profile/ProfileForm";
import { IDP } from "@bciers/utils/src/enums";

// 🚀 API call: GET user's data
async function getUserFormData(): Promise<
  UserProfileFormData | { error: string }
> {
  return actionHandler(`registration/user/user-profile`, "GET", "");
}
// 🚀 API call: GET user's Contact data
async function getUserContactData(): Promise<number | { error: string }> {
  return actionHandler(`registration/contact/`, "GET", "");
}

// 🏗️ Async server component: dashboard\profile
// Gets session user's data from API then rendered to client side form
export default async function UserPage() {
  // determines POST or PUT based on formData.error.includes("404")
  let isCreate = false;
  // get user's data
  let formData: UserProfilePartialFormData | { error: string } =
    await getUserFormData();

  // Handle error case
  if ("error" in formData) {
    return (
      <div>{`Server Error: ${formData.error}. Please try again later.`}</div>
    );
  }

  // If formData has error or is empty, populate from session
  if (Object.keys(formData).length === 0) {
    // No user found, create formData to reflect new user in user table
    isCreate = true;
    // 👤 Use NextAuth.js hook to get information about the user's session
    /* When calling from the server-side i.e., in Route Handlers, React Server Components, API routes,
     */
    const session = await auth();
    const names = getUserFullName(session)?.split(" ");
    formData = {
      first_name: names?.[0],
      last_name: names?.[1],
      email: session?.user?.email ?? undefined,
    };
  }

  // if applicable, retrieve the user's contact data
  let contactId: number | null = null;
  // need to get token to determine identity_provider
  const token = await getToken();

  console.log(`identity provider ${token.identity_provider}`);

  if (token.identity_provider === IDP.BCEIDBUSINESS && !isCreate) {
    const contactResponse = await getUserContactData();

    if (typeof contactResponse === "object" && "error" in contactResponse) {
      return (
        <div>{`Server Error: failed to retrieve contact data. ${contactResponse.error}`}</div>
      );
    }
    // if no error, this is a number
    contactId = contactResponse;
  }

  // Render the UserForm with the formData values
  return (
    <UserForm
      formData={formData}
      isCreate={isCreate}
      idp={token.identity_provider}
      contactId={contactId}
    />
  );
}
