"use client";

import { useState } from "react";
import { Alert, Button } from "@mui/material";
import { actionHandler } from "@bciers/actions";
import FormBase from "@bciers/components/form/FormBase";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { useRouter } from "next/navigation";

interface StartReportFormProps {
  schema: RJSFSchema;
  uiSchema: UiSchema;
}

interface StartReportFormData {
  reporting_year?: number;
  reporting_operation?: string;
}

export default function StartReportForm({
  schema,
  uiSchema,
}: StartReportFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<StartReportFormData>({});
  const [errorList, setErrorList] = useState([] as any[]);

  const submitHandler = async (data: { formData?: StartReportFormData }) => {
    setErrorList([]);

    const response = await actionHandler(
      "reporting/reports/start",
      "POST",
      "/reports/start",
      {
        body: JSON.stringify({
          reporting_year: data.formData?.reporting_year,
          operation_id: data.formData?.reporting_operation,
        }),
      },
    );

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    window.location.href = `/reports/${response.report_version_id}`;
  };

  return (
    <FormBase
      formData={formData}
      schema={schema}
      uiSchema={uiSchema}
      onChange={(data: any) => setFormData(data.formData)}
      onSubmit={submitHandler}
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e?.stack ?? e.message}
          </Alert>
        ))}

      <div className="flex justify-between pt-6">
        <Button
          variant="outlined"
          onClick={() => router.back()}
          className="min-w-[120px] border-bc-blue py-2.5 text-bc-links hover:border-bc-primary-blue"
        >
          Back
        </Button>

        <Button
          variant="contained"
          type="submit"
          className="min-w-[120px] bg-bc-blue py-2.5 hover:bg-bc-primary-blue"
        >
          Start Report
        </Button>
      </div>
    </FormBase>
  );
}
