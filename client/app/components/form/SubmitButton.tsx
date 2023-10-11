"use client";

import { Button } from "@mui/material";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  label,
}) => {
  const { pending } = useFormStatus();
  return (
    <div>
      <Button
        variant="contained"
        type="submit"
        aria-disabled={pending}
        sx={{ marginBottom: 10 }}
      >
        {label}
      </Button>
    </div>
  );
};
export default SubmitButton;
