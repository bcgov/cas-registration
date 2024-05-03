import { userEvent } from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@/app/components/form/FormBase";
import { actionHandler, useSession } from "@/tests/setup/mocks";
import { Session } from "@/tests/setup/types";

const fileFieldLabel = "FileWidget test field";
const fileLabelRequired = `${fileFieldLabel}*`;
export const dummyDataUri = "pdf;name=dummy.pdf;base64,dGVzdA==";
const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });

vi.resetAllMocks();

export const fileFieldSchema = {
  type: "object",
  required: ["fileTestField"],
  properties: {
    fileTestField: {
      type: "string",
      format: "data-url",
      title: fileFieldLabel,
    },
  },
} as RJSFSchema;

export const fileFieldUiSchema = {
  fileTestField: {
    "ui:widget": "FileWidget",
  },
};

describe("RJSF FileWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "industry_user_admin",
        },
      },
    } as Session);
  });

  it("should render a file field", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);
    // Using toBeInTheDocument() instead of toBeVisible() because the file input is hidden
    expect(screen.getByLabelText(fileLabelRequired)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload attachment" }),
    ).toBeVisible();
    expect(screen.getByText("No attachment was uploaded")).toBeVisible();
  });

  it("should render the file value when formData is provided", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: dummyDataUri,
        }}
        uiSchema={fileFieldUiSchema}
      />,
    );

    expect(screen.getByText("dummy.pdf")).toBeVisible();
  });

  it("should allow uploading a file", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    actionHandler.mockResolvedValueOnce({});

    expect(screen.getByText("test.pdf")).toBeVisible();
  });

  it("should change the upload button text when a file is uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    actionHandler.mockResolvedValueOnce({});

    expect(
      screen.getByRole("button", { name: "Reupload attachment" }),
    ).toBeVisible();
  });

  it("should display the file preview link when a file is uploaded", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);
    const input = screen.getByLabelText(fileLabelRequired);

    const previewLink = screen.queryByRole("link", { name: "Preview" });
    expect(previewLink).not.toBeInTheDocument();

    await userEvent.upload(input, mockFile);

    actionHandler.mockResolvedValueOnce({});

    waitFor(() => {
      expect(previewLink).toBeVisible();
    });
  });

  it("should have the correct href for the preview link", async () => {
    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    waitFor(() => {
      const previewLink = screen.getByRole("link", { name: "Preview" });
      expect(previewLink).toHaveAttribute("href", dummyDataUri);
    });
  });

  it("should not render the upload button for internal users", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_admin",
        },
      },
    } as Session);

    render(<FormBase schema={fileFieldSchema} uiSchema={fileFieldUiSchema} />);

    expect(
      screen.queryByRole("button", { name: "Upload attachment" }),
    ).not.toBeInTheDocument();
  });
});
