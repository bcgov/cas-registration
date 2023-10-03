"use client";

import * as React from "react";
import { Button } from "@mui/material";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

const SubmitButton: React.FunctionComponent = () => {
  const { pending } = useFormStatus();
  return (
    <div>
      <Button variant="contained" type="submit" aria-disabled={pending}>
        Submit
      </Button>
    </div>
  );
};
export default SubmitButton;
