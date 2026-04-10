import React from "react";
import { Alert } from "@mui/material";
import AlertIcon from "@bciers/components/icons/AlertIcon";

interface FormAlertsProps {
  errors: (string | React.ReactNode)[] | undefined;
}

const FormAlerts: React.FC<FormAlertsProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null; // Don't render anything if there are no errors
  }

  // If caller passed a single rendered component in an array
  // (for example [<ReportValidationSummary />]), render it directly
  if (errors.length === 1 && React.isValidElement(errors[0])) {
    return <div className="mt-4">{errors[0]}</div>;
  }

  return (
    <div className="min-h-[48px] box-border mt-4">
      {errors.map((error, index) => (
        <Alert
          key={index}
          severity="error"
          className="my-2 items-center"
          icon={<AlertIcon />}
        >
          {error}
        </Alert>
      ))}
    </div>
  );
};

export default FormAlerts;
