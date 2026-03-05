import { getToken } from "@bciers/testConfig/mocks";
import processAccessRequestData from "apps/administration/app/components/userOperators/processAccessRequestData";
import { UserOperatorStatus, Status } from "@bciers/utils/src/enums";

describe("processAccessRequestData", () => {
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it("should return empty rows when accessRequests is not an array", async () => {
    const result = await processAccessRequestData(null as any);
    expect(result).toEqual({ rows: [] });
  });

  it("should transform access request statuses and default to PENDING when status is missing", async () => {
    const mockAccessRequests = [
      {
        id: "1",
        user_friendly_id: "USR-001",
        role: "Reporter",
        status: "",
        user: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          user_guid: "123",
        },
        operator: { legal_name: "Acme Corp" },
      },
    ];

    // Mock token with a different user_guid
    getToken.mockResolvedValue({ user_guid: "999" });

    const result = await processAccessRequestData(mockAccessRequests);
    expect(result.rows[0].status).toBe(UserOperatorStatus.PENDING);
  });

  it("should transform status to uppercase and map to UserOperatorStatus", async () => {
    const mockAccessRequests = [
      {
        id: "1",
        user_friendly_id: "USR-001",
        role: "Reporter",
        status: "approved",
        user: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          user_guid: "123",
        },
        operator: { legal_name: "Acme Corp" },
      },
    ];

    getToken.mockResolvedValue({ user_guid: "999" });

    const result = await processAccessRequestData(mockAccessRequests);
    expect(result.rows[0].status).toBe(UserOperatorStatus.APPROVED);
  });

  it("should set status to MYSELF if token user matches access request user_guid", async () => {
    const mockAccessRequests = [
      {
        id: "1",
        user_friendly_id: "USR-001",
        role: "Reporter",
        status: "approved",
        user: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          user_guid: "123",
        },
        operator: { legal_name: "Acme Corp" },
      },
    ];

    getToken.mockResolvedValue({ user_guid: "123" });

    const result = await processAccessRequestData(mockAccessRequests);
    expect(result.rows[0].status).toBe(Status.MYSELF);
  });

  it("should transform role to Reporter if the role is PENDING", async () => {
    const mockAccessRequests = [
      {
        id: "1",
        user_friendly_id: "USR-001",
        role: "Pending",
        status: "pending",
        user: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          user_guid: "123",
        },
        operator: { legal_name: "Acme Corp" },
      },
    ];

    getToken.mockResolvedValue({ user_guid: "999" });

    const result = await processAccessRequestData(mockAccessRequests);
    expect(result.rows[0].userRole).toBe("reporter");
  });

  it("should correctly map fields into rows for DataGrid", async () => {
    const mockAccessRequests = [
      {
        id: "1",
        user_friendly_id: "USR-001",
        role: "Admin",
        status: "pending",
        user: {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
          user_guid: "123",
        },
        operator: { legal_name: "Acme Corp" },
      },
    ];

    getToken.mockResolvedValue({ user_guid: "999" });

    const result = await processAccessRequestData(mockAccessRequests);
    expect(result.rows).toEqual([
      {
        id: "1",
        userFriendlyId: "USR-001",
        name: "John Doe",
        email: "john.doe@example.com",
        business: "Acme Corp",
        userRole: "Admin",
        status: UserOperatorStatus.PENDING,
      },
    ]);
  });
});
