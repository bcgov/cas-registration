import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";

interface Column {
  id:
    | "date"
    | "daily_penalty"
    | "daily_compounded"
    | "accumulated_penalty"
    | "accumulated_compounded"
    | "interest_rate";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "date", label: "Date", minWidth: 170 },
  { id: "daily_penalty", label: "Daily Penalty", minWidth: 100 },
  {
    id: "daily_compounded",
    label: "Daily Compounded",
    minWidth: 170,
    align: "right",
  },
  {
    id: "accumulated_penalty",
    label: "Accumulated Penalty",
    minWidth: 170,
    align: "right",
  },
  {
    id: "accumulated_compounded",
    label: "Accumulated Compounded",
    minWidth: 170,
    align: "right",
  },
  {
    id: "interest_rate",
    label: "Interest Rate",
    minWidth: 170,
    align: "right",
  },
];

interface Data {
  date: string;
  daily_penalty: number;
  daily_compounded: number;
  accumulated_penalty: number;
  accumulated_compounded: number;
  interest_rate: number;
}

export default function PenaltyAccrualTable(data: any) {
  const { accrualData } = data;
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(100);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  if (!accrualData || !Array.isArray(accrualData)) return null;
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {accrualData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100, 500]}
        component="div"
        count={accrualData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
