import { AlertIcon } from "@/app/styles/rjsf/InlineFieldTemplate";

export const registrationRequestNote =
  "Once “Approved,” a B.C. OBPS Regulated Operation ID will be issued for the operation.";

interface Props {
  classNames?: string;
  message: string;
  showAlertIcon?: boolean;
  showNotePrefix?: boolean;
}

const Note = ({
  classNames,
  message,
  showAlertIcon = false,
  showNotePrefix = true,
}: Props) => {
  return (
    <div
      className={classNames}
      style={{ display: "flex", alignItems: "center" }}
    >
      <div className={"mr-4"}>
        {showAlertIcon && <AlertIcon width={"30"} height={"30"} />}
        {showNotePrefix && <strong>Note: </strong>}
      </div>
      <div>{message}</div>
    </div>
  );
};

export default Note;
