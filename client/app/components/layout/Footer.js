import Link from "next/link";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

export default function Footer() {
  return (
    <Box
      sx={{
        bgcolor: "primary.main",
        py: 2,
        position: "fixed",
        bottom: 0, // Position the footer at the bottom
        width: "100%", // Full width
      }}
    >
      <Grid container>
        <Grid item>
          <Link href="x" target="_blank" passHref>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                color: "white",
                marginLeft: "50px",
              }}
              aria-label="Disclaimer Link"
            >
              Disclaimer
            </Typography>
          </Link>
        </Grid>
        <Grid item>
          <Divider orientation="vertical" sx={{ mx: 2 }} />
        </Grid>
        <Grid item>
          <Link href="x" target="_blank" passHref>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ color: "white" }}
              aria-label="Privacy Link"
            >
              Privacy
            </Typography>
          </Link>
        </Grid>
        <Grid item>
          <Divider orientation="vertical" sx={{ mx: 2 }} />
        </Grid>
        <Grid item>
          <Link href="x" target="_blank" passHref>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ color: "white" }}
              aria-label="Accessibility Link"
            >
              Accessibility
            </Typography>
          </Link>
        </Grid>
        <Grid item>
          <Divider orientation="vertical" sx={{ mx: 2 }} />
        </Grid>
        <Grid item>
          <Link href="x" target="_blank" passHref>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ color: "white" }}
              aria-label="Copyright Link"
            >
              Copyright
            </Typography>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
}
