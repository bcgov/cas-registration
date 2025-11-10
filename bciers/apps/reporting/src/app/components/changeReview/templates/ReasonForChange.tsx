"use client";
import React from "react";
import { TextareaAutosize } from "@mui/material";
import { DARK_GREY_BG_COLOR } from "@bciers/styles/colors";

interface ReasonForChangeProps {
  reasonForChange: string;
  onReasonChange: (val: string) => void;
}

const ReasonForChangeForm: React.FC<ReasonForChangeProps> = ({
  reasonForChange,
  onReasonChange,
}) => {
  const borderColor = DARK_GREY_BG_COLOR;
  const styles: React.CSSProperties = {
    width: "100%",
    padding: "8px",
    fontSize: "16px",
    fontFamily: "BCSans, sans-serif",
    borderRadius: "4px",
    border: `1px solid ${borderColor}`,
    backgroundColor: "white",
    resize: "vertical",
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="change-review-form"
    >
      <div className="form-heading text-xl font-bold flex items-cente">
        Reason for change
      </div>

      {/* Reason for Change */}
      <div className="form-group">
        <div className="flex items-start gap-4">
          <label className="w-1/3 font-medium">
            Please explain the reason for submitting this supplementary report.
            Include an explanation for why each inaccuracy or omission in the
            previous report occurred.
            <span className="text-red-500">*</span>
          </label>
          <TextareaAutosize
            aria-label="Reason for change"
            value={reasonForChange}
            onChange={(e) =>
              onReasonChange((e.target as HTMLTextAreaElement).value)
            }
            minRows={4}
            className="w-2/3"
            style={styles}
          />
        </div>
      </div>
    </form>
  );
};

export default ReasonForChangeForm;
