export const registrationRequestNote =
  "Once “Approved”, the operation will be registered for the B.C. Output-Based Pricing System and exempted from the carbon tax.";

interface Props {
  classNames?: string;
  message: string;
}

const Note = ({ classNames, message }: Props) => {
  return (
    <div className={classNames}>
      <strong>Note: </strong>
      {message}
    </div>
  );
};

export default Note;
