import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

export const infoNote = (
  <>
    Only operations missing a submitted report are shown. If an operation is not
    showing, it must be{" "}
    <Tooltip title="Link opens in a new tab" placement="top" arrow>
      <Link
        href="/administration/operations?isNewTab=true"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: "inherit",
          textDecoration: "underline",
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        registered
        <OpenInNewIcon fontSize="inherit" sx={{ ml: 0.25 }} />
      </Link>
    </Tooltip>{" "}
    first.
  </>
);
