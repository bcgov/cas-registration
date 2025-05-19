import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { StatusOfIssuance } from "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/StatusOfIssuance";
import {
  IssuanceStatus,
  RequestIssuanceTrackStatusData,
} from "../../../../../app/utils/getRequestIssuanceTrackStatusData";

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusAwaitingNote",
  () => ({
    IssuanceStatusAwaitingNote: () => (
      <section aria-label="awaiting note" role="status">
        Awaiting Note
      </section>
    ),
  }),
);

vi.mock(
  "../../../../../app/components/compliance-summary/request-issuance/track-status-of-issuance/IssuanceStatusApprovedNote",
  () => ({
    IssuanceStatusApprovedNote: () => (
      <section aria-label="approved note" role="status">
        Approved Note
      </section>
    ),
  }),
);

vi.mock("../../../../../app/components/compliance-summary/InfoRow", () => ({
  InfoRow: ({ label, value }: { label: string; value: string }) => (
    <div role="row" aria-label={`${label} ${value}`}>
      <span role="rowheader">{label}</span>: <span role="cell">{value}</span>
    </div>
  ),
}));

vi.mock("../../../../../app/components/compliance-summary/TitleRow", () => ({
  TitleRow: ({ label }: { label: string }) => (
    <h2 role="heading" aria-level={2}>
      {label}
    </h2>
  ),
}));

describe("StatusOfIssuance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockData = (
    status: IssuanceStatus,
  ): RequestIssuanceTrackStatusData => ({
    operation_name: "Test Operation",
    earnedCredits: 100,
    issuanceStatus: status,
    bccrTradingName: "Test Trading Name",
    directorsComments: "Director's test comments",
  });

  it("renders the title row correctly", () => {
    render(<StatusOfIssuance data={createMockData(IssuanceStatus.AWAITING)} />);

    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeVisible();
    expect(heading).toHaveTextContent("Status of Issuance");
  });

  it("renders common info rows correctly", () => {
    const mockData = createMockData(IssuanceStatus.AWAITING);
    render(<StatusOfIssuance data={mockData} />);

    const earnedCreditsRow = screen.getByRole("row", {
      name: /earned credits: 100/i,
    });
    expect(earnedCreditsRow).toBeVisible();
    expect(within(earnedCreditsRow).getByRole("cell")).toHaveTextContent("100");

    const statusRow = screen.getByRole("row", {
      name: /status of issuance: issuance requested, awaiting approval/i,
    });
    expect(statusRow).toBeVisible();
    expect(within(statusRow).getByRole("cell")).toHaveTextContent(
      "Issuance requested, awaiting approval",
    );

    const tradingNameRow = screen.getByRole("row", {
      name: /bccr trading name: test trading name/i,
    });
    expect(tradingNameRow).toBeVisible();
    expect(within(tradingNameRow).getByRole("cell")).toHaveTextContent(
      "Test Trading Name",
    );
  });

  it("renders awaiting status note when status is AWAITING", () => {
    render(<StatusOfIssuance data={createMockData(IssuanceStatus.AWAITING)} />);

    expect(
      screen.getByRole("status", { name: /awaiting note/i }),
    ).toBeVisible();
    expect(
      screen.queryByRole("status", { name: /approved note/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("row", { name: /director's comments/i }),
    ).not.toBeInTheDocument();
  });

  it("renders approved status note and director's comments when status is APPROVED", () => {
    render(<StatusOfIssuance data={createMockData(IssuanceStatus.APPROVED)} />);

    expect(
      screen.getByRole("status", { name: /approved note/i }),
    ).toBeVisible();

    expect(
      screen.queryByRole("status", { name: /awaiting note/i }),
    ).not.toBeInTheDocument();

    const directorsCommentsRow = screen.getByRole("row", {
      name: /director's comments: director's test comments/i,
    });
    expect(directorsCommentsRow).toBeVisible();
    expect(within(directorsCommentsRow).getByRole("cell")).toHaveTextContent(
      "Director's test comments",
    );
  });
});
