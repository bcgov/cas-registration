"use client";
import { useState } from "react";
import { Alert } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import FormBase from "@bciers/components/form/FormBase";
import { Button } from "@mui/material";
import { getSession } from "next-auth/react";
import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  UserProfileFormData,
  UserProfilePartialFormData,
} from "@bciers/types/form/formData";
import { IDP } from "@bciers/utils/src/enums";

export const userSchema: RJSFSchema = {
  type: "object",
  required: ["first_name", "last_name", "phone_number", "position_title"],
  properties: {
    first_name: { type: "string", title: "First Name" },
    last_name: { type: "string", title: "Last Name" },
    phone_number: {
      type: "string",
      title: "Phone Number",
      format: "phone",
    },
    email: {
      type: "string",
      title: "Email Address",
      readOnly: true,
    },
    position_title: { type: "string", title: "Position Title" },
  },
};

// 📐 Interface: expected properties and their types for UserForm component

interface Props {
  formData?: UserProfilePartialFormData;
  isCreate: boolean;
  idp: string;
  contactId?: number | null;
}

export default function ProfileForm({
  formData,
  isCreate,
  idp,
  contactId,
}: Props) {
  // 🐜 To display errors
  const [errorList, setErrorList] = useState([] as any[]);

  // 🌀 Loading state for the Submit button
  const [isLoading, setIsLoading] = useState(false);
  // ✅ Success state for for the Submit button
  const [isSuccess, setIsSuccess] = useState(false);

  const emailHelpTextFirstClause = (
    <div>
      This email is used to log in. To change your login email, contact{" "}
      <a href="mailto:ghgregulator@gov.bc.ca">ghgregulator@gov.bc.ca</a>
    </div>
  );

  let emailHelpText: JSX.Element | null = null;

  if (!isCreate && idp === IDP.BCEIDBUSINESS) {
    if (contactId !== null && contactId !== undefined) {
      emailHelpText = (
        <>
          {emailHelpTextFirstClause}
          <div>
            To change the email you are contacted with, edit the email in your{" "}
            <a href={`administration/contacts/${contactId.toString()}`}>
              contact details page
            </a>
            .
          </div>
        </>
      );
    } else {
      emailHelpText = emailHelpTextFirstClause;
    }
  }

  // 👤 Use NextAuth.js hook to get information about the user's session
  //  Destructuring assignment from data property of the object returned by useSession()
  //
  // 🛠️ Function to update the session, without reloading the page
  const handleUpdate = async () => {
    // With NextAuth strategy: "jwt" , update() method will trigger a jwt callback where app_role will be augmented to the jwt and session objects
    await getSession();
    // const { update } = useSession();
    // await update({ trigger: "update" });
    // ✅ Set success state to true
    setIsSuccess(true);
    // 🕐 Wait for 3 second and then reset success state
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
    if (isCreate) {
      // 🛸 Redirect: after the update is complete, navigate to the dashboard
      window.location.href = "/dashboard";
    }
  };

  const userUiSchema = {
    "ui:FieldTemplate": FieldTemplate,
    phone_number: {
      "ui:widget": "PhoneWidget",
    },
    email: {
      "ui:help": emailHelpText,
    },
  };

  // 🛠️ Function to submit user form data to API
  const submitHandler = async (data: { formData?: UserProfileFormData }) => {
    //Set states
    setErrorList([]);
    setIsLoading(true);
    setIsSuccess(false);

    const session = await getSession();

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
        <Button
          variant="contained"
          type="submit"
          aria-disabled={isLoading}
          disabled={isLoading}
        >
          {isSuccess ? "✅ Success" : "Submit"}
        </Button>
      </div>
    </FormBase>
  );
}
