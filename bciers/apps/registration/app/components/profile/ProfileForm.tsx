"use client";
import { useState } from "react";
import { Alert } from "@mui/material";
import { actionHandler } from "@bciers/actions/server";
import FormBase from "@bciers/components/form/FormBase";
import SubmitButton from "@bciers/components/form/SubmitButton";
import {
  UserProfileFormData,
  UserProfilePartialFormData,
} from "@bciers/components/form/formDataTypes";
import { userSchema, userUiSchema } from "@bciers/utils/server";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// 📐 Interface: expected properties and their types for UserForm component

interface Props {
  formData?: UserProfilePartialFormData;
  isCreate: boolean;
}

export default function ProfileForm({ formData, isCreate }: Props) {
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);

  // 👤 Use NextAuth.js hook to get information about the user's session
  //  Destructuring assignment from data property of the object returned by useSession()
  const { data: session, update } = useSession();
  const idp = session?.identity_provider || "";
  const router = useRouter();
  // 🛠️ Function to update the session, without reloading the page
  const handleUpdate = async () => {
    // With NextAuth strategy: "jwt" , update() method will trigger a jwt callback where app_role will be augmented to the jwt and session objects
    await update();
    // ✅ Set success state to true
    setIsSuccess(true);
    // 🕐 Wait for 3 second and then reset success state
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
    if (isCreate) {
      // 🛸 Routing: after the update is complete, navigate to the dashboard
      router.push("/dashboard");
    }
  };

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (data: { formData?: UserProfileFormData }) => {
    //Set states
    setErrorList([]);
    setIsLoading(true);
    setIsSuccess(false);
    // 🚀 API call: POST/PUT user form data
    const response = await actionHandler(
      isCreate ? `registration/users` : `registration/user/user-profile`,
      isCreate ? "POST" : "PUT",
      "/profile",
      {
        body: JSON.stringify({
          ...data.formData,
          business_guid: session?.user?.bceid_business_guid,
          bceid_business_name: session?.user?.bceid_business_name,
          identity_provider: idp,
        }),
      },
    );
    // 🛑 Set loading to false after the API call is completed
    setIsLoading(false);

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    // Apply new data to NextAuth JWT
    await handleUpdate();
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
          disabled={isLoading}
        />
      </div>
    </FormBase>
  );
}
