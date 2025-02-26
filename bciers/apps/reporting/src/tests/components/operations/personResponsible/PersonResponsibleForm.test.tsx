import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useRouter } from "next/navigation";
import PersonResponsibleForm from "@reporting/src/app/components/operations/personResponsible/PersonResponsibleForm";
import {
  Contact,
  ContactRow,
} from "@reporting/src/app/components/operations/types";
import { personResponsibleSchema } from "@reporting/src/data/jsonSchema/personResponsible";
import { actionHandler } from "@bciers/testConfig/mocks";
import { getContacts } from "@bciers/actions/api";

// Mocks for external dependencies
vi.mock("@bciers/actions/api", () => ({
  getContacts: vi.fn(), // Mock getContact function
}));
const mockGetContacts = getContacts as ReturnType<typeof vi.fn>;
const mockRouter = useRouter as ReturnType<typeof vi.fn>;
const mockPush = vi.fn();

// Define test data types
interface MockContact extends Contact {
  id: number;
  first_name: string;
  last_name: string;
}

interface MockContacts {
  items: ContactRow[];
  count: number;
}

// Test data
const mockContacts: MockContacts = {
  items: [
    {
      id: 1,
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
    },
    {
      id: 2,
      first_name: "Jane",
      last_name: "Smith",
      email: "jane.smith@example.com",
    },
  ],
  count: 2,
};

const mockPersonResponsible: MockContact = {
  id: 1,
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
};

// Default props for the component
const defaultProps = {
  versionId: 1,
  facilityId: 1,
  operationType: "Single Facility Operation",
  taskListElements: [],
  contacts: mockContacts,
  personResponsible: mockPersonResponsible,
  schema: personResponsibleSchema,
};

describe("PersonResponsibleForm component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it("renders the form correctly", async () => {
    render(<PersonResponsibleForm {...defaultProps} />);

    // Check form displays
    await waitFor(() => {
      expect(screen.getByText(/Person Responsible/)).toBeInTheDocument();
    });

    // Check person responsible field is pre-filled
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();

    // Check for navigation buttons
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i }),
    ).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    actionHandler.mockResolvedValueOnce({});
    mockRouter.mockReturnValue({ push: mockPush });

    render(<PersonResponsibleForm {...defaultProps} />);

    await act(() => {
      fireEvent.click(screen.getByText("Save & Continue"));
    });
    expect(actionHandler).toHaveBeenCalled();
  });

  it("handles sync of contacts correctly", async () => {
    render(<PersonResponsibleForm {...defaultProps} />);

    // Mock the getContacts function to simulate syncing
    const mockUpdatedContacts = {
      items: [
        {
          id: 1,
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
        },
        {
          id: 3,
          first_name: "New",
          last_name: "Contact",
          email: "new.contact@example.com",
        },
      ],
      count: 2,
    };

    mockGetContacts.mockResolvedValueOnce(mockUpdatedContacts);

    // Trigger sync (assuming sync button is present)
    const syncButton = screen.getByRole("button", { name: /sync/i });
    fireEvent.click(syncButton);

    await waitFor(() => {
      // Check that the contacts state was updated with new contacts
      expect(getContacts).toHaveBeenCalledTimes(1);
    });
  });
});
