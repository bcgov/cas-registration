import Link from "next/link";

// 🏷 import {named} can be significantly slower than import default
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack/Stack";
import footerLinks from "@/app/data/layout/footer.json";

export default function Footer() {
  return (
    <>
      <Box
        component="footer"
        sx={{
          bgcolor: "primary.main",
          py: 3,
          px: 2,
          mt: "auto", //in a flexbox item, this will push the footer down to the bottom
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 2, md: 4 }}
          justifyContent={{ xs: "center", md: "flex-start" }}
          alignItems={{ xs: "center" }}
        >
          {footerLinks.map((link, index) => (
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
                margin: "0 10px ",
              }}
              aria-label={link.label}
            >
              {link.name}
            </Link>
          ))}
        </Stack>
      </Box>
    </>
  );
}
