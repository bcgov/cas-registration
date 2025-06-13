import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { ghgRegulatorEmail } from "@bciers/utils/src/urls";

import { Alert, AlertTitle } from "@mui/material";
import ErrorBox from "./ErrorBox";

interface Props {
  error: Error & { digest?: string };
}
export default function ErrorBoundary({ error }: Props) {
  return <ErrorBox error={error} />;
}
