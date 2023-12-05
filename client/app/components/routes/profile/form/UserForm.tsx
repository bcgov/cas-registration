"use client";
import { useState } from "react";
import FormBase from "@/app/components/form/FormBase";
import { Alert } from "@mui/material";
import SubmitButton from "@/app/components/form/SubmitButton";
import { actionHandler } from "@/app/utils/actions";
import { UserFormData } from "@/app/components/form/formDataTypes";
import { userSchema, userUiSchema } from "@/app/utils/jsonSchema/user";
import { useSession, signOut } from "next-auth/react";

// 📐 Interface: expected properties and their types for UserForm component
interface UserFormProps {
  formData?: UserFormData;
  isCreate: boolean;
}

// 🏗️ Client side component: dashboard\profile
export default function UserForm({ formData, isCreate }: UserFormProps) {
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);

  // 👤 Use NextAuth.js hook to get information about the user's session
  //  Destructuring assignment from data property of the object returned by useSession()
  const { data: session } = useSession();
  const idp = session?.identity_provider || "";

  // 🛠️ Function to signout\signin new user
  const handleSignOut = async () => {
    await fetch(`/api/auth/logout`, { method: "GET" });
    await signOut({
      callbackUrl: `/api/auth/signin/keycloak?kc_idp_hint=${idp}`,
    });
  };

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (data: { formData?: UserFormData }) => {
    //Set states
    setErrorList([]);
    setIsLoading(true);
    setIsSuccess(false);
    // 🚀 API call: POST/PUT user form data
    const response = await actionHandler(
      isCreate
        ? `registration/user-profile/${idp}`
        : `registration/user-profile`,
      isCreate ? "POST" : "PUT",
      "",
      {
        body: JSON.stringify(data.formData),
      },
    );
    // 🛑 Set loading to false after the API call is completed
    setIsLoading(false);

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }
    if (isCreate) {
      // 🛸 Routing: logout to re-login to apply new role to NextAuth JWT
      await handleSignOut();
    }
    // ✅ Set success state to true
    setIsSuccess(true);
    // 🕐 Wait for 1 second and then reset success state
    setTimeout(() => {
      setIsSuccess(false);
    }, 1000);
  };

  return (
    <FormBase
      className="[&>div>fieldset]:min-h-[40vh]"
      formData={formData}
      schema={userSchema}
      uiSchema={userUiSchema}
      onSubmit={submitHandler}
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e?.stack ?? e.message}
          </Alert>
        ))}
      <div className="flex justify-end gap-3">
        {/* Disable the button when loading or when success state is true */}
        <SubmitButton
          label={isSuccess ? "✅ Success" : "Submit"}
          disabled={isLoading || isSuccess}
        />
      </div>
    </FormBase>
  );
}
