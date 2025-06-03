import { TextField } from "@mui/material";
import { WidgetProps } from "@rjsf/utils";

interface TwoStateWidgetProps extends WidgetProps {
  formContext?: {
    creditsIssuanceRequestData?: any;
  };
}

const TwoStateWidget: React.FC<TwoStateWidgetProps> = ({
  disabled,
  onChange,
  readonly,
  uiSchema,
  value,
  name,
  formContext,
}) => {
  const uiOptions = uiSchema ? uiSchema["ui:options"] : {};
  const isDisabledFromOptions = uiOptions?.isDisabled === true;
  const showSubmissionInfo = uiOptions?.showSubmissionInfo !== false;

  const handleChange = (e: { target: { value: string } }) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : val);
  };

  const submittedBy = formContext?.creditsIssuanceRequestData?.submited_by;
  const submittedAt = formContext?.creditsIssuanceRequestData?.submited_at;
  const commentValue = name && formContext?.creditsIssuanceRequestData?.[name];

  const submissionInfoElement =
    !showSubmissionInfo || (!submittedBy && !submittedAt) ? null : (
      <p className="text-normal text-gray-600 m-0 absolute bottom-[-26px] left-0 leading-none">
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

  if (isDisabledFromOptions) {
    return (
      <div className=" relative bg-bc-bg-grey rounded-[5px] px-[10px] py-[9px] h-[39px] flex items-center">
        {commentValue}
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
    <div className=" relative">
      <TextField
        disabled={disabled || readonly}
        name={name}
        value={value || commentValue || ""}
        onChange={handleChange}
        sx={styles}
        role="textbox"
      />
      {submissionInfoElement}
    </div>
  );
};

export default TwoStateWidget;
