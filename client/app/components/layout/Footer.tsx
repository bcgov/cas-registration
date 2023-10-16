import Link from "next/link";

// 🏷 import {named} can be significantly slower than import default
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack/Stack";

const appUrl = process.env.NEXT_PUBLIC_APP_URL; // Ensure this is a valid URL

const footerLinks = [
  {
    name: "Home",
    href: `${appUrl}`,
    label: "Return to the Home Page",
    target: "_self",
  },
  {
    name: "Disclaimer",
    href: "https://www2.gov.bc.ca/gov/content/home/disclaimer",
    label:
      "To learn more, visit the Disclaimer page which opens in a new window.",
    target: "_blank",
  },
  {
    name: "Privacy",
    href: "https://www2.gov.bc.ca/gov/content/home/privacy",
    label: "To learn more, visit the Privacy page which opens in a new window.",
    target: "_blank",
  },
  {
    name: "Accessibility",
    href: "https://www2.gov.bc.ca/gov/content/home/accessible-government",
    label:
      "To learn more, visit the Accessibility page which opens in a new window.",
    target: "_blank",
  },
  {
    name: "Copyright",
    href: "https://www2.gov.bc.ca/gov/content/home/copyright",
    label: "Copyright",
    target: "_blank",
  },
  {
    name: "Contact Us",
    href: "mailto:GHGRegulator@gov.bc.ca",
    label: "To contact us, use the mailto link which opens in a new window.",
    target: "_blank",
  },
];

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
