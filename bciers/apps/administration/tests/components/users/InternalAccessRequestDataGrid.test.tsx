import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import {
  handleInternalAccessRequest,
  useSearchParams,
  useSession,
} from "@bciers/testConfig/mocks";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";
import InternalAccessRequestDataGrid from "@/administration/app/components/users/InternalAccessRequestDataGrid";
import { InternalFrontEndRoles } from "@bciers/utils/src/enums";

const mockInitialData = {
  rows: [
    {
      role: InternalFrontEndRoles.CAS_ADMIN,
      id: "4da70f32-65fd-4137-87c1-111f2daba3dd",
      name: "Admin Anna",
      email: "cas_admin@email.com",
      archived_at: undefined,
    },
    {
      role: InternalFrontEndRoles.CAS_DIRECTOR,
      id: "b92f41af-5d7b-4c9c-a807-2f3e49acd57a",
      name: "Director Dave",
      email: "cas_director@email.com",
      archived_at: undefined,
    },
    {
      role: InternalFrontEndRoles.CAS_PENDING,
      id: "58f255ed-8d46-44ee-b2fe-9f8d3d92c684",
      name: "Pending Polly",
      email: "cas_pending@email.com",
      archived_at: undefined,
    },
    {
      role: InternalFrontEndRoles.CAS_PENDING,
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
          email: "myemail@email.com",
        },
      },
    });
  });

  it("renders Internal Access Requests component with NO DATA", async () => {
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

  it("renders Access Requests component with DATA for readonly roles (cas_analyst, cas_view_only, cas_director)", async () => {
    useSession.mockReturnValue({
      data: {
        user: {
          app_role: "cas_analyst",
          email: "myemail@email.com",
        },
      },
    });
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);
    expect(
      screen.queryByRole("columnheader", { name: "Approve Access?" }),
    ).not.toBeInTheDocument();

    // spot checking a row
    const thirdRow = screen.getAllByRole("row")[3];
    expect(within(thirdRow).getByText(/Pending Polly/i)).toBeVisible();
    expect(within(thirdRow).getByText(/cas_pending@email.com/i)).toBeVisible();
    // this tests the role column doesn't have a dropdown (two Pendings because one is the role and the other the status)
    expect(within(thirdRow).getAllByText("Pending")).toHaveLength(2);
    expect(
      within(thirdRow).queryByTestId("ArrowDropDownIcon"),
    ).not.toBeInTheDocument();
  });

  it("renders Access Requests component with DATA for edit roles (cas_admin)", async () => {
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
    expect(within(thirdRow).getByText("Pending")).toBeVisible();
    expect(
      within(thirdRow).getByDisplayValue("cas_pending"),
    ).toBeInTheDocument(); // empty role dropdown
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

  it("user can EDIT the request", async () => {
    handleInternalAccessRequest.mockResolvedValue({
      app_role: "cas_pending",
      first_name: "Declined",
      last_name: "Deborah",
      archived_at: null,
    });
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);
    const deborahRow = screen.getAllByRole("row")[4];
    await userEvent.click(
      within(deborahRow).getByRole("button", { name: "Edit" }),
    );

    expect(handleInternalAccessRequest).toHaveBeenCalledWith(
      "00000000-0000-0000-0000-000000000028",
      "cas_pending",
      false,
    );
    // Check grid updated
    expect(within(deborahRow).getByText("Pending")).toBeVisible();
    expect(
      within(deborahRow).getByDisplayValue("cas_pending"),
    ).toBeInTheDocument(); // we expect this to be in the document but not be visible because pending isn't a dropdown option
    expect(
      within(deborahRow).getByRole("button", { name: "Approve" }),
    ).toBeVisible();
    expect(
      within(deborahRow).getByRole("button", { name: "Decline" }),
    ).toBeVisible();
    // check snackbar
    expect(screen.getByText(/Declined Deborah is now Pending/i)).toBeVisible();
  });

  it("user can change role and APPROVE the request", async () => {
    handleInternalAccessRequest.mockResolvedValue({
      app_role: "cas_admin",

      first_name: "Pending",
      last_name: "Polly",
      archived_at: null,
    });
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);
    const pollyRow = screen.getAllByRole("row")[3];
    await userEvent.click(within(pollyRow).getByLabelText("User Role"));
    await userEvent.click(screen.getByRole("option", { name: /Admin/i }));

    const approveButton = screen.getByRole("button", { name: "Approve" });
    await userEvent.click(approveButton);
    expect(handleInternalAccessRequest).toHaveBeenCalledWith(
      "58f255ed-8d46-44ee-b2fe-9f8d3d92c684",
      "cas_admin",
      false,
    );
    // Check grid updated
    expect(within(pollyRow).getByText("Approved")).toBeVisible();
    expect(
      within(pollyRow).getByRole("button", { name: "Edit" }),
    ).toBeVisible();
    // check snackbar
    expect(screen.getByText(/Pending Polly is now Admin/i)).toBeVisible();
  });

  it("user can DECLINE the request", async () => {
    handleInternalAccessRequest.mockResolvedValue({
      app_role: "cas_pending",

      first_name: "Pending",
      last_name: "Polly",
      archived_at: Date.now(),
    });
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);
    const pollyRow = screen.getAllByRole("row")[3];

    const declineButton = screen.getByRole("button", { name: "Decline" });
    await userEvent.click(declineButton);
    expect(handleInternalAccessRequest).toHaveBeenCalledWith(
      "58f255ed-8d46-44ee-b2fe-9f8d3d92c684",
      "cas_pending",
      true,
    );
    // Check grid updated
    expect(within(pollyRow).getByText("Declined")).toBeVisible();
    expect(
      within(pollyRow).getByRole("button", { name: "Edit" }),
    ).toBeVisible();
    // check snackbar
    expect(screen.getByText(/Pending Polly is now declined/i)).toBeVisible();
  });

  it("user cannot approve, deny, or edit themselves", async () => {
    render(
      <InternalAccessRequestDataGrid
        initialData={{
          rows: [
            {
              role: InternalFrontEndRoles.CAS_ADMIN,
              id: "4da70f32-65fd-4137-87c1-111f2daba3dd",
              name: "Admin Anna",
              email: "myemail@email.com",
              archived_at: undefined,
            },
          ],
          row_count: 1,
        }}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Approve" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Decline" }),
    ).not.toBeInTheDocument();
  });

  it("displays a spinner and disables the button while loading", async () => {
    handleInternalAccessRequest.mockResolvedValue({
      app_role: "cas_pending",
      first_name: "Declined",
      last_name: "Deborah",
      archived_at: null,
    });
    render(<InternalAccessRequestDataGrid initialData={mockInitialData} />);
    const deborahRow = screen.getAllByRole("row")[4];
    const editButton = within(deborahRow).getByRole("button", { name: "Edit" });
    expect(editButton).toBeEnabled();
    await userEvent.click(editButton);
    fireEvent.click(editButton);
    expect(editButton).toBeDisabled();
    expect(
      editButton.querySelector("span svg[aria-label='loading']"),
    ).toBeVisible();
    expect(handleInternalAccessRequest).toHaveBeenCalled();
    await waitFor(() => {
      // Make sure that buttons are visible and enabled again
      expect(
        within(deborahRow).getByRole("button", { name: "Approve" }),
      ).toBeVisible();
      expect(
        within(deborahRow).getByRole("button", { name: "Decline" }),
      ).toBeEnabled();
    });
  });
});
