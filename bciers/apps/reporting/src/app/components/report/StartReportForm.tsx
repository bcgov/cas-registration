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
  reporting_year: number;
  operation_id: string;
  registration_purpose: string;
}

export default function StartReportForm({
  schema,
  uiSchema,
}: StartReportFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<StartReportFormData>>({});
  const [errorList, setErrorList] = useState([] as any[]);

  const handleSubmit = async (data: { formData?: StartReportFormData }) => {
    setErrorList([]);

    const payload = {
      operation_id: data.formData?.operation_id,
      reporting_year: data.formData?.reporting_year,
      registration_purpose: data.formData?.registration_purpose,
    };

    const response = await actionHandler(
      "reporting/create-report-for-reporting-year",
      "POST",
      "/reports/previous-years",
      {
        body: JSON.stringify(payload),
      },
    );

    if (response.error) {
      setErrorList([{ message: response.error }]);
      return;
    }

    router.push(`/reports/${response}/review-operation-information`);
  };

  return (
    <FormBase
      formData={formData}
      schema={schema}
      uiSchema={uiSchema}
      onChange={(data: any) => setFormData(data.formData)}
      onSubmit={handleSubmit}
    >
      {errorList.length > 0 &&
        errorList.map((e: any) => (
          <Alert key={e.message} severity="error">
            {e?.stack ?? e.message}
          </Alert>
        ))}

      <div className="flex justify-start gap-3 pt-6">
        <Button
          variant="outlined"
          onClick={() => router.back()}
          className="min-w-[82px] border-bc-blue px-6 py-2.5 text-bc-links hover:border-bc-primary-blue"
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          type="submit"
          className="min-w-[82px] bg-bc-blue px-6 py-2.5 hover:bg-bc-primary-blue"
        >
          Start
        </Button>
      </div>
    </FormBase>
  );
}
