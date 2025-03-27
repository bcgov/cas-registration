"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "@mui/material/Link";
import serializeSearchParams from "@bciers/utils/src/serializeSearchParams";

type TBreadCrumbProps = {
  separator: React.ReactNode;
  capitalizeLinks: boolean;
  defaultLinks?: { label: string; href: string }[];
  zone?: string;
};

const isValidUUID = (segment: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(segment);
};

function unslugifyAndCapitalize(segment: string): string {
  if (isValidUUID(segment)) return segment;
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function isNumeric(value: string): boolean {
  return !isNaN(Number(value));
}

function isValidLink(segment: string): boolean {
  const invalidWords = ["confirm", "received", "request-access"];
  return !invalidWords.some((word) => segment.toLowerCase().includes(word));
}

const liStyle = "inline text-white text-lg";
const aStyle = "text-white text-lg";

export default function Bread({
  separator,
  capitalizeLinks,
  defaultLinks = [],
  zone = "",
}: TBreadCrumbProps) {
  const paths = usePathname();
  console.log("paths", paths);
  const pathNames = paths.split("/").filter((path) => path);
  console.log("pathNames", pathNames);
  const searchParams = useSearchParams();
  const crumbTitles = Object.fromEntries(searchParams.entries());

  const showBreadcrumb = paths !== "/onboarding";
  if (!showBreadcrumb) return null;

  const isLastBreadcrumbItem = (link: string, index: number) => {
    const lastLinkValues = ["register-an-operation"];
    return lastLinkValues.includes(link) || index === pathNames.length - 1;
  };

  const lastLinkIndex = pathNames.findIndex((link, index) =>
    isLastBreadcrumbItem(link, index),
  );
  const slicedPathNames =
    lastLinkIndex !== -1 ? pathNames.slice(0, lastLinkIndex + 1) : pathNames;

  // If the current path includes "report-history" and the last segment of the path is numeric,
  // remove the last segment from the slicedPathNames array.
  if (
    paths.includes("report-history") &&
    isNumeric(pathNames[pathNames.length - 1])
  ) {
    slicedPathNames.pop();
  }
  function transformPathSegment(segment: string, index: number): string | null {
    if (
      pathNames.some((path) => path.toLowerCase() === "reports") &&
      segment.toLowerCase() === "facilities"
    ) {
      return null;
    }

    if (isValidUUID(segment) || isNumeric(segment)) {
      const precedingSegment = pathNames[index - 1]
        ? unslugifyAndCapitalize(pathNames[index - 1])
        : "";

      if (
        precedingSegment &&
        crumbTitles[`${precedingSegment.toLowerCase()}_title`]
      )
        return crumbTitles[`${precedingSegment.toLowerCase()}_title`];

      return crumbTitles?.title || null;
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
                    : null}
                </li>
              );
            })}
            {slicedPathNames.map((link, index) => {
              if (!isValidLink(link)) return null;
              const isLastItem = index === slicedPathNames.length - 1;
              const content = capitalizeLinks
                ? transformPathSegment(unslugifyAndCapitalize(link), index)
                : transformPathSegment(link, index);

              if (!content) {
                return null;
              }

              if (!isLastItem) {
                const path = `/${slicedPathNames
                  .slice(0, index + 1)
                  .join("/")}`;
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
                return (
                  <li
                    key={link}
                    data-testid="breadcrumb-last-item"
                    className={liStyle}
                    style={{
                      fontWeight: "bold",
                    }}
                  >
                    {content}
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
