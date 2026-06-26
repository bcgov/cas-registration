import { Chip, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { SectionField } from "../templates/SectionReview";

const PillList: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <>
      {items.map((item) => (
        <Chip
          key={item}
          label={item}
          size="small"
          sx={{
            color: "#38598A",
            bgcolor: "#DBEAFE",
            marginRight: "0.5em",
          }}
        />
      ))}
    </>
  );
};

export const LabelCell: React.FC<{
  label: string;
  variant: "default" | "compact";
}> = ({ label, variant = "default" }) => {
  return (
    <TableCell
      component="th"
      scope="row"
      // align="right"
      sx={{
        borderBottom: "none",
        // borderRight: "1px solid #717182",
        fontWeight: "bold",
        whiteSpace: "collapse",
        width: "18em",
        padding: variant === "compact" ? "2px 16px" : "6px 16px",
      }}
    >
      {label}
    </TableCell>
  );
};

export const DataCell: React.FC<{
  data?: string;
  variant: "default" | "compact";
}> = ({ data, variant = "default" }) => {
  const splitData = (
    (data instanceof String ? data : JSON.stringify(data)) || ""
  ).split("; ");

  return (
    <TableCell
      sx={{
        borderBottom: "none",
        whiteSpace: "pre-line",
        maxWidth: "600px",
        padding: variant === "compact" ? "2px 16px" : "6px 16px",
      }}
    >
      {splitData.length > 1 ? <PillList items={splitData} /> : data}
    </TableCell>
  );
};

interface FinalReviewTableProps {
  data: Record<string, string | undefined>;
  fields: SectionField[];
  variant?: "default" | "compact";
}

export const FinalReviewTable: React.FC<FinalReviewTableProps> = ({
  data,
  fields,
  variant = "default",
}) => {
  return (
    <Table size="small">
      <TableBody>
        {fields.map((f, index) => (
          <TableRow
            key={`${f.key}-${index}`}
            sx={{ borderBottom: "1px solid #F2F2F2" }}
          >
            <LabelCell label={f.label || ""} variant={variant} />
            <DataCell data={f.key ? data[f.key] : ""} variant={variant} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
