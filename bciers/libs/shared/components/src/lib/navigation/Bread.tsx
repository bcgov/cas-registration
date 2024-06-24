"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import Link from "@mui/material/Link";
import { validate as isValidUUID } from "uuid";

// 📐 type for breadcrumb props
type TBreadCrumbProps = {
  separator: React.ReactNode;
  capitalizeLinks: boolean;
  defaultLinks?: { label: string; href: string }[];
  zone?: string;
};

// 🛠️ Function to un-slugify and capitalize a string
function unslugifyAndCapitalize(segment: string): string {
  if (isValidUUID(segment)) return segment; // Do not capitalize UUIDs
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// 🛠️ Function to determine valid crumb link
function isValidLink(segment: string): boolean {
  // Define invalid links
  const invalidWords: string[] = [
    "confirm",
    "received",
    "user-operator",
    "add-operator",
    "request-access",
  ];
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
const liStyle = "inline text-white text-lg";
//<Link>
const aStyle = "text-white text-lg";

export default function Bread({
  separator,
  capitalizeLinks,
  defaultLinks = [], // Default to an empty array if not provided
  zone = "", // Default to empty string if not provided
}: TBreadCrumbProps) {
  // 🛸 Routing: use the `usePathname` hook from next/navigation to access the current route information
  const paths = usePathname();
  // 🔍 useParams, returns an object containing the current route's filled in dynamic parameters
  // The properties name is the segment's name, i.e. formSection
  const params = useParams();
  // 🔗 Links: We split the route path into segments and map over them to generate breadcrumb links.
  const pathNames = paths.split("/").filter((path) => path);
  // 🧹 Check if params contain formSection and remove the last index if true
  if (params && params.formSection) {
    pathNames.pop();
  }
  // 🕹️ Toggle UUID segment to a title segment...
  // by using title parameter sent from link href
  // and useState which is maintained between renders of a top-level React component (required for next\back) navigations
  const searchParams = useSearchParams();
  const paramTitle = searchParams.get("title") as string;
  const [crumbTitle, setCrumbTitle] = useState<string>(paramTitle ?? "");
  useEffect(() => {
    // Set the title state to rowTitle if it exists
    if (paramTitle) {
      setCrumbTitle(paramTitle);
    }
  }, [paramTitle]);
  // 🛠️ Function to toggle UUID segment to row's "title" information
  function translateNumericPart(segment: string): string {
    // Check if the segment is UUID, and if so, use crumbTitle
    if (!isNaN(Number(segment)) || isValidUUID(segment)) {
      return crumbTitle;
    }
    return segment;
  }
  return (
    <div className="relative w-full">
      <div
        className={`bg-bc-bg-blue relative left-1/2 transform -translate-x-1/2 w-screen max-w-none`}
      >
        <nav
          aria-label="breadcrumbs"
          className="flex items-center bg-bc-bg-blue w-full max-w-page h-20 mx-auto"
        >
          <ol className="list-none pl-0 ml-4 sm:ml-6">
            {defaultLinks.map((link, index) => {
              const isLastDefaultLink = index === defaultLinks.length - 1;
              return (
                <li key={link.href} className={liStyle}>
                  <Link href={link.href} className={aStyle}>
                    {capitalizeLinks
                      ? unslugifyAndCapitalize(link.label)
                      : link.label}
                  </Link>
                  {!isLastDefaultLink || pathNames.length > 0
                    ? separator
                    : null}{" "}
                  {/* Conditionally render the separator */}
                </li>
              );
            })}
            {pathNames.map((link, index) => {
              const isLastItem = index === pathNames.length - 1;

              const content = capitalizeLinks
                ? translateNumericPart(unslugifyAndCapitalize(link))
                : translateNumericPart(link);
              if (isValidLink(link)) {
                if (!isLastItem) {
                  //  🔗 create a link
                  const path = `/${pathNames.slice(0, index + 1).join("/")}`;
                  const href = zone ? `/${zone}${path}` : path;
                  return (
                    <li key={link} className={liStyle}>
                      <Link href={href} className={aStyle}>
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
                      data-testid="breadcrumb-last-item"
                      className={liStyle}
                      style={{
                        fontWeight: isLastItem ? "bold" : "normal",
                      }}
                    >
                      {content}
                    </li>
                  );
                }
              }
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
