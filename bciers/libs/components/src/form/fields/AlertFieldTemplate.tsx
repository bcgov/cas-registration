"use client";
import { BC_GOV_TEXT, LIGHT_BLUE_BG_COLOR } from "@bciers/styles";
import InfoIcon from "@mui/icons-material/Info";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Paper, Box, Typography, Tooltip, Link } from "@mui/material";
import { FieldTemplateProps } from "@rjsf/utils";

/**
 * RJSF Field Template to display a standard alert box
 *
 * @param param0
 * @returns
 */
function OpenInNewTabLink({ href, text }: { href: string, text:string }) {
   return <Tooltip title={"Link opens in a new tab"} placement="top" arrow>
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
                  {text}
                  <OpenInNewIcon
                    fontSize="inherit"
                    style={{ marginLeft: ".1rem" }}
                  />
                </Link>{" "}
              </span>
            </Tooltip>
}

function AlertFieldTemplate({
  classNames,
  id,
  style,
  label,
}: FieldTemplateProps) {
  return (
    <div style={style} className={`w-full my-8 ${classNames}`} id={id}>
      <Paper
        sx={{ p: 2, mb: 3, bgcolor: LIGHT_BLUE_BG_COLOR, color: BC_GOV_TEXT }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <InfoIcon sx={{ mr: 1 }} />
          <Typography variant="body2">
            Any edits to operation information made here will only apply to this
            report. You can{" "}
            <OpenInNewTabLink href="#" text="baa baa blacksheep" />
            in the operations page.
          </Typography>
        </Box>
      </Paper>
    </div>
  );
}

export default AlertFieldTemplate;
