"use client";

import { Button } from "@mui/material";
import { useFormStatus } from "react-dom";
import Link from "next/link";

interface SubmitButtonProps {
  baseUrl: string;
  cancelUrl: string;
  classNames?: string;
  formSectionList: string[];
  formSection: number;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  baseUrl,
  formSection,
  formSectionList,
  cancelUrl,
  classNames,
}) => {
  const { pending } = useFormStatus();
  return (
    <div className={`flex w-full mt-8 justify-between ${classNames}`}>
      {cancelUrl && (
        <Link href={cancelUrl}>
          <Button variant="outlined">Cancel</Button>
        </Link>
      )}
      <div>
        {formSection !== 0 ? (
          <Link href={`${baseUrl}/${formSection}`}>
            <Button
              variant="contained"
              type="button"
              disabled={formSection === 0}
              className="mr-4"
            >
              Back
            </Button>
          </Link>
        ) : (
          <Button variant="contained" type="button" disabled className="mr-4">
            Back
          </Button>
        )}
        {formSection !== formSectionList.length - 1 ? (
          <Link href={`${baseUrl}/${formSection + 2}`}>
            <Button
              variant="contained"
              type="button"
              disabled={formSection === formSectionList.length - 1}
            >
              Next
            </Button>
          </Link>
        ) : (
          <Button type="submit" aria-disabled={pending} variant="contained">
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default SubmitButton;
