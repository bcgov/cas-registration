import { Grid } from "@mui/material";
import { Main } from "@bciers/components/server";

export default function Index() {
  return (
    <Main>
      <Grid
        container
        spacing={2}
        sx={{
          marginTop: "24px",
          marginBottom: "48px",
        }}
      >
        You have been signed in!
      </Grid>
    </Main>
  );
}
