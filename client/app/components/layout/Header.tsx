"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  return (
    <AppBar position="fixed" sx={{ zIndex: 2000 }} aria-label="Main Navigation">
      <Toolbar
        sx={{
          display: "flex", // Use Flexbox
          alignItems: "center", // Vertically center the content
          color: "white", // Set text color to white
          backgroundColor: "#036",
          justifyContent: "space-between",
        }}
      >
        {/* Left-hand section for image and text */}
        <div
          style={{
            display: "flex", // Use Flexbox for horizontal alignment
            alignItems: "center", // Vertically center the content
          }}
        >
          <img
            src="/path/to/your/svg-image.svg"
            alt="Clean BC"
            style={{ width: "24px", height: "24px" }}
            aria-hidden="true" // Hide the image from screen readers
          />
          <Typography
            variant="h6"
            noWrap
            component="div"
            color="inherit" // Inherit the text color from the parent (white)
            aria-hidden="true" // Hide the text from screen readers
          >
            BC OBPS
          </Typography>
        </div>

        {/* Right-hand section for navigation links */}
        <div>
          <IconButton
            color="inherit"
            aria-label="Login"
            onClick={() => router.push("/auth/signin")}
          >
            <Typography variant="body1" color="inherit">
              Login
            </Typography>
          </IconButton>
          {/* Add more icons or components as needed */}
        </div>
      </Toolbar>
    </AppBar>
  );
}
