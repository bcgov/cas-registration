import Link from "next/link";
import { Grid } from "@mui/material";
import { Main } from "@bciers/components/server";

export default function Index() {
  return (
    <Main>
      <h1>You have been signed in!</h1>
      <div>
        <Link href="/authenticated/facilities">Go to Facilities</Link>
      </div>
    </Main>
  );
}
