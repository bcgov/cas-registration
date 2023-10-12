"use client";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";

const footerLinks = [
  {
    name: "Home",
    href: "https://todo1",
  },
  {
    name: "Disclaimer",
    href: "https://www2.gov.bc.ca/gov/content/home/disclaimer",
  },
  {
    name: "Privacy",
    href: "https://www2.gov.bc.ca/gov/content/home/privacy",
  },
  {
    name: "Accessibility",
    href: "https://www2.gov.bc.ca/gov/content/home/accessible-government",
  },
  {
    name: "Copyright",
    href: "https://www2.gov.bc.ca/gov/content/home/copyright",
  },
  {
    name: "Contact Us",
    href: "https://todo2",
  },
];

export default function Footer() {
  return (
    <>
      <AppBar position="fixed" color="primary" sx={{ top: "auto", bottom: 0 }}>
        <Toolbar>
          {footerLinks.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              target="_blank"
              style={{
                textDecoration: "none",
                color: "white",
                margin: "0 10px ", // Add margin for spacing
              }}
            >
              {item.name}
            </Link>
          ))}
        </Toolbar>
      </AppBar>
    </>
  );
}
