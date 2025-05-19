// eslint-disable-next-line import/no-extraneous-dependencies
import { render, screen } from "@testing-library/react";
import { describe, expect, vi } from "vitest";

export interface ComplianceSummaryReviewTestConfig {
  complianceSummaryPageComponent: any;
  dataUtilPath: string;
  dataUtilName: string;
  taskListSchemaPath: string;
  taskListFunctionName: string;
  testDescription: string;
  mockData: any;
  testIsCasStaffProp?: boolean;
}

function verifyCommonElements(
  expectedComplianceSummaryId: string,
  mockData: any,
  isCasStaff?: boolean,
) {
  const reviewComponent = screen.getByTestId("review-component");
  expect(reviewComponent).toBeVisible();
  expect(screen.getByTestId("form-data-operation-name")).toHaveTextContent(
    mockData.operation_name,
  );
  expect(screen.getByTestId("compliance-summary-id")).toHaveTextContent(
    expectedComplianceSummaryId,
  );
  expect(screen.getByTestId("task-list-elements")).toHaveTextContent(
    "task-list-present",
  );
  const isCasStaffElement = screen.queryByTestId("is-cas-staff");
  if (isCasStaffElement && isCasStaff !== undefined) {
    expect(isCasStaffElement).toHaveTextContent(
      isCasStaff ? "is-cas-staff" : "not-cas-staff",
    );
  }
}

export function setupComplianceSummaryReviewTest(
  config: ComplianceSummaryReviewTestConfig,
) {
  return () => {
    describe(config.testDescription, () => {
      beforeEach(() => {
        vi.clearAllMocks();
      });

      it("renders the component with the correct props", async () => {
        const complianceSummaryId = "123";

        const component = await config.complianceSummaryPageComponent({
          compliance_summary_id: complianceSummaryId,
        });
        render(component);

        const dataUtilModule = await import(config.dataUtilPath);
        const taskListModule = await import(config.taskListSchemaPath);

        const dataUtilFn = dataUtilModule[config.dataUtilName];
        const taskListFn = taskListModule[config.taskListFunctionName];

        expect(dataUtilFn).toHaveBeenCalledWith(Number(complianceSummaryId));
        expect(taskListFn).toHaveBeenCalledWith(123, 2024, 0);

        verifyCommonElements(complianceSummaryId, config.mockData);
      });

      it("handles string compliance_summary_id by converting it to a number", async () => {
        const complianceSummaryId = "456";

        const component = await config.complianceSummaryPageComponent({
          compliance_summary_id: complianceSummaryId,
        });
        render(component);

        const taskListModule = await import(config.taskListSchemaPath);
        const taskListFn = taskListModule[config.taskListFunctionName];

        expect(taskListFn).toHaveBeenCalledWith(456, 2024, 0);

        verifyCommonElements(complianceSummaryId, config.mockData);
      });

      if (config.testIsCasStaffProp) {
        it("verifies the isCasStaff prop is present in the component", async () => {
          const complianceSummaryId = "789";
          const component = await config.complianceSummaryPageComponent({
            compliance_summary_id: complianceSummaryId,
          });
          render(component);

          const isCasStaffElement = screen.queryByTestId("is-cas-staff");
          expect(isCasStaffElement).toBeVisible();
        });
      }
    });
  };
}
