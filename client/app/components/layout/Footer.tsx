import Link from "next/link";

// 🏷 import {named} can be significantly slower than import default
import Box from "@mui/material/Box";

const appUrl = process.env.NEXT_PUBLIC_APP_URL; // Ensure this is a valid URL

const footerLinks = [
  {
    name: "Home",
    href: `${appUrl}`,
    label: "Visit Home Page",
    target: "_self",
  },
  {
    name: "Disclaimer",
    href: "https://www2.gov.bc.ca/gov/content/home/disclaimer",
    label: "Visit Disclaimer Page",
    target: "_blank",
  },
  {
    name: "Privacy",
    href: "https://www2.gov.bc.ca/gov/content/home/privacy",
    label: "Visit Privacy Page",
    target: "_blank",
  },
  {
    name: "Accessibility",
    href: "https://www2.gov.bc.ca/gov/content/home/accessible-government",
    label: "Accessibility link",
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
    label: "Contact Us Link",
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
        <Box
          sx={{
            marginLeft: "56px",
          }}
        >
          {footerLinks.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              target={item.target}
              style={{
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "19.36px",
                textDecoration: "none",
                color: "white",
                marginLeft: "10px", // Add margin for spacing
              }}
              aria-label={item.label}
            >
              {item.name}
            </Link>
          ))}
        </Box>
      </Box>
    </>
  );
}
