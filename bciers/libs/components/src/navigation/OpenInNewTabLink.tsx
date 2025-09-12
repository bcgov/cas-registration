import { Link, Tooltip } from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { PropsWithChildren } from "react";

/**
 * RJSF Field Template to display a standard alert box
 *
 * @param param0
 * @returns
 */
function OpenInNewTabLink({
  href,
  children,
}: PropsWithChildren<{ href: string }>) {
  return (
    <Tooltip title={"Link opens in a new tab"} placement="top" arrow>
      <span>
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            color: "inherit",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          {children}
          <OpenInNewIcon fontSize="inherit" style={{ marginLeft: ".1rem" }} />
        </Link>{" "}
      </span>
    </Tooltip>
  );
}

export default OpenInNewTabLink;
