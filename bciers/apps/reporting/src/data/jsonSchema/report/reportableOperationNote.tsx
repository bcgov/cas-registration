import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const infoNote = (
  <>
    Only operations missing a report for the selected reporting year are shown.
    If you don't see an operation you expected, then it hasn't been registered
    yet.{" "}
    <Tooltip title="Link opens in a new tab" placement="top" arrow>
      <Link
        href="/administration/operations?isNewTab=true"
        target="_blank"
        rel="noopener noreferrer"
        className="text-inherit underline inline-flex items-center"
      >
        Register a missing operation.
        <OpenInNewIcon fontSize="inherit" className="ml-0.5" />
      </Link>
    </Tooltip>{" "}
  </>
);
