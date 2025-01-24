import { randomUUID } from "crypto";
import { render, screen } from "@testing-library/react";
import { getTransferEvent } from "@/registration/tests/components/transfers/mocks";
import { fetchOperatorsPageData } from "@/administration/tests/components/operators/mocks";
import TransferPage from "@/registration/app/components/transfers/TransferPage";
import { operationEntitySchema } from "@/registration/app/data/jsonSchema/transfer/transferDetail";

describe("Transfer page", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("throws an error when there's a problem fetching operators data", async () => {
    fetchOperatorsPageData.mockReturnValueOnce({
      rows: undefined,
      row_count: undefined,
    });
    await expect(async () => {
      render(await TransferPage({})); // passing empty object as props so that it doesn't throw an error when destructuring
    }).rejects.toThrow("Failed to fetch operators data");
  });

  it("renders the TransferPage", async () => {
    fetchOperatorsPageData.mockReturnValueOnce({
      rows: [
        {
          id: "1",
        },
      ],
      row_count: 1,
    });
    render(await TransferPage({})); // passing empty object as props so that it doesn't throw an error when destructuring
    expect(screen.getByTestId("field-template-label")).toHaveTextContent(
      "Transfer Entity",
    );
    expect(
      screen.getByText(/select the operators involved/i),
    ).toBeInTheDocument();
  });
  it("throws an error when transferId is not a valid UUID", async () => {
    await expect(async () => {
      const transferId = "invalid-uuid";
      // @ts-ignore
      render(await TransferPage({ transferId }));
    }).rejects.toThrow("Invalid transfer id: invalid-uuid");
  });
  it("throws an error when there's a problem fetching transfer information", async () => {
    getTransferEvent.mockResolvedValue({ error: "error" });
    await expect(async () => {
      render(await TransferPage({ transferId: randomUUID() }));
    }).rejects.toThrow("Error fetching transfer information.");
  });
  it("renders the TransferDetailForm if transferId is provided", async () => {
    // Mocking the TransferDetailForm component
    vi.mock(
      "apps/registration/app/components/transfers/TransferDetailForm",
      () => ({
        default: () => <div>Mocked TransferDetailForm</div>,
      }),
    );

    // Mocking the operationEntitySchema function
    vi.mock(
      "apps/registration/app/data/jsonSchema/transfer/transferDetail",
      () => ({
        operationEntitySchema: vi.fn(),
      }),
    );
    const mockOperationEntitySchema = operationEntitySchema as ReturnType<
      typeof vi.fn
    >;
    const [operationId, fromOperatorId] = [randomUUID(), randomUUID()];
    getTransferEvent.mockResolvedValue({
      transfer_entity: "Operation",
      operation: operationId,
      operation_name: "Operation name",
      from_operator_id: fromOperatorId,
    });
    render(await TransferPage({ transferId: randomUUID() }));
    expect(screen.getByText("Mocked TransferDetailForm")).toBeInTheDocument();
    expect(mockOperationEntitySchema).toHaveBeenCalledWith(
      operationId,
      "Operation name",
      fromOperatorId,
    );
  });
});
