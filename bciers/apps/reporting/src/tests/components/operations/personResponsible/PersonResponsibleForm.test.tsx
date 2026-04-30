import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import PersonResponsibleForm from "@reporting/src/app/components/operations/personResponsible/PersonResponsibleForm";
import {
  Contact,
  ContactRow,
} from "@reporting/src/app/components/operations/types";
import { personResponsibleSchema } from "@reporting/src/data/jsonSchema/personResponsible";
import { createPersonResponsibleSchema } from "@reporting/src/app/components/operations/personResponsible/createPersonResponsibleSchema";
import { actionHandler, useRouter } from "@bciers/testConfig/mocks";
import { getContacts, getContact } from "@bciers/actions/api";
import { dummyNavigationInformation } from "../../taskList/utils";
// Mocks for external dependencies
vi.mock("@bciers/actions/api", () => ({
  getContacts: vi.fn(),
  getContact: vi.fn(),
}));

const mockGetContacts = getContacts as ReturnType<typeof vi.fn>;
const mockGetContact = getContact as ReturnType<typeof vi.fn>;

const mockPush = vi.fn();
const mockRefresh = vi.fn();

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
  navigationInformation: dummyNavigationInformation,
  contacts: mockContacts,
  personResponsible: mockPersonResponsible,
  schema: createPersonResponsibleSchema(
    personResponsibleSchema,
    mockContacts.items,
    1,
    mockPersonResponsible,
  ),
  initialContactId: 1,
};

describe("PersonResponsibleForm component", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    useRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  it("renders the form correctly", async () => {
    render(<PersonResponsibleForm {...defaultProps} />);

    // Check form displays
    await waitFor(() => {
      expect(screen.getByText(/Person Responsible/)).toBeInTheDocument();
    });

    // Check person responsible field is pre-filled
    expect(await screen.findByDisplayValue("John Doe")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i }),
    ).toBeInTheDocument();
  });

  it("submits the form successfully", async () => {
    actionHandler.mockResolvedValueOnce({});

    render(<PersonResponsibleForm {...defaultProps} />);

    await act(async () => {
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
          first_name: "Johnny",
          last_name: "Updated",
          email: "johnny.updated@example.com",
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
    mockGetContact.mockResolvedValueOnce({
      id: 1,
      first_name: "Johnny",
      last_name: "Updated",
      email: "johnny.updated@example.com",
      phone_number: "+16044011235",
      position_title: "Updated Manager",
      street_address: "456 New St",
      municipality: "New City",
      province: "BC",
      postal_code: "V1V 1V1",
    });

    // Trigger sync (assuming sync button is present)
    const syncButton = screen.getByRole("button", { name: /sync/i });
    fireEvent.click(syncButton);

    await waitFor(() => {
      // Check that the contacts state was updated with new contacts
      expect(getContacts).toHaveBeenCalledTimes(1);
      expect(mockGetContact).toHaveBeenCalledWith("1");
    });

    expect(await screen.findByDisplayValue("Johnny")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Updated")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Updated Manager")).toBeInTheDocument();
    expect(screen.getByDisplayValue("456 New St")).toBeInTheDocument();
    expect(screen.getByDisplayValue("New City")).toBeInTheDocument();
    expect(screen.getByDisplayValue("BC")).toBeInTheDocument();
    expect(screen.getByDisplayValue("V1V 1V1")).toBeInTheDocument();
  });
});
