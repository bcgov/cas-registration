export const registrationRequestNote =
  "Once “Approved”, the operation will be registered for the B.C. Output-Based Pricing System and exempted from the carbon tax.";

interface Props {
  message: string;
}

const Note = ({ message }: Props) => {
  return (
    <>
      <strong>Note: </strong>
      {message}
    </>
  );
};

export default Note;
