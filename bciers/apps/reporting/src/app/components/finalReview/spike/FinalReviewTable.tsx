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

export const LabelCell: React.FC<{ label: string }> = ({ label }) => {
  return (
    <TableCell
      component="th"
      scope="row"
      align="right"
      width={300}
      sx={{
        borderBottom: "none",
        borderRight: "1px solid grey",
        fontWeight: "bold",
      }}
    >
      {label}
    </TableCell>
  );
};

export const DataCell: React.FC<{ data?: string }> = ({ data }) => {
  const splitData = (data || "").split("; ");

  return (
    <TableCell sx={{ borderBottom: "none", whiteSpace: "pre-line" }}>
      {splitData.length > 1 ? <PillList items={splitData} /> : data}
    </TableCell>
  );
};

interface FinalReviewTableProps {
  data: Record<string, string | undefined>;
  fields: SectionField[];
}

export const FinalReviewTable: React.FC<FinalReviewTableProps> = ({
  data,
  fields,
}) => {
  return (
    <Table size="small">
      <TableBody>
        {fields.map((f, index) => (
          <TableRow key={`${f.key}-${index}`}>
            <LabelCell label={f.label || ""} />
            <DataCell data={f.key ? data[f.key] : ""} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
