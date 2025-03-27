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
      This link has opened in a new tab. To go back to the previous page, close
      this tab.
    </Note>
  );
};

export default FacilityPageBanner;
