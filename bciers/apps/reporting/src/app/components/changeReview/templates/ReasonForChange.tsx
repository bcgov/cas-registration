import React from "react";
interface ReasonForChangeProps {
  reasonForChange: string;
  onReasonChange: (val: string) => void;
}

const ReasonForChangeForm: React.FC<ReasonForChangeProps> = ({
  reasonForChange,
  onReasonChange,
}) => {
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
          <textarea
            value={reasonForChange}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={4}
            className="w-2/3 p-2 border border-gray-400 rounded resize-vertical"
          />
        </div>
      </div>
    </form>
  );
};

export default ReasonForChangeForm;
