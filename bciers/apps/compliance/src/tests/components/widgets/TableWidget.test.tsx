import TableWidget, {
  TableField,
} from "@/compliance/src/app/widgets/TableWidget";
import { render, screen, fireEvent } from "@testing-library/react";
import { WidgetProps } from "@rjsf/utils";

const makeProps = (overrides: Partial<WidgetProps> = {}): WidgetProps =>
  ({
    id: "test-table",
    label: "",
    options: {},
    value: {},
    ...overrides,
  }) as unknown as WidgetProps;

describe("TableWidget", () => {
  describe("rendering", () => {
    it("renders an empty table when no data is provided", () => {
      render(<TableWidget {...makeProps()} />);
      expect(screen.getByText(/page 1 of 1/i)).toBeVisible();
    });

    it("renders column headers from options", () => {
      render(
        <TableWidget
          {...makeProps({
            options: { columnHeaders: ["Name", "Age", "City"] },
          })}
        />,
      );
      expect(screen.getByText("Name")).toBeVisible();
      expect(screen.getByText("Age")).toBeVisible();
      expect(screen.getByText("City")).toBeVisible();
    });

    it("renders column headers from value when not in options", () => {
      render(
        <TableWidget
          {...makeProps({
            value: { columnHeaders: ["Col A", "Col B"] },
          })}
        />,
      );
      expect(screen.getByText("Col A")).toBeVisible();
      expect(screen.getByText("Col B")).toBeVisible();
    });

    it("options columnHeaders take precedence over value columnHeaders", () => {
      render(
        <TableWidget
          {...makeProps({
            options: { columnHeaders: ["Options Col"] },
            value: { columnHeaders: ["Value Col"] },
          })}
        />,
      );
      expect(screen.getByText("Options Col")).toBeVisible();
      expect(screen.queryByText("Value Col")).not.toBeInTheDocument();
    });

    it("renders array rows", () => {
      render(
        <TableWidget
          {...makeProps({
            options: {
              columnHeaders: ["Name", "Score"],
              tableData: [
                ["Alice", 90],
                ["Bob", 85],
              ],
            },
          })}
        />,
      );
      expect(screen.getByText("Alice")).toBeVisible();
      expect(screen.getByText("90")).toBeVisible();
      expect(screen.getByText("Bob")).toBeVisible();
      expect(screen.getByText("85")).toBeVisible();
    });

    it("renders object rows using header keys", () => {
      render(
        <TableWidget
          {...makeProps({
            options: {
              columnHeaders: ["name", "score"],
              tableData: [{ name: "Alice", score: 90 }],
            },
          })}
        />,
      );
      expect(screen.getByText("Alice")).toBeVisible();
      expect(screen.getByText("90")).toBeVisible();
    });

    it("displays '-' for null, undefined, and empty string cell values", () => {
      render(
        <TableWidget
          {...makeProps({
            options: {
              columnHeaders: ["A", "B", "C"],
              tableData: [[null, undefined, ""]],
            },
          })}
        />,
      );
      const dashes = screen.getAllByText("-");
      expect(dashes).toHaveLength(3);
    });

    it("renders a label when provided", () => {
      render(<TableWidget {...makeProps({ label: "My Table Label" })} />);
      expect(screen.getByText("My Table Label")).toBeVisible();
    });

    it("renders no label element when label is empty", () => {
      render(<TableWidget {...makeProps({ label: "" })} />);
      const paras = document.querySelectorAll("p.mb-2");
      expect(paras).toHaveLength(0);
    });
  });

  describe("pagination", () => {
    const manyRows = Array.from({ length: 12 }, (_, i) => [`Row ${i + 1}`]);

    it("shows correct page count with default 5 rows per page", () => {
      render(
        <TableWidget
          {...makeProps({
            options: { columnHeaders: ["Item"], tableData: manyRows },
          })}
        />,
      );
      expect(screen.getByText(/page 1 of 3/i)).toBeVisible();
    });

    it("shows correct page count with custom rowsPerPage", () => {
      render(
        <TableWidget
          {...makeProps({
            options: {
              columnHeaders: ["Item"],
              tableData: manyRows,
              rowsPerPage: 4,
            },
          })}
        />,
      );
      expect(screen.getByText(/page 1 of 3/i)).toBeVisible();
    });

    it("disables previous button on first page", () => {
      render(
        <TableWidget
          {...makeProps({
            options: { columnHeaders: ["Item"], tableData: manyRows },
          })}
        />,
      );
      expect(screen.getByRole("button", { name: "<" })).toBeDisabled();
      expect(screen.getByRole("button", { name: ">" })).not.toBeDisabled();
    });

    it("navigates to the next page and back", () => {
      render(
        <TableWidget
          {...makeProps({
            options: { columnHeaders: ["Item"], tableData: manyRows },
          })}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: ">" }));
      expect(screen.getByText(/page 2 of 3/i)).toBeVisible();
      expect(screen.getByText("Row 6")).toBeVisible();

      fireEvent.click(screen.getByRole("button", { name: "<" }));
      expect(screen.getByText(/page 1 of 3/i)).toBeVisible();
      expect(screen.getByText("Row 1")).toBeVisible();
    });

    it("disables next button on last page", () => {
      render(
        <TableWidget
          {...makeProps({
            options: { columnHeaders: ["Item"], tableData: manyRows },
          })}
        />,
      );

      const nextBtn = screen.getByRole("button", { name: ">" });
      fireEvent.click(nextBtn);
      fireEvent.click(nextBtn);
      expect(screen.getByText(/page 3 of 3/i)).toBeVisible();
      expect(nextBtn).toBeDisabled();
    });

    it("does not navigate past the last page", () => {
      render(
        <TableWidget
          {...makeProps({
            options: {
              columnHeaders: ["Item"],
              tableData: manyRows,
              rowsPerPage: 5,
            },
          })}
        />,
      );
      const nextBtn = screen.getByRole("button", { name: ">" });
      fireEvent.click(nextBtn);
      fireEvent.click(nextBtn);
      fireEvent.click(nextBtn); // already at last page
      expect(screen.getByText(/page 3 of 3/i)).toBeVisible();
    });
  });
});

describe("TableField", () => {
  it("renders with schema title as label", () => {
    render(
      <TableField
        schema={{ title: "Emission Sources" }}
        formData={{ columnHeaders: ["Source"], tableData: [["Boiler"]] }}
      />,
    );
    expect(screen.getByText("Emission Sources")).toBeVisible();
    expect(screen.getByText("Boiler")).toBeVisible();
  });

  it("hides label when ui:options label is false", () => {
    render(
      <TableField
        schema={{ title: "Hidden Label" }}
        uiSchema={{ "ui:options": { label: false } }}
        formData={{ columnHeaders: ["Col"], tableData: [["Val"]] }}
      />,
    );
    expect(screen.queryByText("Hidden Label")).not.toBeInTheDocument();
    expect(screen.getByText("Val")).toBeVisible();
  });

  it("uses columnHeaders from uiSchema options", () => {
    render(
      <TableField
        uiSchema={{ "ui:options": { columnHeaders: ["Override"] } }}
        formData={{ columnHeaders: ["Original"], tableData: [["Data"]] }}
      />,
    );
    expect(screen.getByText("Override")).toBeVisible();
    expect(screen.queryByText("Original")).not.toBeInTheDocument();
  });
});
