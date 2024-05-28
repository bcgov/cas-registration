import { Main } from "@bciers/components/server";
import FormTest from "../routes/formTest/Page";

export default function Index() {
  return (
    <Main>
      <h1>Dynamic Config Form Test Page</h1>
      <div>
        <FormTest />
      </div>
    </Main>
  );
}
