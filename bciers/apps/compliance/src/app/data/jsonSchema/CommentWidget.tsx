import { TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils";

const CommentWidget: React.FC<WidgetProps> = ({
  disabled,
  onChange,
  value,
  name,
  formContext,
}) => {
  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : val);
  };

  const submittedBy = formContext?.creditsIssuanceRequestData?.submited_by;
  const submittedAt = formContext?.creditsIssuanceRequestData?.submited_at;
  const commentValue = name && formContext?.creditsIssuanceRequestData?.[name];

  const submissionInfoElement =
    !disabled || (!submittedBy && !submittedAt) ? null : (
      <p className="text-normal text-gray-600 m-0 mb-[10px] leading-none">
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

  if (disabled) {
    return (
      <div className="flex flex-col gap-[10px]">
        <div className="bg-bc-bg-grey rounded-[5px] px-[10px] py-[9px] h-[39px] flex items-center">
          {commentValue}
        </div>
        {submissionInfoElement}
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
        disabled={disabled}
      />
    </div>
  );
};

export default CommentWidget;
