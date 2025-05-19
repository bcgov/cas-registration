import { IssuanceStatusAwaitingNote } from "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusAwaitingNote";
import { BC_GOV_YELLOW } from "@bciers/styles";
import { setupIssuanceStatusNoteTest } from "../../../../utils/issuanceStatusNoteTestUtils";
import { vi } from "vitest";
import React from "react";

// Mock the TimeIcon component
vi.mock("@bciers/components/icons", () => ({
  TimeIcon: (props: any) => (
    <div aria-label="time icon" {...props}>
      Time Icon
    </div>
  ),
}));

// Mock the Material UI components
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

// Run the tests
setupIssuanceStatusNoteTest({
  component: IssuanceStatusAwaitingNote,
  testDescription: "IssuanceStatusAwaitingNote",
  expectedStyling: {
    containerClasses: ["p-4", "mb-[10px]", "bg-[#DCE9F6]", "text-bc-text"],
  },
  expectedIcon: {
    type: "time",
    color: BC_GOV_YELLOW,
    width: "32",
    height: "32",
  },
  expectedTextContent: [
    /your request has been submitted successfully/i,
    /once your request is approved/i,
    /the earned credits will be issued/i,
    /\(bccr\)/i,
  ],
  expectedLink: {
    text: /b\.c\. carbon registry/i,
    href: "#",
    target: "_blank",
    rel: "noopener noreferrer",
    classes: ["text-bc-link-blue", "underline", "font-bold"],
  },
})();
