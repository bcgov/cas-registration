import React from "react";
import { Alert } from "@mui/material";

interface FormAlertsProps {
  errors: (string | React.ReactNode)[] | undefined;
}

const FormAlerts: React.FC<FormAlertsProps> = ({ errors }) => {
  if (!errors || errors.length === 0) {
    return null; // Don't render anything if there are no errors
  }

  return (
    <div className="min-h-[48px] box-border mt-4">
      {errors.map((error, index) => (
        <Alert key={index} severity="error">
          {error}
        </Alert>
      ))}
    </div>
  );
};

export default FormAlerts;
