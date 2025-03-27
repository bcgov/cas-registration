"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "@mui/material/Link";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";

// 📐 type for breadcrumb props
type TBreadCrumbProps = {
  separator: React.ReactNode;
  capitalizeLinks: boolean;
  defaultLinks?: { label: string; href: string }[];
  zone?: string;
};

// 🛠️ Custom function to validate UUID using regex
const isValidUUID = (segment: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(segment);
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

  // Not showing breadcrumbs on the onboarding page
  const showBreadcrumb = paths !== "/onboarding";
  if (!showBreadcrumb) return null;

  // 🛠️ Function to check if a link is the last link
  const isLastBreadcrumbItem = (link: string, index: number) => {
    const lastLinkValues = ["register-an-operation"];
    return lastLinkValues.includes(link) || index === pathNames.length - 1;
  };

  // 🛠️ Find the index of the last breadcrumb item
  const lastLinkIndex = pathNames.findIndex((link, index) =>
    isLastBreadcrumbItem(link, index),
  );
  const slicedPathNames =
    lastLinkIndex !== -1 ? pathNames.slice(0, lastLinkIndex + 1) : pathNames;

  /**
   * Transforms a path segment for use in the breadcrumb.
   *
   * This function processes each segment of the current URL path to determine
   * how it should be displayed in the breadcrumb navigation. It omits numeric segments,
   * applies special handling for UUIDs by checking for custom titles in the search params,
   * and excludes segments like "facilities" when a "reports" segment is present.
   *
   * @param segment - The current URL path segment.
   * @param index - The index of the current segment within the overall path.
   * @returns The transformed segment as a string or null if the segment should be omitted.
   */
  function transformPathSegment(segment: string, index: number): string | null {
    // Omit "facilities" if "reports" exists in the path.
    if (
      pathNames.some((path) => path.toLowerCase() === "reports") &&
      segment.toLowerCase() === "facilities"
    ) {
      return null;
    }

    // Check if the current segment is a valid UUID or numeric.
    if (isValidUUID(segment) || isNumeric(segment)) {
      const precedingSegment = pathNames[index - 1]
        ? unslugifyAndCapitalize(pathNames[index - 1])
        : "";

      // If there is a title associated with the preceding segment, return it.
      if (
        precedingSegment &&
        crumbTitles[`${precedingSegment.toLowerCase()}_title`]
      )
        return crumbTitles[`${precedingSegment.toLowerCase()}_title`];

      // If there's a title for the numeric/UUID segment itself, return it.
      // If no title is found, omit the segment by returning null.
      return crumbTitles?.title || null;
    }

    // For all other segments, return the segment as-is.
    return segment;
  }

  // Build an array of visible breadcrumbs by filtering out any segments where transformPathSegment returns null.
  // This ensures that only valid, displayable breadcrumb items are rendered (e.g. numeric segments are omitted).
  const visibleCrumbs = slicedPathNames
    // For each segment in slicedPathNames, create an object containing:
    // - link: the original segment value,
    // - index: its position in the array (used later to reconstruct the path),
    // - content: the transformed value (processed based on whether capitalization is desired),
    //   which may be null if the segment is to be omitted.
    .map((link, index) => {
      const content = capitalizeLinks
        ? transformPathSegment(unslugifyAndCapitalize(link), index)
        : transformPathSegment(link, index);
      // If content is valid (not null), return an object with the link, its index, and the content.
      // Otherwise, return null for this segment.
      return content ? { link, index, content } : null;
    })
    // Filter out any null values from the array. This leaves us with only the breadcrumb items
    // that have valid content, ensuring that no empty breadcrumb items (or trailing separators) are rendered.
    .filter((crumb) => crumb !== null) as {
    link: string;
    index: number;
    content: string;
  }[];

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
                  {!isLastDefaultLink || visibleCrumbs.length > 0
                    ? separator
                    : null}{" "}
                  {/* Conditionally render the separator */}
                </li>
              );
            })}
            {visibleCrumbs.map((crumb, i) => {
              const isLastItem = i === visibleCrumbs.length - 1;
              if (!isLastItem) {
                // Create a link for all but the last breadcrumb item.
                const path = `/${slicedPathNames
                  .slice(0, crumb.index + 1)
                  .join("/")}`;
                const queryString = serializeSearchParams(searchParams);
                const href = zone
                  ? `/${zone}${path}${queryString}`
                  : `${path}${queryString}`;

                return (
                  <li key={crumb.link} className={liStyle}>
                    <Link href={href} className={aStyle}>
                      {crumb.content}
                    </Link>
                    {separator}
                  </li>
                );
              } else {
                // For the last breadcrumb item, do not add a separator and apply bold styling.
                return (
                  <li
                    key={crumb.link}
                    data-testid="breadcrumb-last-item"
                    className={liStyle}
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    {crumb.content}
                  </li>
                );
              }
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
