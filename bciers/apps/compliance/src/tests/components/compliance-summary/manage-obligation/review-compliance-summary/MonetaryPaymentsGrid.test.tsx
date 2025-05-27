// import { render, screen } from "@testing-library/react";
// import { MonetaryPaymentsGrid } from "@/compliance/src/app/components/compliance-summary/manage-obligation/review-compliance-summary/MonetaryPaymentsGrid";
// import { PaymentsData } from "@/compliance/src/app/types";
//
// // Mock useSearchParams
// vi.mock("next/navigation", () => ({
//   useSearchParams: () => new URLSearchParams(),
// }));

describe.skip("MonetaryPaymentsGrid", () => {
  // const mockPaymentsData: PaymentsData = {
  //   rows: [
  //     {
  //       id: 1,
  //       paymentReceivedDate: "2024-03-20",
  //       paymentAmountApplied: 1000,
  //       paymentMethod: "Wire",
  //       transactionType: "Payment",
  //       receiptNumber: "REC-123",
  //     },
  //   ],
  //   row_count: 1,
  // };
  //
  // it("renders the alert note when no data is provided", () => {
  //   render(<MonetaryPaymentsGrid />);
  //   expect(
  //     screen.getByText("You have not made any monetary payment yet."),
  //   ).toBeVisible();
  // });
  //
  // it("renders the alert note when data has no rows", () => {
  //   render(<MonetaryPaymentsGrid data={{ rows: [], row_count: 0 }} />);
  //   expect(
  //     screen.getByText("You have not made any monetary payment yet."),
  //   ).toBeVisible();
  // });
  //
  // it("renders payment data when available", () => {
  //   render(<MonetaryPaymentsGrid data={mockPaymentsData} />);
  //   expect(screen.getByText("2024-03-20")).toBeVisible();
  //   expect(screen.getByText("$1,000.00")).toBeVisible();
  //   expect(screen.getByText("Wire")).toBeVisible();
  //   expect(screen.getByText("Payment")).toBeVisible();
  //   expect(screen.getByText("REC-123")).toBeVisible();
  // });
});
