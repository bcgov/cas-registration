import { Chip, Table, TableBody, TableCell, TableRow } from "@mui/material";

export const PillList: React.FC<{ items: string[] }> = ({ items }) => {
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

export const DataCell: React.FC<{ data: string }> = ({ data }) => {
  const splitData = data.split("; ");

  return (
    <TableCell sx={{ borderBottom: "none" }}>
      {splitData.length > 1 ? <PillList items={splitData} /> : data}
    </TableCell>
  );
};

interface FinalReviewTableProps {
  data: Record<string, string | null>;
  fields: {
    label: string;
    key: string;
  }[];
}

export const FinalReviewTable: React.FC<FinalReviewTableProps> = ({
  data,
  fields,
}) => {
  return (
    <Table size="small">
      <TableBody>
        {fields.map(({ label, key }) => (
          <TableRow key={key}>
            <LabelCell label={label} />
            <DataCell data={data[key] ?? ""} />
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
