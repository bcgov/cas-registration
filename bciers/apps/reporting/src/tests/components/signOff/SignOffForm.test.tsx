import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SignOffForm from "@reporting/src/app/components/signOff/SignOffForm";
import { dummyNavigationInformation } from "../taskList/utils";
import { useRouter } from "@bciers/testConfig/mocks";
import { ReportingFlow } from "@reporting/src/app/components/taskList/types";
import { buildSignOffSchema } from "@reporting/src/data/jsonSchema/signOff/signOff";

const renderSignOffFormWithSchema = ({
  isSupplementary = false,
  isRegulated = true,
  flow = ReportingFlow.SFO,
}) => {
  const schema = buildSignOffSchema(isSupplementary, isRegulated, flow);

  render(
    <SignOffForm
      version_id={1}
      navigationInformation={dummyNavigationInformation}
      schema={schema}
    />,
  );

  return schema;
};

describe("SignOffForm Component (with actual schema)", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useRouter.mockReturnValue({
      refresh: vi.fn(),
    });
  });

  it("renders supplementary flow correctly with isRegulated: true", () => {
    const schema = renderSignOffFormWithSchema({
      isSupplementary: true,
      isRegulated: true,
      flow: ReportingFlow.SFO,
    });

    const supplementaryFields = schema.supplementary?.properties ?? {}; // Use dot notation here

    Object.values(supplementaryFields).forEach((field: any) => {
      if (field.title) {
        expect(screen.getByText(field.title)).toBeInTheDocument();
      }
    });

    // Ensure the regulated field is present
    expect(
      screen.getByText(
        "I understand that the correction of any errors, omissions, or misstatements in the new submission of this report may lead to an additional compliance obligation, and, if submitted after the compliance obligation deadline, applicable interest.",
      ),
    ).toBeInTheDocument();
  });

  it("renders supplementary flow correctly with isRegulated: false", () => {
    const schema = renderSignOffFormWithSchema({
      isSupplementary: true,
      isRegulated: false,
      flow: ReportingFlow.SFO,
    });

    const supplementaryFields = schema.supplementary?.properties ?? {}; // Use dot notation here

    Object.values(supplementaryFields).forEach((field: any) => {
      if (field.title) {
        expect(screen.getByText(field.title)).toBeInTheDocument();
      }
    });

    // Ensure the regulated field is NOT present
    expect(
      screen.queryByText(
        "I understand that the correction of any errors, omissions, or misstatements in the new submission of this report may lead to an additional compliance obligation, and, if submitted after the compliance obligation deadline, applicable interest.",
      ),
    ).not.toBeInTheDocument();
  });

  it("renders non-supplementary, non-EIO flow correctly", () => {
    const schema = renderSignOffFormWithSchema({
      isSupplementary: false,
      isRegulated: true,
      flow: ReportingFlow.SFO,
    });

    // Ensure core and non-EIO-specific fields are present
    Object.values(schema.properties).forEach((field: any) => {
      if (field.title) {
        expect(screen.getByText(field.title)).toBeInTheDocument();
      }
    });
  });

  it("renders supplementary flow correctly", () => {
    const schema = renderSignOffFormWithSchema({
      isSupplementary: true,
      isRegulated: true,
      flow: ReportingFlow.SFO,
    });

    const supplementaryFields = schema.supplementary?.properties ?? {}; // Use dot notation here
    Object.values(supplementaryFields).forEach((field: any) => {
      if (field.title) {
        expect(screen.getByText(field.title)).toBeInTheDocument();
      }
    });
  });

  it("renders EIO-specific fields when flow is EIO", () => {
    renderSignOffFormWithSchema({
      isSupplementary: false,
      isRegulated: false,
      flow: ReportingFlow.EIO,
    });

    expect(
      screen.getByText(
        "I understand that any errors, omissions, or misstatements provided in this report can lead to administrative penalties.",
      ),
    ).toBeInTheDocument();
  });

  it("enables submit when all required fields are filled", async () => {
    renderSignOffFormWithSchema({
      isSupplementary: false,
      isRegulated: true,
      flow: ReportingFlow.SFO,
    });

    // Click all checkboxes
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((cb) => fireEvent.click(cb));

    // Fill in signature field
    const signatureField = screen.getByLabelText(/signature/i);
    fireEvent.change(signatureField, { target: { value: "John Doe" } });

    const submitButton = screen.getByRole("button", { name: /submit report/i });

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("disables submit initially", () => {
    renderSignOffFormWithSchema({
      isSupplementary: false,
      isRegulated: true,
      flow: ReportingFlow.SFO,
    });

    const submitButton = screen.getByRole("button", { name: /submit report/i });
    expect(submitButton).toBeDisabled();
  });

  it("toggles checkbox states", () => {
    renderSignOffFormWithSchema({
      isSupplementary: false,
      isRegulated: true,
      flow: ReportingFlow.SFO,
    });

    const checkbox = screen.getByRole("checkbox", {
      name: /I certify that I have reviewed the annual report/i,
    });

    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});
