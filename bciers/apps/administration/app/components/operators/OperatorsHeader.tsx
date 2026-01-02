import Note from "@bciers/components/layout/Note";

const InternalOperatorsHeader = () => {
  return (
    <>
      <Note>
        <b>Note:</b> View all the operators here.
      </Note>
      <h1>Operators</h1>
    </>
  );
};

// Render the header component
export default async function OperatorsHeader() {
  return (
    <>
      <InternalOperatorsHeader />
    </>
  );
}
