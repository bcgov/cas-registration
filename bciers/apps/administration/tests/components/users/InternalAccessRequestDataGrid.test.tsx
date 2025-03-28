import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useSearchParams, useSession } from "@bciers/testConfig/mocks";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";
import InternalAccessRequestDataGrid from "@/administration/app/components/users/InternalAccessRequestDataGrid";
import { handleInternalAccessRequest } from "./mocks";

const mockInitialData = {
  rows: [
    {
      role: "cas_admin",
      id: "4da70f32-65fd-4137-87c1-111f2daba3dd",
      name: "Admin Anna",
      email: "cas_admin@email.com",
      archived_at: null,
    },
    {
      role: "cas_director",
      id: "b92f41af-5d7b-4c9c-a807-2f3e49acd57a",
      name: "Director Dave",
      email: "cas_director@email.com",
      archived_at: null,
    },
    {
      role: "cas_pending",
      id: "58f255ed-8d46-44ee-b2fe-9f8d3d92c684",
      name: "Pending Polly",
      email: "cas_pending@email.com",
      archived_at: null,
    },
    {
      role: "cas_pending",
      id: "00000000-0000-0000-0000-000000000028",
      name: "Declined Deborah",
      email: "cas_pending_declined@email.com",
      archived_at: "2025-03-28T22:09:49.191Z",
    },
  ],
  row_count: 4,
};

describe("Access Requests DataGrid", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    useSearchParams.mockReturnValue({
      get: vi.fn(),
    });
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_admin",
        },
      },
    });
  });

  it("renders Access Requests component with NO DATA", async () => {
    render(<InternalAccessRequestDataGrid initialData={{ rows: [] }} />);
    expect(screen.getByRole("grid")).toBeVisible();
    expect(screen.getByText(/No records found/i)).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Email" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "User Role" }),
    ).toBeVisible();
    expect(screen.getByRole("columnheader", { name: "Status" })).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: "Approve Access?" }),
    ).toBeVisible();
  });
  it("renders Access Requests component with DATA", async () => {
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);

    // completely checking the first row
    const firstRow = screen.getAllByRole("row")[1];
    expect(within(firstRow).getByText(/Admin Anna/i)).toBeVisible();
    expect(within(firstRow).getByText(/cas_admin@email.com/i)).toBeVisible();
    expect(within(firstRow).getByText("Admin")).toBeVisible();
    expect(within(firstRow).getByText(/Approved/i)).toBeVisible();
    expect(
      within(firstRow).getByRole("button", { name: "Edit" }),
    ).toBeVisible();

    // only checking role, status, and buttons for the rest of the columns
    const secondRow = screen.getAllByRole("row")[2];
    expect(within(secondRow).getByText("Director")).toBeVisible();
    expect(within(secondRow).getByText(/Approved/i)).toBeVisible();
    expect(
      within(secondRow).getByRole("button", { name: "Edit" }),
    ).toBeVisible();

    const thirdRow = screen.getAllByRole("row")[3];
    expect(within(thirdRow).getAllByText("Pending")).toHaveLength(2); // role and status are both pending
    expect(
      within(thirdRow).getByRole("button", { name: "Approve" }),
    ).toBeVisible();
    expect(
      within(thirdRow).getByRole("button", { name: "Decline" }),
    ).toBeVisible();

    const fourthRow = screen.getAllByRole("row")[4];
    expect(within(fourthRow).getByText("Pending")).toBeVisible();
    expect(within(fourthRow).getByText("Declined")).toBeVisible();
    expect(
      within(fourthRow).getByRole("button", { name: "Edit" }),
    ).toBeVisible();
  });
  it.only("user can APPROVE the request", async () => {
    handleInternalAccessRequest.mockResolvedValue({
      app_role: {
        role_name: "cas_pending",
      },
      first_name: "Admin",
      last_name: "Anna",
      archived_at: null,
    });
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);
    const approveButton = screen.getByRole("button", { name: "Approve" });
    await userEvent.click(approveButton);
    expect(handleInternalAccessRequest).toHaveBeenCalledWith(
      "1",
      "Approved",
      "reporter",
    );
    // Check the status is updated
    expect(screen.getAllByRole("gridcell", { name: "Approved" })).toHaveLength(
      2,
    );
    expect(screen.getByText(/John Doe is now approved/i)).toBeVisible();
  });
  it("user can DECLINE the request", async () => {
    handleInternalAccessRequest.mockResolvedValue({
      status: "Declined",
      first_name: "John",
      last_name: "Doe",
    });
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);
    const declineButton = screen.getByRole("button", { name: "Decline" });
    await userEvent.click(declineButton);
    expect(handleInternalAccessRequest).toHaveBeenCalledWith(
      "1",
      "Declined",
      "reporter",
    );
    // Check the status is updated
    expect(screen.getAllByRole("gridcell", { name: "Declined" })).toHaveLength(
      2,
    );
    expect(screen.getByText(/John Doe is now declined/i)).toBeVisible();
  });
  it("user can EDIT the request", async () => {
    handleInternalAccessRequest.mockResolvedValue({
      status: "Pending",
      first_name: "John",
      last_name: "Doe",
    });
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);
    const editButton = screen.getAllByRole("button", { name: "Edit" })[0];
    await userEvent.click(editButton);
    expect(handleInternalAccessRequest).toHaveBeenCalledWith(
      "2",
      "Pending",
      "admin",
    );
    // Check the status is updated
    expect(screen.getAllByRole("gridcell", { name: "Pending" })).toHaveLength(
      2,
    );
    expect(screen.getByText(/John Doe is now pending/i)).toBeVisible();
  });
  it("displays a spinner and disables the button while loading", async () => {
    const modifiedInitialData = {
      rows: [
        {
          id: "1",
          userFriendlyId: "1",
          name: "John Smith",
          email: "john.smith@email.com",
          business: "Fake Business 1",
          userRole: "reporter",
          status: "Declined",
        },
      ],
    };
    handleInternalAccessRequest.mockResolvedValue({
      status: "Pending",
      first_name: "John",
      last_name: "Doe",
    });
    render(<InternalAccessRequestDataGrid initialData={modifiedInitialData} />);
    const editButton = screen.getAllByRole("button", { name: "Edit" })[0];
    expect(editButton).toBeEnabled();
    fireEvent.click(editButton);
    expect(editButton).toBeDisabled();
    expect(
      editButton.querySelector("span svg[aria-label='loading']"),
    ).toBeVisible();
    expect(handleInternalAccessRequest).toHaveBeenCalled();
    await waitFor(() => {
      // Make sure that buttons are visible and enabled again
      expect(screen.getByRole("button", { name: "Approve" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Decline" })).toBeVisible();
      expect(screen.getByRole("button", { name: "Decline" })).toBeEnabled();
    });
  });
});
