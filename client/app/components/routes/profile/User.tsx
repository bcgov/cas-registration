import { actionHandler } from "@/app/utils/actions";
import { userSchema } from "@/app/utils/jsonSchema/user";
import UserForm from "@/app/components/routes/profile/form/UserForm";
import { UserFormData } from "@/app/components/form/formDataTypes";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 🚀 API call: GET user's data
async function getUserFormData(): Promise<UserFormData | { error: string }> {
  return actionHandler(`registration/user-profile`, "GET", "");
}

// 🏗️ Async server component for route: dashboard\profile
// Gets session user's data from API then rendered to client side form
export default async function User() {
  // determines POST or PUT based on formData.error.includes("404")
  let isCreate = false;
  // get user's data
  let formData: UserFormData | { error: string } = await getUserFormData();
  if ("error" in formData) {
    if (formData.error.includes("404")) {
      // No user found, create formData to reflect new user in user table
      isCreate = true;
      // 👤 Use NextAuth.js hook to get information about the user's session
      /* When calling from the server-side i.e., in Route Handlers, React Server Components, API routes,
       * getServerSession requires passing the same object you would pass to NextAuth
       */
      const session = await getServerSession(authOptions);
      const names = session?.user?.name?.split(" ");
      formData = {
        first_name: names?.[0] ?? "", // Use nullish coalescing here
        last_name: names?.[1] ?? "", // Use nullish coalescing here
        email: session?.user?.email || "",
        phone_number: "",
        position_title: "",
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
