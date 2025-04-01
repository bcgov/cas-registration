"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import Note from "@bciers/components/layout/Note";

const FacilityPageBanner: React.FC = () => {
  const searchParams = useSearchParams();
  const fromRegistration = searchParams?.get("from_registration") === "true";

  if (!fromRegistration) return null;

  return (
    <Note variant="important">
      This link opened in a new tab. If you make edits here, refresh the
      previous tab to see the updates. To go back, close this tab.
    </Note>
  );
};

export default FacilityPageBanner;
