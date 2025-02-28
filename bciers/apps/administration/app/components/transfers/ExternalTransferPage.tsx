import Link from "next/link";
import {reportAnEventLink} from "@bciers/utils/src/urls";

// 🧩 Main component
export default async function ExternalTransferPage() {
  return (
    <div>
      <h1 className="form-heading mt-4">Report Transfers and Closures</h1>
      The Greenhouse Gas Emission Reporting Regulation requires an operator to
      report the following events:
      <ul>
        <li>A closure or temporary shutdown;</li>
        <li>An acquisition or divestment;</li>
        <li>A change in the operator having control or direction; or</li>
        <li>A transfer of control and direction to the operator</li>
      </ul>
      To report any of these events, please click report an event below.
      <Link
        className="link-button-blue my-8"
        href={reportAnEventLink}
      >
        Report an Event
      </Link>
      Staff will review the information provided and administer changes in
      BCIERS as needed.
      <p>
        For questions reach out to{" "}
        <Link href={"mailto:GHGRegulator@gov.bc.ca"}>
          GHGRegulator@gov.bc.ca
        </Link>
      </p>
    </div>
  );
}
