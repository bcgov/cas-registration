import {
  djangoApiSlice,
  useAddNewOperationMutation,
  useGetNaicsCodesQuery,
} from "@/redux";

import validator from "@rjsf/validator-ajv8";
import Form from "@rjsf/mui";
import { operationSchema, operationUiSchema } from "@/jsonSchema/operations";
import { useState } from "react";
import Link from "next/link";
import { createOperationSchema } from "../[operation]/page";
import { createSelector } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import OperationsForm from "@/app/components/Form/operationsForm";

export default function Page() {
  return <OperationsForm />;
}
