import { TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils";

const CommentWidget: React.FC<WidgetProps> = ({
  readonly,
  onChange,
  value,
  name,
  formContext,
  options,
}) => {
  const { showSubmissionInfo = false } = options || {};
  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : val);
  };

  const submittedBy = formContext?.creditsIssuanceRequestData?.submited_by;
  const submittedAt = formContext?.creditsIssuanceRequestData?.submited_at;
  const commentValue = name && formContext?.creditsIssuanceRequestData?.[name];

  const submissionInfoElement =
    !submittedBy && !submittedAt ? null : (
      <p className="text-normal text-gray-600 m-0 mt-[10px] leading-none">
        Submitted
        {submittedBy ? (
          <>
            {" "}
            by <i>{submittedBy}</i>
          </>
        ) : (
          ""
        )}
        {submittedAt ? (
          <>
            {" "}
            on <i>{submittedAt}</i>
          </>
        ) : (
          ""
        )}
      </p>
    );

  if (readonly) {
    return (
      <div className="flex flex-col">
        <p className="m-0">{commentValue}</p>
        {showSubmissionInfo && submissionInfoElement}
      </div>
    );
  }

  const styles = {
    font: "inherit",
    "& .MuiOutlinedInput-root .MuiInputBase-input": {
      paddingY: "8px",
    },
    "& .MuiFormControl-fullWidth": {
      padding: "0",
    },
  };

  return (
    <div className="relative">
      <TextField
        name={name}
        value={value || commentValue || ""}
        onChange={handleChange}
        sx={styles}
        role="textbox"
      />
      {showSubmissionInfo && submissionInfoElement}
    </div>
  );
};

export default CommentWidget;
