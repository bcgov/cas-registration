import { render, screen, fireEvent } from "@testing-library/react";
import ApplyComplianceUnitCell from "@/compliance/src/app/components/datagrid/cells/ApplyComplianceUnitCell";
import { GridRenderCellParams } from "@mui/x-data-grid";

describe("ApplyComplianceUnitCell", () => {
  const mockProps = {
    id: 1,
    field: "quantity_to_be_applied",
    row: {
      id: "1",
      type: "Earned Credits",
      serial_number: "BC-123",
      vintage_year: 2024,
      quantity_available: "100",
      quantity_to_be_applied: 0,
    },
    api: {
      updateRows: vi.fn(),
    },
  } as unknown as GridRenderCellParams;

  it("renders readonly value when readonly is true", () => {
    render(<ApplyComplianceUnitCell {...mockProps} readonly={true} />);
    expect(screen.getByText("0")).toBeVisible();
  });

  it("renders input field when readonly is false", () => {
    render(<ApplyComplianceUnitCell {...mockProps} readonly={false} />);
    const input = screen.getByLabelText("quantity_to_be_applied");
    expect(input).toBeVisible();
    expect(input).toHaveValue("0");
  });

  it("updates value when input changes", () => {
    const onUpdate = vi.fn();
    render(
      <ApplyComplianceUnitCell
        {...mockProps}
        readonly={false}
        onUpdate={onUpdate}
      />,
    );

    const input = screen.getByLabelText("quantity_to_be_applied");
    fireEvent.change(input, { target: { value: "50" } });

    expect(mockProps.api.updateRows).toHaveBeenCalledWith([
      {
        ...mockProps.row,
        quantity_to_be_applied: 50,
      },
    ]);
    expect(onUpdate).toHaveBeenCalledWith(50);
  });

  it("caps value at quantity_available", () => {
    const onUpdate = vi.fn();
    render(
      <ApplyComplianceUnitCell
        {...mockProps}
        readonly={false}
        onUpdate={onUpdate}
      />,
    );

    const input = screen.getByLabelText("quantity_to_be_applied");
    fireEvent.change(input, { target: { value: "150" } });

    expect(mockProps.api.updateRows).toHaveBeenCalledWith([
      {
        ...mockProps.row,
        quantity_to_be_applied: 100,
      },
    ]);
    expect(onUpdate).toHaveBeenCalledWith(100);
  });

  it("sets value to 0 when input is invalid", () => {
    const onUpdate = vi.fn();
    render(
      <ApplyComplianceUnitCell
        {...mockProps}
        readonly={false}
        onUpdate={onUpdate}
      />,
    );

    const input = screen.getByLabelText("quantity_to_be_applied");
    fireEvent.change(input, { target: { value: "invalid" } });

    expect(mockProps.api.updateRows).toHaveBeenCalledWith([
      {
        ...mockProps.row,
        quantity_to_be_applied: 0,
      },
    ]);
    expect(onUpdate).toHaveBeenCalledWith(0);
  });

  it("sets value to 0 when input is negative", () => {
    const onUpdate = vi.fn();
    render(
      <ApplyComplianceUnitCell
        {...mockProps}
        readonly={false}
        onUpdate={onUpdate}
      />,
    );

    const input = screen.getByLabelText("quantity_to_be_applied");
    fireEvent.change(input, { target: { value: "-50" } });

    expect(mockProps.api.updateRows).toHaveBeenCalledWith([
      {
        ...mockProps.row,
        quantity_to_be_applied: 0,
      },
    ]);
    expect(onUpdate).toHaveBeenCalledWith(0);
  });

  it("rounds decimal values to whole numbers", () => {
    const onUpdate = vi.fn();
    render(
      <ApplyComplianceUnitCell
        {...mockProps}
        readonly={false}
        onUpdate={onUpdate}
      />,
    );

    const input = screen.getByLabelText("quantity_to_be_applied");
    fireEvent.change(input, { target: { value: "50.7" } });

    expect(mockProps.api.updateRows).toHaveBeenCalledWith([
      {
        ...mockProps.row,
        quantity_to_be_applied: 50,
      },
    ]);
    expect(onUpdate).toHaveBeenCalledWith(50);
  });
});
