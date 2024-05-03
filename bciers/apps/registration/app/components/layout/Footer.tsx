import Link from "next/link";

// 🏷 import {named} can be significantly slower than import default
import Box from "@mui/material/Box";
import footerLinks from "@/app/data/layout/footer.json";

const links = footerLinks.map((link, index) => (
  <Link
    key={index}
    href={link.href}
    target={link.target}
    style={{
      fontWeight: 400,
      fontSize: "16px",
      lineHeight: "19.36px",
      textDecoration: "none",
      color: "white",
      margin: "0 10px",
    }}
    aria-label={link.label}
  >
    {link.name}
  </Link>
));

export default function Footer() {
  return (
    <Box
      position="absolute"
      component="footer"
      sx={{
        alignItems: "center",
        maxHeight: "fit-content",
        mt: "auto",
        width: "100%",
        bgcolor: "primary.main",
        overflow: "hidden",
        py: 3,
        px: 2,
        bottom: 0,
      }}
    >
      <Box
        component="div"
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column", //mobile small
            sm: "row",
          },
          margin: "0 auto",
          width: "100%",
          maxWidth: "1536px",
        }}
      >
        {links}
      </Box>
    </Box>
  );
}
