"use client";
import { BC_GOV_LINKS_COLOR } from "@bciers/styles/colors";
import Link from "next/link";
import getUserFullName from "@bciers/utils/getUserFullName";

import Form from "@bciers/components/form/FormBase";
import { useState } from "react";
import { Alert } from "@mui/material";
import { useRouter } from "next/navigation";
import { actionHandler } from "@bciers/actions";
import { SelectOperatorFormData } from "@/administration/app/components/userOperators/types";
import { selectOperatorUiSchema } from "@/administration/app/data/jsonSchema/selectOperator";
import { selectOperatorSchema } from "@/administration/app/data/jsonSchema/selectOperator";

import { useSession } from "next-auth/react";
export default function Page() {
  const { data: session } = useSession();
  const names = getUserFullName(session)?.split(" ");
  const { push } = useRouter();
  const [errorList, setErrorList] = useState([] as any[]);

  return (
    <>
      <section className="text-center my-auto text-2xl flex flex-col gap-3 mx-auto">
        <p>
          Hi{" "}
          <b>
            {names?.[0]} {names?.[1]}!
          </b>
        </p>
        <p>Which operator would you like to log in to?</p>
      </section>
      <section className="text-center text-2xl flex flex-col">
        <Form
          schema={selectOperatorSchema}
          onSubmit={async (data: { formData?: SelectOperatorFormData }) => {
            const queryParam = `?${data.formData?.search_type}=${
              data.formData?.[
                data.formData?.search_type as keyof SelectOperatorFormData
              ]
            }`;

            const response = await actionHandler(
              `registration/operators${queryParam}`,
              "GET",
              "/select-operator",
            );

            if (response.error) {
              setErrorList([{ message: response.error }]);
              return;
            }
            // If the response is an array, we want the first element
            let operatorId;
            let operatorLegalName;
            if (response.length > 0) {
              operatorId = response[0].id;
              operatorLegalName = response[0].legal_name;
            } else {
              operatorId = response.id;
              operatorLegalName = response.legal_name;
            }
            push(
              `/select-operator/confirm/${operatorId}?title=${operatorLegalName}`,
            );
          }}
          uiSchema={selectOperatorUiSchema}
          className="mx-auto"
        >
          {errorList.length > 0 &&
            errorList.map((e: any) => (
              <Alert key={e.message} severity="error">
                {e.message}
              </Alert>
            ))}
          <></>
        </Form>
        <p>
          Don&apos;t see the operator?{" "}
          <Link
            href="/select-operator/add-user-operator"
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
