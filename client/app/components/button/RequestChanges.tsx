"use client";

import { useState } from "react";

import { Button } from "@mui/material";

const ChangeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.9367 4.67668L13.5861 6.02732C13.4484 6.16502 13.2257 6.16502 13.088 6.02732L9.83593 2.77524C9.69823 2.63754 9.69823 2.41487 9.83593 2.27717L11.1866 0.92653C11.7345 0.378657 12.6251 0.378657 13.1759 0.92653L14.9367 2.68734C15.4876 3.23522 15.4876 4.12588 14.9367 4.67668ZM8.67572 3.43737L0.982001 11.131L0.360879 14.6907C0.275914 15.1712 0.694878 15.5873 1.17537 15.5052L4.7351 14.8812L12.4288 7.18752C12.5665 7.04982 12.5665 6.82716 12.4288 6.68945L9.17672 3.43737C9.03609 3.29967 8.81342 3.29967 8.67572 3.43737ZM3.98507 10.4718C3.82393 10.3107 3.82393 10.0529 3.98507 9.89173L8.497 5.37983C8.65814 5.21869 8.91596 5.21869 9.0771 5.37983C9.23824 5.54097 9.23824 5.79879 9.0771 5.95993L4.56517 10.4718C4.40403 10.633 4.14621 10.633 3.98507 10.4718ZM2.9274 12.9358H4.33372V13.9993L2.44398 14.3304L1.53281 13.4192L1.86388 11.5295H2.9274V12.9358Z"
      fill="white"
    />
  </svg>
);

interface Props {
  onCancelRequestChange: () => void;
  onRequestChange: () => void;
  onRequestChangeConfirm: () => void;
}

const RequestChanges: React.FC<Props> = ({
  onCancelRequestChange,
  onRequestChange,
  onRequestChangeConfirm,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleRequestClick = () => {
    onRequestChange();
    setShowConfirmation(true);
  };

  const handleCancelClick = () => {
    onCancelRequestChange();
    setShowConfirmation(false);
  };

  return (
    <>
      {showConfirmation ? (
        <div>
          <div className="mb-4">
            <b>Confirm your request for change</b>
            <p className="m-0">
              Please confirm your request for change and that you’ll notify the
              user by email.
            </p>
          </div>
          <div className="flex">
            <Button
              className="mr-2"
              variant="contained"
              color="primary"
              aria-label="Request Changes"
              onClick={onRequestChangeConfirm}
            >
              Confirm change request
            </Button>
            <Button
              variant="outlined"
              color="primary"
              aria-label="Request Changes"
              onClick={handleCancelClick}
            >
              Cancel request
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-fit">
          <Button
            variant="contained"
            color="primary"
            aria-label="Request Changes"
            onClick={handleRequestClick}
          >
            <span className="mr-4">Request Changes</span>
            <ChangeIcon />
          </Button>
        </div>
      )}
    </>
  );
};

export default RequestChanges;
