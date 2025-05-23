import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/ComplianceSummaryReviewPage";
import { setupComplianceSummaryReviewTest } from "@/compliance/src/tests/utils/complianceSummaryReviewTestUtils";

vi.mock(
  "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  () => ({
    getRequestIssuanceComplianceSummaryData: vi.fn().mockResolvedValue({
      operation_name: "Test Operation",
      operation_id: 123,
      reporting_year: 2024,
      excess_emissions: "-15.0",
      emission_limit: "100.0",
      emissions_attributable_for_compliance: "85.0",
      earned_credits: 15,
    }),
  }),
);

vi.mock(
  "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema",
  () => ({
    ActivePage: {
      ReviewComplianceSummary: 0,
      RequestIssuanceOfEarnedCredits: 1,
      TrackStatusOfIssuance: 2,
    },
    generateRequestIssuanceTaskList: vi.fn().mockImplementation((id) => [
      {
        type: "Section",
        title: "2024 Compliance Summary",
        isExpanded: true,
        elements: [
          {
            type: "Page",
            title: "Review 2024 Compliance Summary",
            link: `/compliance-summaries/${id}/request-issuance/review-compliance-summary`,
            isActive: true,
          },
          {
            type: "Page",
            title: "Request Issuance of Earned Credits",
            link: `/compliance-summaries/${id}/request-issuance/request-issuance-of-earned-credits`,
            isActive: false,
          },
          {
            type: "Page",
            title: "Track Status of Issuance",
            link: `/compliance-summaries/${id}/request-issuance/track-status-of-issuance`,
            isActive: false,
          },
        ],
      },
    ]),
  }),
);

vi.mock(
  "@/compliance/src/app/components/compliance-summary/request-issuance/review-compliance-summary/RequestIssuanceReviewComponent",
  () => ({
    default: (props: any) => (
      <div data-testid="review-component">
        <div data-testid="form-data-operation-name">
          {props.formData.operation_name}
        </div>
        <div data-testid="compliance-summary-id">
          {props.complianceSummaryId}
        </div>
        <div data-testid="task-list-elements">
          {props.taskListElements ? "task-list-present" : "no-task-list"}
        </div>
      </div>
    ),
  }),
);

// Using a generic test setup function to reduce code duplication between similar test files
// This approach helps us maintain consistent test coverage while minimizing SonarQube duplication warnings
setupComplianceSummaryReviewTest({
  complianceSummaryPageComponent: ComplianceSummaryReviewPage,
  dataUtilPath:
    "@/compliance/src/app/utils/getRequestIssuanceComplianceSummaryData",
  dataUtilName: "getRequestIssuanceComplianceSummaryData",
  taskListSchemaPath:
    "@/compliance/src/app/components/taskLists/2_requestIssuanceSchema",
  taskListFunctionName: "generateRequestIssuanceTaskList",
  testDescription: "ComplianceSummaryReviewPage",
  mockData: {
    operation_name: "Test Operation",
    operation_id: 123,
    reporting_year: 2024,
    excess_emissions: "-15.0",
    emission_limit: "100.0",
    emissions_attributable_for_compliance: "85.0",
    earned_credits: 15,
  },
})();
