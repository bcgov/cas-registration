import { userEvent } from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { RJSFSchema } from "@rjsf/utils";
import FormBase from "@bciers/components/form/FormBase";
import { actionHandler, useSessionRole } from "@bciers/testConfig/mocks";
import { checkNoValidationErrorIsTriggered } from "@bciers/testConfig/helpers/form";
import { useFileUploadWidget } from "./FileWidget";

const fileFieldLabel = "FileWidget test field";
const fileLabelRequired = `${fileFieldLabel}*`;
const mockFile = new File(["test"], "test.pdf", { type: "application/pdf" });
const mockFile2 = new File(["test2"], "test2.pdf", { type: "application/pdf" });
const mockFileUnaccepted = new File(["test"], "test.txt", {
  type: "text/plain",
});

const alertMock = vi.spyOn(window, "alert");

export const fileFieldSchema = {
  type: "object",
  required: ["fileTestField"],
  properties: {
    fileTestField: {
      type: "string",
      title: fileFieldLabel,
    },
  },
} as RJSFSchema;

export const fileFieldUiSchema = {
  fileTestField: {
    "ui:widget": "FileWidget",
    "ui:options": { accept: ".pdf", filePreview: true },
  },
};

// an out-of-context context for when we don't test the submission
// eslint-disable-next-line react-hooks/rules-of-hooks
const formContext = { onFileSelected: vi.fn() };

describe("RJSF FileWidget", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useSessionRole.mockReturnValue("industry_user_admin");
  });

  const createMock21MBFile = () => {
    const file = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(file, "size", {
      value: 21000000,
      writable: false,
    });
    return file;
  };

  it("should render a file field", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );
    // Using toBeInTheDocument() instead of toBeVisible() because the file input is hidden
    expect(screen.getByLabelText(fileLabelRequired)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Upload attachment" }),
    ).toBeVisible();
    expect(screen.getByText("No attachment was uploaded.")).toBeVisible();
    expect(screen.queryByRole("input")).not.toBeInTheDocument();
  });

  it("should render the scanning message when formData is provided and scanStatus is Unscanned", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: '{"name":"testpdf.pdf","status":"Unscanned"}',
        }}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    expect(
      screen.getByText(
        "Uploading. You may continue to the next page while the file is being scanned for security.",
      ),
    ).toBeVisible();
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "testpdf.pdf",
    );
  });

  it("should render the quarantine message when formData is provided and scanStatus is Quarantined", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: '{"name":"testpdf.pdf","status":"Quarantined"}',
        }}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    expect(
      screen.getByText(
        'Security risk found in "testpdf.pdf". Check for malware or upload a different file.',
      ),
    ).toBeVisible();

    expect(
      screen.queryByRole("button", { name: "Preview" }),
    ).not.toBeInTheDocument();
  });

  it("should render the file value when formData is provided and scanStatus is Clean", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: '{"name":"testpdf.pdf","status":"Clean"}',
        }}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    expect(screen.getByText("testpdf.pdf")).toBeVisible();
  });

  it("should allow uploading a file", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Uploading. You may continue to the next page while the file is being scanned for security.",
        ),
      ).toBeVisible();
    });
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.pdf",
    );
    expect(
      screen.queryByText("No attachment was uploaded."),
    ).not.toBeInTheDocument();
  });

  it("should not allow uploading a file with an unaccepted file type", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFileUnaccepted);

    expect(screen.getByText("No attachment was uploaded.")).toBeVisible();
  });

  it("should change the upload button text when a file is uploaded", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Reupload attachment" }),
      ).toBeVisible();
    });
  });

  it("supports file formats such as .kml and .kmz", async () => {
    const mockFileFieldUiSchema = {
      fileTestField: {
        "ui:widget": "FileWidget",
        "ui:options": { accept: ".kml,.kmz" },
      },
    };
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={mockFileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);
    const mockKmlFile = new File(["test"], "test.kml", {
      type: "application/vnd.google-earth.kml+xml",
    });
    const mockKmzFile = new File(["test"], "test.kmz", {
      type: "application/vnd.google-earth.kmz",
    });

    await userEvent.upload(input, mockKmlFile);
    await waitFor(() => {
      expect(
        screen.getByText(
          "Uploading. You may continue to the next page while the file is being scanned for security.",
        ),
      ).toBeVisible();
    });
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.kml",
    );

    await userEvent.upload(input, mockKmzFile);
    await waitFor(() => {
      expect(
        screen.getByText(
          "Uploading. You may continue to the next page while the file is being scanned for security.",
        ),
      ).toBeVisible();
    });
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.kmz",
    );
  });

  it("should not allow uploading a file larger than 20MB", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, createMock21MBFile());

    expect(screen.getByText("No attachment was uploaded.")).toBeVisible();
  });

  it("should display the alert when a file larger than 20MB is uploaded", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, createMock21MBFile());

    expect(alertMock).toHaveBeenCalledWith("File size must be less than 20MB");
  });

  it("should allow replacing an uploaded file before submission", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(input, mockFile);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Uploading. You may continue to the next page while the file is being scanned for security.",
        ),
      ).toBeVisible();
    });
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.pdf",
    );

    await userEvent.upload(input, mockFile2);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Uploading. You may continue to the next page while the file is being scanned for security.",
        ),
      ).toBeVisible();
    });
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test2.pdf",
    );
  });

  it("should allow replacing an uploaded file after submission", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: '{"name":"testpdf.pdf","status":"Clean"}',
        }}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const input = screen.getByLabelText(fileLabelRequired);

    expect(screen.getByText("testpdf.pdf")).toBeVisible();

    await userEvent.upload(input, mockFile2);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Uploading. You may continue to the next page while the file is being scanned for security.",
        ),
      ).toBeVisible();
    });
    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test2.pdf",
    );
  });

  it("should display the file preview link when a file is uploaded", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );
    const input = screen.getByLabelText(fileLabelRequired);

    expect(
      screen.queryByRole("link", { name: "Preview" }),
    ).not.toBeInTheDocument();

    await userEvent.upload(input, mockFile);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Preview" })).toBeVisible();
    });
  });

  it("should have the correct href for the preview link", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formData={{
          fileTestField: '{"name":"testpdf.pdf","status":"Clean"}',
        }}
        formContext={formContext}
      />,
    );
    const previewLink = screen.getByRole("button", { name: "Preview" });
    expect(previewLink).toBeVisible();
  });

  it("should not render the upload button for internal users", () => {
    useSessionRole.mockReturnValue("cas_admin");

    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Upload attachment" }),
    ).not.toBeInTheDocument();
  });

  it("should show the validation error message if file is not uploaded", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(screen.getByText(/^.* is required/i)).toBeVisible();
  });

  it("should not trigger an error if the data is valid", async () => {
    render(
      <FormBase
        schema={fileFieldSchema}
        formData={{
          fileTestField: '{"name":"testpdf.pdf","status":"Clean"}',
        }}
        uiSchema={fileFieldUiSchema}
        formContext={formContext}
      />,
    );

    await checkNoValidationErrorIsTriggered();
  });

  it("submits the uploaded files with the form", async () => {
    actionHandler.mockResolvedValueOnce({});

    const TestComponent = () => {
      const [formContext, submitWithFiles] = useFileUploadWidget();
      return (
        <FormBase
          schema={fileFieldSchema}
          uiSchema={fileFieldUiSchema}
          formContext={formContext}
          onSubmit={async (data) => {
            await submitWithFiles(data.formData, "/testapi/submit", "POST");
          }}
        />
      );
    };

    render(<TestComponent />);
    const input = screen.getByLabelText(fileLabelRequired);
    await userEvent.upload(
      input,
      new File(["THEFILE"], "test.pdf", { type: "application/pdf" }),
    );

    await waitFor(() => {
      expect(
        screen.getByText(
          "Uploading. You may continue to the next page while the file is being scanned for security.",
        ),
      ).toBeVisible();
    });

    const submitButton = screen.getByRole("button", { name: "Submit" });

    await userEvent.click(submitButton);

    expect(actionHandler).toHaveBeenCalledTimes(1);
    expect(actionHandler.mock.calls[0]).toEqual([
      "/testapi/submit",
      "POST",
      undefined,
      expect.toSatisfy((submitted) => {
        const entries = Object.fromEntries(submitted.body);

        expect(entries.fileTestField).toBeInstanceOf(File);
        expect(entries.payload).toEqual(
          JSON.stringify({
            fileTestField: JSON.stringify({
              name: "test.pdf",
              status: "Unscanned",
            }),
          }),
        );
        return true;
      }),
    ]);

    expect(screen.getByRole("listitem")).toHaveAttribute(
      "data-name",
      "test.pdf",
    );
  });
});
