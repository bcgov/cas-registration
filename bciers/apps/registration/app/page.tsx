import Main from "@bciers/components/layout/Main";

export default function Page() {
  // Main will be moved into a child layout component once we set up the routes
  return (
    <Main
      sx={{
        margin: {
          xs: "140px auto 180px auto",
          md: "80px auto 80px auto",
        },
      }}
    >
      <h1>Registration Part II</h1>
    </Main>
  );
}
