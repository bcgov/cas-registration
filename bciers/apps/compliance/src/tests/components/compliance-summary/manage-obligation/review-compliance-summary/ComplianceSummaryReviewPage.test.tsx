// import { vi } from "vitest";
// import ComplianceSummaryReviewPage from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewPage";
// import { setupComplianceSummaryReviewTest } from "../../../../utils/complianceSummaryReviewTestUtils";
//
// vi.mock("@/compliance/src/app/utils/getComplianceSummary", () => ({
//   getComplianceSummary: vi.fn().mockResolvedValue({
//     operation_name: "Test Operation",
//     operation_id: 123,
//     reporting_year: 2024,
//     excess_emissions: "15.0",
//     emission_limit: "100.0",
//     emissions_attributable_for_compliance: "115.0",
//     obligation_id: "OB-2024-123",
//     compliance_charge_rate: 80,
//     equivalent_value: 1200,
//   }),
// }));
//
// vi.mock(
//   "@/compliance/src/app/components/taskLists/1_manageObligationTaskList",
//   () => ({
//     ActivePage: {
//       ReviewComplianceSummary: 0,
//       DownloadPaymentInstructions: 1,
//       PayObligationTrackPayments: 2,
//     },
//     generateManageObligationTaskList: vi.fn().mockImplementation((id) => [
//       {
//         type: "Section",
//         title: "2024 Compliance Summary",
//         isExpanded: true,
//         elements: [
//           {
//             type: "Page",
//             title: "Review 2024 Compliance Summary",
//             link: `/compliance-summaries/${id}/review-compliance-summary`,
//             isActive: true,
//           },
//           {
//             type: "Page",
//             title: "Download Payment Instructions",
//             link: `/compliance-summaries/${id}/download-payment-instructions`,
//             isActive: false,
//           },
//           {
//             type: "Page",
//             title: "Pay Obligation and Track Payment(s)",
//             link: `/compliance-summaries/${id}/pay-obligation-track-payments`,
//             isActive: false,
//           },
//         ],
//       },
//     ]),
//   }),
// );
//
// vi.mock(
//   "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/ComplianceSummaryReviewComponent",
//   () => ({
//     default: (props: any) => (
//       <div data-testid="review-component">
//         <div data-testid="form-data-operation-name">
//           {props.formData.operation_name}
//         </div>
//         <div data-testid="compliance-summary-id">
//           {props.complianceSummaryId}
//         </div>
//         <div data-testid="task-list-elements">
//           {props.taskListElements ? "task-list-present" : "no-task-list"}
//         </div>
//       </div>
//     ),
//   }),
// );
//
// setupComplianceSummaryReviewTest({
//   complianceSummaryPageComponent: ComplianceSummaryReviewPage,
//   dataUtilPath: "@/compliance/src/app/utils/getComplianceSummary",
//   dataUtilName: "getComplianceSummary",
//   taskListSchemaPath:
//     "@/compliance/src/app/components/taskLists/1_manageObligationSchema",
//   taskListFunctionName: "generateManageObligationTaskList",
//   testDescription: "ComplianceSummaryReviewPage (Manage Obligation)",
//   mockData: {
//     operation_name: "Test Operation",
//     operation_id: 123,
//     reporting_year: 2024,
//     excess_emissions: "15.0",
//     emission_limit: "100.0",
//     emissions_attributable_for_compliance: "115.0",
//     obligation_id: "OB-2024-123",
//     compliance_charge_rate: 80,
//     equivalent_value: 1200,
//   },
// })();
describe.skip("ComplianceSummaryReviewPage", () => {});
