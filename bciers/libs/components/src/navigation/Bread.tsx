"use client";

import { usePathname, useSearchParams } from "next/navigation";
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

// 🛠️ Function to check if a given value is numeric
function isNumeric(value: string): boolean {
  return !isNaN(Number(value));
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

  // 🛠️ Function to convert the segment to lowercase for case-insensitive comparison
  const lowerSegment = segment.toLowerCase();
  // Check if the segment contains any of the invalid words
  for (const word of invalidWords) {
    if (lowerSegment.includes(word)) {
      return false; // Invalid segment
    }
  }
  return true; // Valid segment
}

// 🛠️ Function to serialize search params
const serializeSearchParams = (params: URLSearchParams) => {
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
};
const liStyle = "inline text-white text-lg";
const aStyle = "text-white text-lg";

export default function Bread({
  separator,
  capitalizeLinks,
  defaultLinks = [], // Default to an empty array if not provided
  zone = "", // Default to empty string if not provided
}: TBreadCrumbProps) {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);
  const searchParams = useSearchParams();
  const crumbTitles = Object.fromEntries(searchParams.entries());

  function translateNumericPart(segment: string, index: number): string {
    if (isValidUUID(segment) || isNumeric(segment)) {
      const precedingSegment = pathNames[index - 1]
        ? unslugifyAndCapitalize(pathNames[index - 1])
        : "";
      if (
        precedingSegment &&
        crumbTitles[`${precedingSegment.toLowerCase()}_title`]
      ) {
        return crumbTitles[`${precedingSegment.toLowerCase()}_title`];
      }
      return crumbTitles.title;
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
                ? translateNumericPart(unslugifyAndCapitalize(link), index)
                : translateNumericPart(link, index);
              if (isValidLink(link)) {
                if (!isLastItem) {
                  // 🔗 create a link
                  const path = `/${pathNames.slice(0, index + 1).join("/")}`;
                  const queryString = serializeSearchParams(searchParams);
                  const href = zone
                    ? `/${zone}${path}${queryString}`
                    : `${path}${queryString}`;

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
