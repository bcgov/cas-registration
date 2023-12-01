"use client";

import Form from "./FormBase";
import { RJSFSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { Alert } from "@mui/material";
import SubmitButton from "./SubmitButton";
import { actionHandler } from "@/app/utils/actions";
import { UserFormData } from "@/app/components/form/formDataTypes";
import { signIn, useSession } from "next-auth/react";
import { keycloakSessionLogOut } from "@/app/utils/auth/actions";

// 📐 Interface: expected properties and their types for UserForm component
interface UserFormProps {
  schema: RJSFSchema;
  formData?: UserFormData;
  isCreate: boolean;
}

// 🏗️ Client side component user form
export default function UserForm({
  schema,
  formData,
  isCreate,
}: UserFormProps) {
  // 👤 Use NextAuth.js hook to get information about the user's session
  //  Destructuring assignment from data property of the object returned by useSession()
  const { data: session } = useSession();

  // 🐛 To display errors
  const [errorList, setErrorList] = useState([] as any[]);
  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (data: { formData?: UserFormData }) => {
    //Set states
    setErrorList([]);
    setIsLoading(true);
    setIsSuccess(false);
    // 🚀 API call: POST/PUT user form data
    const response = await actionHandler(
      isCreate
        ? `registration/user/${session?.user?.user_guid}/${session?.identity_provider}`
        : `registration/user`,
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
      // 🛸 Routing: logout to login for new app_role
      keycloakSessionLogOut();
      signIn("keycloak", undefined, {
        kc_idp_hint: session?.identity_provider || "",
      });
    }
    // ✅ Set success state to true
    setIsSuccess(true);
    // 🕐 Wait for 1 second and then reset success state
    setTimeout(() => {
      setIsSuccess(false);
    }, 1000);
  };
  return (
    <Form
      schema={schema}
      validator={validator}
      showErrorList={false}
      formData={formData}
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
    </Form>
  );
}
