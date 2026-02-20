import { useRouter } from "next/navigation";
import { postProductionData } from "@bciers/actions/api";
import MultiStepFormWithTaskList from "@bciers/components/form/MultiStepFormWithTaskList";
import ProductionDataForm from "@reporting/src/app/components/products/ProductionDataForm";
import { act, render } from "@testing-library/react";
import { dummyNavigationInformation } from "../taskList/utils";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));
vi.mock("@bciers/components/form/MultiStepFormWithTaskList", () => ({
  default: vi.fn(),
}));
vi.mock("@bciers/actions/api", () => ({
  postProductionData: vi.fn(),
}));

const mockMultiStepFormWithTaskList = MultiStepFormWithTaskList as ReturnType<
  typeof vi.fn
>;
const mockPostProductionData = postProductionData as ReturnType<typeof vi.fn>;
const mockRouter = useRouter as ReturnType<typeof vi.fn>;

describe("The ProductionDataForm component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("calls the postProductionData method on submit", async () => {
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
        facilityType={"Small Aggregate"}
        isPulpAndPaper={false}
        overlappingIndustrialProcessEmissions={0}
        reportingYear={2024}
        isOptedOut={false}
      />,
    );

    const calledProps = mockMultiStepFormWithTaskList.mock.calls[0][0];
    await calledProps.onSubmit({ formData: { production_data: "test" } });
    expect(mockPostProductionData).toHaveBeenCalledWith(1000, "abcd", "test");
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
});
