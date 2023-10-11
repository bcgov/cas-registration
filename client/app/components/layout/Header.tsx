"use client";

import Image from "next/image";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <AppBar position="static" color="primary">
        <Toolbar>
          <Image
            alt="Logo for Province of British Columbia CleanBC"
            src="/img/BCID_CleanBC_rev_tagline_colour.svg"
            height={50}
            width={300}
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BC OBPS
          </Typography>
          <Button
            color="inherit"
            variant="outlined"
            sx={{ marginRight: 2 }} // Add margin-right to create space
            onClick={() => router.push("/auth/signin")}
          >
            Program Administrator
            <br /> Log In
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            sx={{ marginRight: 10 }}
            onClick={() => router.push("/auth/signin")}
          >
            Industrial Operator
            <br /> Log In
          </Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
