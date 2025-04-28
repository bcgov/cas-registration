"use client";

import React from "react";
import Note from "@bciers/components/layout/Note";
import { useSearchParams } from "next/navigation";

const NewTabBanner: React.FC = () => {
  const searchParams = useSearchParams();
  const isNewTab = (searchParams?.get("isNewTab") as string) === "true";
  const fromRegistration =
    (searchParams?.get("from_registration") as string) === "true";
  return (
    isNewTab && (
      <>
        {fromRegistration ? (
          <Note variant="important">
            This link has opened in a new tab. If you make edits here, refresh
            the previous tab to see the updates. To go back, close this tab.
          </Note>
        ) : (
          <Note variant="important">
            This link has opened in a new tab. To go back to the report, close
            this tab. Then click sync latest changes.
          </Note>
        )}
      </>
    )
  );
};

export default NewTabBanner;
