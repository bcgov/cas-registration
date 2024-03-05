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

const TimeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.26562 0.25C3.25195 0.25 0 3.50195 0 7.51562C0 11.5293 3.25195 14.7812 7.26562 14.7812C11.2793 14.7812 14.5312 11.5293 14.5312 7.51562C14.5312 3.50195 11.2793 0.25 7.26562 0.25ZM8.93848 10.5068L6.35449 8.62891C6.26367 8.56152 6.21094 8.45605 6.21094 8.34473V3.41406C6.21094 3.2207 6.36914 3.0625 6.5625 3.0625H7.96875C8.16211 3.0625 8.32031 3.2207 8.32031 3.41406V7.44824L10.1807 8.80176C10.3389 8.91602 10.3711 9.13574 10.2568 9.29395L9.43066 10.4307C9.31641 10.5859 9.09668 10.6211 8.93848 10.5068Z"
      fill="#313132"
    />
  </svg>
);

interface Props {
  onCancelRequestChange: () => void;
  onRequestChange: () => void;
  onRequestChangeConfirm: () => void;
  onUndoRequestChanges: () => void;
  showUndo: boolean;
}

const RequestChanges: React.FC<Props> = ({
  onCancelRequestChange,
  onRequestChange,
  onRequestChangeConfirm,
  onUndoRequestChanges,
  showUndo,
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

  const handleUndoRequestChangesClick = () => {
    onUndoRequestChanges();
    setShowConfirmation(false);
  };

  if (showUndo) {
    return (
      <div className="w-full bg-bc-bg-dark-grey px-[9px] py-[18px] rounded flex items-center">
        <span>
          <TimeIcon />
        </span>
        <span className="mx-2 font-bold">Changes have been requested.</span>
        <button
          className="bg-transparent border-0 p-0 text-bc-link-blue text-lg font-underline font-bold underline decoration-bc-link-blue hover:cursor-pointer"
          aria-label="Undo Request Changes"
          onClick={handleUndoRequestChangesClick}
        >
          Undo request
        </button>
      </div>
    );
  }

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
              aria-label="Confirm Change Request"
              onClick={onRequestChangeConfirm}
            >
              Confirm change request
            </Button>
            <Button
              variant="outlined"
              color="primary"
              aria-label="Cancel Change Request"
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
