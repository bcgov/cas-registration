// 🚩 flagging that for shared routes between roles, "Page" code is a component for code maintainability

import { Button } from "@mui/material";
import Link from "next/link";

export default async function Page(params: any) {
  return (
    <div>
      TBD
      <div>
        Temporary button to add a facility:{" "}
        <Link href={`/operations/${params.params.operationId}/facilities/new`}>
          <Button variant="contained">Add Facility</Button>
        </Link>
      </div>
    </div>
  );
}
