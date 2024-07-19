import { render, screen } from "@testing-library/react";
import { describe, expect, vi, it, beforeEach } from "vitest";
import React from "react";
import OperationReview from "@reporting/src/app/components/operations/OperationReview";
import { UUID } from "crypto";

// Mock data
const mockFormData = {
  operatorLegalName: "Test Operator Legal Name",
  operatorTradeName: "Test Operator Trade Name",
  operationName: "Test Operation Name",
  operationType: "Test Operation Type",
  BCGHGID: "12345",
  BOROID: "54321",
  operationRepresentative: "Test Representative",
  reportingActivities: ["Activity 1", "Activity 2"],
  regulatedProducts: ["Product 1", "Product 2"],
};

// Mock UUID
const mockVersionId = "123e4567-e89b-12d3-a456-426614174000" as UUID;

describe("OperationReview component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the OperationReview component with given formData", async () => {
    render(
      <OperationReview formData={mockFormData} version_id={mockVersionId} />,
    );

    // Check if the MultiStepHeader is rendered
    expect(
      screen.getAllByText(/Operation Information/i).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText(/Facilities Information/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText(/Compliance Summary/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByText(/Sign-off & Submit/i).length).toBeGreaterThan(0);

    // Check if the Review operation information header is rendered
    expect(
      screen.getAllByText(/Review operation information/i).length,
    ).toBeGreaterThan(0);

    // Check if the info message is rendered
    expect(
      screen.getByText(
        /The information shown on this page is data entered in registration/i,
      ),
    ).toBeInTheDocument();

    // Check if the form is rendered with correct data
    expect(screen.getByLabelText(/Operator Legal Name/i)).toHaveValue(
      "Test Operator Legal Name",
    );
    expect(screen.getByLabelText(/Operator Trade Name/i)).toHaveValue(
      "Test Operator Trade Name",
    );
    expect(screen.getByLabelText(/Operation Name/i)).toHaveValue(
      "Test Operation Name",
    );
    expect(screen.getByLabelText(/BCGHG ID/i)).toHaveValue("12345");
    expect(screen.getByLabelText(/BORO ID/i)).toHaveValue("54321");
    expect(screen.getByLabelText(/Operation Representative/i)).toHaveValue(
      "Test Representative",
    );

    // Check if buttons are rendered
    expect(
      screen.getByText(/Sync latest data from registration/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue/i)).toBeInTheDocument();
  });
});
