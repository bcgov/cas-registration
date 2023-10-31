"use client";
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "@mui/material/Link";
import Breadcrumbs from "@mui/material/Breadcrumbs/Breadcrumbs";

// 📐 type for breadcrumb props
type TBreadCrumbProps = {
  separator: ReactNode;
  capitalizeLinks?: boolean;
};

// 🛠️ Function to translate a numeric part
function translateNumericPart(segment: string): string {
  // Check if the segment is numeric, and if so, prefix with "Operation ID"
  if (!isNaN(Number(segment))) {
    return `ID ${segment}`;
  }
  return segment;
}

// 🛠️ Function to un-slugify and capitalize a string
function unslugifyAndCapitalize(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// 🛠️ Function to determine valid crumb link
function isValidLink(segment: string): boolean {
  // Define invalid links
  const invalidWords: string[] = ["confirm", "received", "user-operator"];
  // Convert the segment to lowercase for case-insensitive comparison
  const lowerSegment = segment.toLowerCase();
  // Check if the segment contains any of the invalid words
  for (const word of invalidWords) {
    if (lowerSegment.includes(word)) {
      return false; // Invalid segment
    }
  }

  return true; // Valid segment
}

/* 🌐
    The accessibility of this component relies on:
    A nav element labeled with aria-label identifies the structure as a breadcrumb trail and makes it a navigation landmark
    The set of links is structured using an ordered list (<ol> element).
    🔍 Implementing this structure seems to negate the Breadcrumbs props such as
          separator=">"
          maxItems={3}
          itemsAfterCollapse={2}
  */

// 🎨 Styles...
//<ol>
const olStyle: React.CSSProperties = {
  listStyle: "none",
  paddingLeft: "0px",
  marginLeft: "30px",
};
//<li>
const liStyle: React.CSSProperties = {
  display: "inline",
  color: "white",
  fontSize: "18px",
};
//<Link>
const aStyle: React.CSSProperties = {
  color: "white",
  fontSize: "18px",
};

export default function Bread({
  separator,
  capitalizeLinks,
}: TBreadCrumbProps) {
  // 🛸 Routing: use the `usePathname` hook from next/navigation to access the current route information
  const paths = usePathname();

  // 🔗 Links: We split the route path into segments and map over them to generate breadcrumb links.
  const pathNames = paths.split("/").filter((path) => path);

  return (
    <>
      <Breadcrumbs
        aria-label="breadcrumbs"
        sx={{
          display: "flex", // Make the container a flex container
          alignItems: "center",
          backgroundColor: "primary.light",
          height: 80,
        }}
      >
        <ol style={olStyle}>
          {pathNames.map((link, index) => {
            const isLastItem = index === pathNames.length - 1;

            const content = capitalizeLinks
              ? translateNumericPart(unslugifyAndCapitalize(link))
              : translateNumericPart(link);
            if (isValidLink(link)) {
              if (!isLastItem) {
                //  🔗 create a link
                return (
                  <li key={link} style={liStyle}>
                    <Link
                      href={`/${pathNames.slice(0, index + 1).join("/")}`}
                      style={aStyle}
                    >
                      {content}
                    </Link>
                    {separator}
                  </li>
                );
              } else {
                // Last item, no link, bold styling
                return (
                  <li
                    key={link}
                    style={{
                      fontWeight: isLastItem ? "bold" : "normal",
                      ...liStyle,
                    }}
                  >
                    {content}
                  </li>
                );
              }
            }
          })}
        </ol>
      </Breadcrumbs>
    </>
  );
}
