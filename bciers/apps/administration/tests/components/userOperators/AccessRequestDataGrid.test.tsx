import { handleAccessRequestStatus } from "apps/administration/tests/components/userOperators/mocks";
import { render, screen } from "@testing-library/react";
import { useSearchParams } from "@bciers/testConfig/mocks";
import AccessRequestDataGrid from "apps/administration/app/components/userOperators/AccessRequestDataGrid";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";

const mockInitialData = {
  rows: [
    {
      id: "1",
      userFriendlyId: "1",
      name: "John Doe",
      email: "john.doe@email.com",
      business: "Fake Business 1",
      userRole: "reporter",
      status: "Pending",
    },
    {
      id: "2",
      userFriendlyId: "2",
      name: "Jane Doe",
      email: "jane.doe@email.com",
      business: "Fake Business 2",
      userRole: "admin",
      status: "Approved",
    },
    {
      id: "3",
      userFriendlyId: "3",
      name: "John Smith",
      email: "john.smith@email.com",
      business: "Fake Business 3",
      userRole: "reporter",
      status: "Declined",
    },
  ],
};

describe("Access Requests DataGrid", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    useSearchParams.mockReturnValue({
      get: vi.fn(),
    });
  });

  it("renders Access Requests component with NO DATA", async () => {
    render(<AccessRequestDataGrid initialData={{ rows: [] }} />);
    expect(screen.getByRole("grid")).toBeVisible();
    expect(screen.getByText(/No records found/i)).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "User ID" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Business BCeID" }),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "User Role" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeVisible();
  });
  it("renders Access Requests component with DATA", async () => {
    render(<AccessRequestDataGrid initialData={mockInitialData} />);
    // Check names
    expect(screen.getByText(/John Doe/i)).toBeVisible();
    expect(screen.getByText(/John Smith/i)).toBeVisible();
    expect(screen.getByText(/Jane Doe/i)).toBeVisible();
    // Check emails
    expect(screen.getByText(/john.doe@email.com/i)).toBeVisible();
    expect(screen.getByText(/jane.doe@email.com/i)).toBeVisible();
    expect(screen.getByText(/john.smith@email.com/i)).toBeVisible();
    // Check businesses
    expect(screen.getByText(/Fake Business 1/i)).toBeVisible();
    expect(screen.getByText(/Fake Business 2/i)).toBeVisible();
    expect(screen.getByText(/Fake Business 3/i)).toBeVisible();
    // Check user roles
    expect(screen.getByText(/admin/i)).toBeVisible();
    expect(screen.getByText(/reporter/i)).toBeVisible();
    expect(screen.getByText(/NA/i)).toBeVisible();
    // Check statuses
    expect(screen.getByText(/Pending/i)).toBeVisible();
    expect(screen.getByText(/Approved/i)).toBeVisible();
    expect(screen.getByText(/Declined/i)).toBeVisible();
    // Check Actions
    expect(screen.getAllByRole("button", { name: "Approve" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Decline" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Undo" })).toHaveLength(2);
  });
  it("user can APPROVE the request", async () => {
    handleAccessRequestStatus.mockResolvedValue({
      status: "Approved",
    });
    render(<AccessRequestDataGrid initialData={mockInitialData} />);
    const approveButton = screen.getByRole("button", { name: "Approve" });
    await userEvent.click(approveButton);
    expect(handleAccessRequestStatus).toHaveBeenCalledWith(
      "1",
      "Approved",
      "reporter",
    );
    // Check the status is updated
    expect(screen.getAllByRole("gridcell", { name: "Approved" })).toHaveLength(
      2,
    );
  });
  it("user can DECLINE the request", async () => {
    handleAccessRequestStatus.mockResolvedValue({
      status: "Declined",
    });
    render(<AccessRequestDataGrid initialData={mockInitialData} />);
    const declineButton = screen.getByRole("button", { name: "Decline" });
    await userEvent.click(declineButton);
    expect(handleAccessRequestStatus).toHaveBeenCalledWith(
      "1",
      "Declined",
      "reporter",
    );
    // Check the status is updated
    expect(screen.getAllByRole("gridcell", { name: "Declined" })).toHaveLength(
      2,
    );
  });
  it("user can UNDO the request", async () => {
    handleAccessRequestStatus.mockResolvedValue({
      status: "Pending",
    });
    render(<AccessRequestDataGrid initialData={mockInitialData} />);
    const undoButton = screen.getAllByRole("button", { name: "Undo" })[0];
    await userEvent.click(undoButton);
    expect(handleAccessRequestStatus).toHaveBeenCalledWith(
      "2",
      "Pending",
      "admin",
    );
    // Check the status is updated
    expect(screen.getAllByRole("gridcell", { name: "Pending" })).toHaveLength(
      2,
    );
  });
});
