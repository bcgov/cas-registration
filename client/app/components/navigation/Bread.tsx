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

            if (!isLastItem) {
              //  🔗 Not the last item, create a link
              return (
                <li key={link} style={liStyle}>
                  <Link
                    href={`/${pathNames.slice(0, index + 1).join("/")}`}
                    style={aStyle}
                  >
                    {capitalizeLinks
                      ? link[0].toUpperCase() + link.slice(1)
                      : link}
                  </Link>
                  {separator}
                </li>
              );
            } else {
              // Last item, no link, bold styling
              return (
                <li key={link} style={{ fontWeight: "bold", ...liStyle }}>
                  {capitalizeLinks
                    ? link[0].toUpperCase() + link.slice(1)
                    : link}
                </li>
              );
            }
          })}
        </ol>
      </Breadcrumbs>
    </>
  );
}
