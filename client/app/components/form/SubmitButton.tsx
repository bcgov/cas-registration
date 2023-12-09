"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  classNames?: string;
  disabled?: boolean;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  label,
  classNames,
  disabled,
}) => {
  const { pending } = useFormStatus();
  return (
    <div className={classNames}>
      <Button
        variant="contained"
        type="submit"
        aria-disabled={disabled || pending}
        className="h-full"
        sx={{ marginBottom: 10 }}
      >
        {label}
      </Button>
    </div>
  );
};
export default SubmitButton;
