import { useRouter } from "next/navigation";
import { postProductionData } from "@reporting/src/app/utils/productDataForm/postProductionData";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import ProductionDataForm from "@reporting/src/app/components/products/ProductionDataForm";
import { act, render, waitFor } from "@testing-library/react";
import { dummyNavigationInformation } from "@reporting/src/tests/components/taskList/utils";
import ReportValidationSummary from "@reporting/src/app/components/shared/validation/ReportValidationSummary";
import { createGenericReportValidationError } from "@reporting/src/app/components/shared/validation/utils";

vi.mock(
  "@reporting/src/app/components/shared/validation/ReportValidationSummary",
  () => ({
    default: vi.fn(() => null),
  }),
);

const mockReportValidationSummary = ReportValidationSummary as ReturnType<
  typeof vi.fn
>;
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("@bciers/components/form/MultiStepFormWithTaskList", () => ({
  default: vi.fn(({ children }) => <div>{children}</div>),
}));
vi.mock("@reporting/src/app/utils/productDataForm/postProductionData", () => ({
  postProductionData: vi.fn(),
}));

const mockMultiStepFormWithTaskList = MultiStepFormWithTaskList as ReturnType<
  typeof vi.fn
>;
const mockPostProductionData = postProductionData as ReturnType<typeof vi.fn>;
const mockRouter = useRouter as ReturnType<typeof vi.fn>;

describe("The ProductionDataForm component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the postProductionData method on submit", async () => {
    const mockPush = vi.fn();
    mockRouter.mockReturnValue({ push: mockPush });

    render(
      <ProductionDataForm
        allowedProducts={[{ product_id: 2024, product_name: "test" }]}
        initialData={[
          {
            product_id: 2024,
            product_name: "test",
            production_methodology: "a",
            unit: "unit",
          },
        ]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    await calledProps.onSubmit({
      formData: {
        product_selection: ["test"],
        production_data: "test",
      },
    });

    expect(mockPostProductionData).toHaveBeenCalledOnce();
  });

  it("Allows an LFO facility to just continue when no regulated products are available to be selected", async () => {
    const mockPush = vi.fn();
    mockRouter.mockReturnValue({ push: mockPush });

    render(
      <ProductionDataForm
        allowedProducts={[]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={"Large Facility"}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    expect(
      mockMultiStepFormWithTaskList.mock.calls[0][0].schema.properties
        .product_selection_title.title,
    ).toBe("No Regulated Products to select");
    expect(calledProps.continueUrl).toBe("continue");
    expect(calledProps.saveButtonDisabled).toBe(true);
  });

  it("Blocks an SFO facility and shows an error banner + message when no regulated products are available to be selected", async () => {
    const mockPush = vi.fn();
    mockRouter.mockReturnValue({ push: mockPush });

    render(
      <ProductionDataForm
        allowedProducts={[]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={"Single Facility"}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];

    expect(mockMultiStepFormWithTaskList).toHaveBeenCalledOnce();
    // error message + disabled buttons
    expect(calledProps.errors).toEqual([]);
    expect(calledProps.saveButtonDisabled).toBe(true);
    expect(calledProps.submitButtonDisabled).toBe(true);
    // error banner
    expect(calledProps.schema.properties.no_regulated_products_alert).toEqual({
      type: "object",
      readOnly: true,
    });
    // formContext used by AlertFieldTemplateFactory
    expect(calledProps.formContext).toEqual({
      no_regulated_products_alert: {
        report_version_id: 1000,
      },
    });
  });

  it("on change, adds an item to the form data when a checkbox is checked", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[{ product_id: 2024, product_name: "test" }]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={"Single Facility"}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const changeHandlerUnderTest =
      mockMultiStepFormWithTaskList.mock.calls[0][0].onChange;
    await act(() =>
      changeHandlerUnderTest({
        formData: {
          product_selection: ["test"],
          production_data: [],
        },
      }),
    );

    expect(mockMultiStepFormWithTaskList).toHaveBeenCalledTimes(2);
    expect(
      mockMultiStepFormWithTaskList.mock.calls[1][0].formData,
    ).toStrictEqual({
      product_selection: ["test"],
      production_data: [{ product_id: 2024, product_name: "test" }],
    });
  });
  it("on change, updates an existing item in the form data when the checkbox was already checked", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[{ product_id: 2024, product_name: "test" }]}
        initialData={[
          {
            product_id: 2024,
            product_name: "test",
            production_methodology: "a",
            unit: "unit",
          },
        ]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const changeHandlerUnderTest =
      mockMultiStepFormWithTaskList.mock.calls[0][0].onChange;
    await act(() =>
      changeHandlerUnderTest({
        formData: {
          product_selection: ["test"],
          production_data: [
            {
              product_id: 2024,
              product_name: "test",
              production_methodology: "abc",
              unit: "unit",
            },
          ],
        },
      }),
    );

    expect(mockMultiStepFormWithTaskList).toHaveBeenCalledTimes(2);
    expect(
      mockMultiStepFormWithTaskList.mock.calls[1][0].formData,
    ).toStrictEqual({
      product_selection: ["test"],
      production_data: [
        {
          product_id: 2024,
          product_name: "test",
          unit: "unit",
          production_methodology: "abc",
        },
      ],
    });
  });
  it("on change, removes an item from the form data when a checkbox is unchecked", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[
          { product_id: 2024, product_name: "test" },
          { product_id: 2025, product_name: "test2" },
        ]}
        initialData={[
          {
            product_id: 2024,
            product_name: "test",
            production_methodology: "a",
            unit: "unit",
          },
        ]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const changeHandlerUnderTest =
      mockMultiStepFormWithTaskList.mock.calls[0][0].onChange;
    await act(() =>
      changeHandlerUnderTest({
        formData: {
          product_selection: ["test2"],
          production_data: [
            {
              product_id: 2025,
              product_name: "test2",
              production_methodology: "abc",
              unit: "unit",
            },
          ],
        },
      }),
    );

    expect(mockMultiStepFormWithTaskList).toHaveBeenCalledTimes(2);
    expect(
      mockMultiStepFormWithTaskList.mock.calls[1][0].formData,
    ).toStrictEqual({
      product_selection: ["test2"],
      production_data: [
        {
          product_id: 2025,
          product_name: "test2",
          unit: "unit",
          production_methodology: "abc",
        },
      ],
    });
  });

  it("includes production_data_jan_mar field when reportingYear is 2025 and isOptedOut is true", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[{ product_id: 2025, product_name: "test" }]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2025}
        isOptedOut={true}
      />,
    );

    // Verify that the uiSchema includes the production_data_jan_mar_2025 field in the item order
    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    expect(calledProps.uiSchema).toBeDefined();
    expect(calledProps.uiSchema.production_data.items["ui:order"]).toContain(
      "production_data_jan_mar",
    );
  });

  it("does not include production_data_jan_mar field when reportingYear is 2025 but isOptedOut is false", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[{ product_id: 2025, product_name: "test" }]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2025}
        isOptedOut={false}
      />,
    );

    // Verify that the uiSchema does not include the production_data_jan_mar_2025 field in the item order
    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    expect(calledProps.uiSchema).toBeDefined();
    expect(
      calledProps.uiSchema.production_data.items["ui:order"],
    ).not.toContain("production_data_jan_mar");
  });

  it("shows missing product error when isPulpAndPaper is true and overlappingIndustrialProcessEmissions > 0 and chemical pulp is not selected", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[
          { product_id: 16, product_name: "Pulp and paper: chemical pulp" },
          { product_id: 1, product_name: "Other Product" },
        ]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={true}
        overlappingIndustrialProcessEmissions={100}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];

    let result;
    await act(async () => {
      result = await calledProps.onSubmit({
        formData: {
          product_selection: ["Other Product"],
          production_data: [{ product_id: 1, product_name: "Other Product" }],
        },
      });
    });

    expect(result).toBe(false);

    await waitFor(() => {
      const latestCall =
        mockMultiStepFormWithTaskList.mock.calls[
          mockMultiStepFormWithTaskList.mock.calls.length - 1
        ][0];

      expect(latestCall.errors[0].props.errors).toStrictEqual([
        createGenericReportValidationError(
          "Missing Product: 'Pulp and paper: chemical pulp'. Please add the product on the operation review page",
        ),
      ]);
    });
  });

  it("does not show missing product error when isPulpAndPaper is false", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[
          { product_id: 16, product_name: "Pulp and paper: chemical pulp" },
          { product_id: 1, product_name: "Other Product" },
        ]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={100}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );
    const formData = {
      formData: {
        product_selection: ["Other Product"],
        production_data: [{ product_id: 1, product_name: "Other Product" }],
      },
    };
    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    mockPostProductionData.mockResolvedValue({});

    await act(async () => {
      await calledProps.onChange(formData);
    });

    const updatedProps =
      mockMultiStepFormWithTaskList.mock.calls[
        mockMultiStepFormWithTaskList.mock.calls.length - 1
      ][0];

    let result;
    await act(async () => {
      result = await updatedProps.onSubmit(formData);
    });

    expect(result).toBe(true);
    expect(mockReportValidationSummary).not.toHaveBeenCalled();
  });

  it("does not show missing product error when overlappingIndustrialProcessEmissions is 0", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[
          { product_id: 16, product_name: "Pulp and paper: chemical pulp" },
          { product_id: 1, product_name: "Other Product" },
        ]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={true}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    mockPostProductionData.mockResolvedValue({});

    const formData = {
      formData: {
        product_selection: ["Other Product"],
        production_data: [{ product_id: 1, product_name: "Other Product" }],
      },
    };

    await act(async () => {
      await calledProps.onChange(formData);
    });

    const updatedProps =
      mockMultiStepFormWithTaskList.mock.calls[
        mockMultiStepFormWithTaskList.mock.calls.length - 1
      ][0];

    let result;
    await act(async () => {
      result = await updatedProps.onSubmit(formData);
    });

    expect(result).toBe(true);
    expect(mockReportValidationSummary).not.toHaveBeenCalled();
  });

  it("does not show missing product error when chemical pulp is selected", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[
          { product_id: 16, product_name: "Pulp and paper: chemical pulp" },
          { product_id: 1, product_name: "Other Product" },
        ]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={true}
        overlappingIndustrialProcessEmissions={100}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    mockPostProductionData.mockResolvedValue({});
    const formData = {
      formData: {
        product_selection: ["Pulp and paper: chemical pulp", "Other Product"],
        production_data: [
          { product_id: 16, product_name: "Pulp and paper: chemical pulp" },
          { product_id: 1, product_name: "Other Product" },
        ],
      },
    };

    await act(async () => {
      await calledProps.onChange(formData);
    });

    const updatedProps =
      mockMultiStepFormWithTaskList.mock.calls[
        mockMultiStepFormWithTaskList.mock.calls.length - 1
      ][0];

    let result;
    await act(async () => {
      result = await updatedProps.onSubmit(formData);
    });

    expect(result).toBe(true);
    expect(mockReportValidationSummary).not.toHaveBeenCalled();
  });
  it("clears the no product selected error when a product is selected", async () => {
    render(
      <ProductionDataForm
        allowedProducts={[
          { product_id: 16, product_name: "Pulp and paper: chemical pulp" },
          { product_id: 1, product_name: "Other Product" },
        ]}
        initialData={[]}
        facility_id="abcd"
        report_version_id={1000}
        schema={{ testSchema: true }}
        navigationInformation={dummyNavigationInformation}
        facilityType={""}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    mockPostProductionData.mockResolvedValue({});

    const formData = {
      formData: {
        product_selection: [],
        production_data: [],
      },
    };
    // Act: Trigger submit with no products selected to generate the error
    await act(async () => {
      await calledProps.onSubmit(formData);
    });

    const updatedProps =
      mockMultiStepFormWithTaskList.mock.calls[
        mockMultiStepFormWithTaskList.mock.calls.length - 1
      ][0];
    // Assert: Verify that the missing selection error is present
    expect(updatedProps.errors).toHaveLength(1);
    expect(updatedProps.errors[0].props.errors).toEqual([
      createGenericReportValidationError("A product must be selected."),
    ]);

    const newFormData = {
      formData: {
        product_selection: ["Other Product"],
        production_data: [{ product_id: 1, product_name: "Other Product" }],
      },
    };
    // Act: Trigger onChange with a product selected to clear the error
    await act(async () => {
      await updatedProps.onChange(newFormData);
    });

    const finalProps =
      mockMultiStepFormWithTaskList.mock.calls[
        mockMultiStepFormWithTaskList.mock.calls.length - 1
      ][0];

    // Assert: Verify that the error is cleared when a product is selected
    expect(finalProps.errors).toBeUndefined();
  });
});
