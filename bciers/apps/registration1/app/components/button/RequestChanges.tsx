"use client";

import { useState } from "react";

import { Button } from "@mui/material";
import TimeIcon from "@bciers/components/icons/TimeIcon";
import ChangeIcon from "@bciers/components/icons/ChangeIcon";

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
