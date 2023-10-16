"use client";

import * as React from "react";
import { Button } from "@mui/material";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

const SubmitButton: React.FunctionComponent = () => {
  const { pending } = useFormStatus();
  return (
    <div>
      <Button
        variant="contained"
        type="submit"
        aria-disabled={pending}
        sx={{ marginBottom: 10 }}
      >
        Submit
      </Button>
    </div>
  );
};
export default SubmitButton;
