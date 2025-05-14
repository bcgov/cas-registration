import { IssuanceStatusApprovedNote } from "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote";
import { setupIssuanceStatusNoteTest } from "../../../../utils/issuanceStatusNoteTestUtils";
import { vi } from "vitest";
import React from "react";

vi.mock("@bciers/components/icons/Check", () => ({
  __esModule: true,
  default: (props: any) => (
    <div aria-label="check icon" {...props}>
      Check Icon
    </div>
  ),
}));

vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return {
    ...actual,
    Paper: vi.fn().mockImplementation(({ className, children }) => (
      <div role="note" className={className}>
        {children}
      </div>
    )),
    Box: vi
      .fn()
      .mockImplementation(({ className, children }) => (
        <div className={className}>{children}</div>
      )),
    Typography: vi
      .fn()
      .mockImplementation(({ className, variant, children }) => (
        <p className={className} data-variant={variant}>
          {children}
        </p>
      )),
    Link: vi
      .fn()
      .mockImplementation(({ href, target, rel, className, children }) => (
        <a href={href} target={target} rel={rel} className={className}>
          {children}
        </a>
      )),
  };
});

setupIssuanceStatusNoteTest({
  component: IssuanceStatusApprovedNote,
  testDescription: "IssuanceStatusApprovedNote",
  expectedStyling: {
    containerClasses: ["p-4", "mb-[10px]", "bg-[#DCE9F6]", "text-bc-text"],
  },
  expectedIcon: {
    type: "check",
    width: "24",
  },
  expectedTextContent: [
    /your request is approved/i,
    /the earned credits have been issued to your holding account/i,
    /successfully/i,
  ],
  expectedLink: {
    text: /b\.c\. carbon registry/i,
    href: "#",
    target: "_blank",
    rel: "noopener noreferrer",
    classes: ["text-bc-link-blue", "underline", "font-bold"],
  },
})();
