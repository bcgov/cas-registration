import { actionHandler } from "@bciers/actions/server";
import {
  UserProfileFormData,
  UserProfilePartialFormData,
} from "@bciers/components/form/formDataTypes";
import { auth } from "@/dashboard/auth";
import getUserFullName from "@bciers/utils/getUserFullName";
import UserForm from "@/registration/app/components/profile/ProfileForm";

// 🚀 API call: GET user's data
async function getUserFormData(): Promise<
  UserProfileFormData | { error: string }
> {
  return actionHandler(`registration/user/user-profile`, "GET", "");
}

// 🏗️ Async server component: dashboard\profile
// Gets session user's data from API then rendered to client side form
export default async function UserPage() {
  // determines POST or PUT based on formData.error.includes("404")
  let isCreate = false;
  // get user's data
  let formData: UserProfilePartialFormData | { error: string } =
    await getUserFormData();
  if ("error" in formData) {
    if (formData.error.includes("Not Found")) {
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
    } else {
      return (
        <div>{`Server Error: ${formData.error}. Please try again later.`}</div>
      );
    }
  }
  // Render the UserForm with the formData values
  return <UserForm formData={formData} isCreate={isCreate} />;
}
