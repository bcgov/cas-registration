import Note from "@bciers/components/layout/Note";

const UserProfileHeader = () => {
  return (
    <>
      <Note>Please update or verify your information</Note>
    </>
  );
};

// Render the header component
export default async function ProfileHeader() {
  return (
    <>
      <UserProfileHeader />
    </>
  );
}
