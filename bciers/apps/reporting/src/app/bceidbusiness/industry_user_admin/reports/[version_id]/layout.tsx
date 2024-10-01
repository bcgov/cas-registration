"use client";

import React, {
  ReactElement,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";

import { usePathname, useRouter } from "next/navigation";
import {
  FormContext,
  FormContextProvider,
  useFormContext,
} from "@reporting/src/app/bceidbusiness/industry_user_admin/reports/[version_id]/FormContext";
import { Report } from "@mui/icons-material";

const ReportsLayout = ({ children }: { children: ReactElement }) => {
  const router = useRouter();
  console.log(JSON.stringify(router));

  const {
    taskList,
    formData,
    formSchema,
    formUiSchema,
    formSubmitHandler,
    setFormData,
  } = useFormContext();

  console.log(taskList, formData, formSchema, formUiSchema);

  const pathname = usePathname();

  return (
    <MultiStepFormWithTaskList
      initialStep={0}
      steps={[
        "Operation Information",
        "Facilities Information",
        "Compliance Summary",
        "Sign-off & Submit",
      ]}
      taskListElements={taskList}
      schema={formSchema}
      uiSchema={formUiSchema}
      formData={formData}
      baseUrl={"/reports"}
      cancelUrl={"/reports"}
      onChange={({ formData }) => setFormData(formData)}
      onSubmit={formSubmitHandler}
      children={children}
    />
  );
};

export default function ReportLayoutWithContext({
  children,
}: {
  children: ReactElement;
}) {
  return (
    <FormContextProvider>
      <ReportsLayout children={children} />
    </FormContextProvider>
  );
}
