import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import React from "react";
import { newEntrantOperationSchema } from "@/registration/app/data/jsonSchema/operationRegistration/newEntrantOperation";
import NewEntrantOperationForm from "@/registration/app/components/operations/registration/NewEntrantOperationForm";
import { allOperationRegistrationSteps } from "@/registration/app/components/operations/registration/enums";
import { actionHandler, useRouter, useSession } from "@bciers/testConfig/mocks";

useSession.mockReturnValue({
  data: {
    user: {
      app_role: "industry_user_admin",
    },
  },
});

const mockPush = vi.fn();
useRouter.mockReturnValue({
  query: {},
  push: mockPush,
});

export const mockDataUri =
  "data:application/pdf;name=testpdf.pdf;scanstatus=Clean;base64,ZHVtbXk=";
const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });

describe("the NewEntrantOperationForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the NewEntrantOperationForm component", () => {
    render(
      <NewEntrantOperationForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={newEntrantOperationSchema}
        step={4}
        steps={allOperationRegistrationSteps}
      />,
    );

    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "New Entrant Operation",
    );

    expect(
      screen.getByText("When is this operation’s date of First Shipment?*"),
    ).toBeVisible();

    expect(
      screen.getByLabelText("On or before March 31, 2024"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("On or after April 1, 2024"),
    ).toBeInTheDocument();
  });

  it("should display a file when formData is provided", () => {
    render(
      <NewEntrantOperationForm
        formData={{
          new_entrant_application: mockDataUri,
        }}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={newEntrantOperationSchema}
        step={4}
        steps={allOperationRegistrationSteps}
      />,
    );

    expect(screen.getByText("testpdf.pdf")).toBeVisible();
  });

  it("should display the correct url and message for the default date choice", () => {
    const { container } = render(
      <NewEntrantOperationForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={newEntrantOperationSchema}
        step={4}
        steps={allOperationRegistrationSteps}
      />,
    );
    expect(
      container.querySelector("#root_on_or_after_april_1_section")?.children[0]
        .children[1],
    ).toHaveTextContent(
      "Please download and complete the following application form template to receive designation as a New Entrant in the B.C. OBPS. This application form is for operations with a date of First Shipment on or after April 1, 2024.",
    );

    expect(
      screen.getByRole("link", { name: /application form template/i }),
    ).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/assets/download/751CDDAE4C9A411E974EEA9737CD42C6",
    );
  });

  it("should display the correct url and message for the before March 31 date choice", async () => {
    const { container } = render(
      <NewEntrantOperationForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={newEntrantOperationSchema}
        step={4}
        steps={allOperationRegistrationSteps}
      />,
    );

    const beforeMarch31Radio = screen.getByLabelText(
      "On or before March 31, 2024",
    );

    await userEvent.click(beforeMarch31Radio);

    expect(
      container.querySelector("#root_on_or_before_march_31_section")
        ?.children[0].children[1],
    ).toHaveTextContent(
      "Please download and complete the following application form template to receive designation as a New Entrant in the B.C. OBPS. This application form is for operations with a date of First Shipment on or before March 31, 2024.",
    );

    expect(
      screen.getByRole("link", { name: /application form template/i }),
    ).toHaveAttribute(
      "href",
      "https://www2.gov.bc.ca/assets/download/F5375D72BE1C450AB52C2E3E6A618959",
    );
  });

  it("should display required field message if the users submits without attaching a file", async () => {
    render(
      <NewEntrantOperationForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={newEntrantOperationSchema}
        step={4}
        steps={allOperationRegistrationSteps}
      />,
    );

    const submitButton = screen.getByRole("button", {
      name: "Save and Continue",
    });

    await userEvent.click(submitButton);

    expect(screen.getByText("Attachment is mandatory.")).toBeVisible();
  });

  it("should fill the form and redirect to the next page", async () => {
    actionHandler.mockResolvedValue({
      error: null,
    });
    render(
      <NewEntrantOperationForm
        formData={{}}
        operation="002d5a9e-32a6-4191-938c-2c02bfec592d"
        schema={newEntrantOperationSchema}
        step={4}
        steps={allOperationRegistrationSteps}
      />,
    );

    const beforeMarch31Radio = screen.getByLabelText(
      "On or before March 31, 2024",
    );

    await userEvent.click(beforeMarch31Radio);

    const input = screen.getByTestId("root_new_entrant_application");
    await userEvent.upload(input, mockFile);

    expect(screen.getByText("Upload in progress....")).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.pdf",
    );

    const submitButton = screen.getByRole("button", {
      name: "Save and Continue",
    });

    act(() => {
      fireEvent.click(submitButton);
    });

    expect(actionHandler).toHaveBeenCalledTimes(1);

    expect(actionHandler).toHaveBeenCalledWith(
      "registration/operations/002d5a9e-32a6-4191-938c-2c02bfec592d/registration/new-entrant-application",
      "PUT",
      "/register-an-operation/002d5a9e-32a6-4191-938c-2c02bfec592d",
      {
        body: '{"new_entrant_application":"data:application/pdf;name=test.pdf;base64,dGVzdA==","date_of_first_shipment":"On or before March 31, 2024"}',
      },
    );
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        "/register-an-operation/002d5a9e-32a6-4191-938c-2c02bfec592d/5",
      );
    });
  });
});
