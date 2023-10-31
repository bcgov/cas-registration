import { Table, TableBody, TableCell, TableRow, Skeleton } from "@mui/material";

export default function SkeletonGrid() {
  // Simulate loading by rendering Skeleton components
  const renderLoadingRows = () => {
    const rows = [];
    for (let i = 0; i < 5; i++) {
      rows.push(
        <TableRow key={i}>
          <TableCell>
            <Skeleton />
          </TableCell>
          <TableCell>
            <Skeleton />
          </TableCell>
          <TableCell>
            <Skeleton />
          </TableCell>
        </TableRow>,
      );
    }
    return rows;
  };

  return (
    <Table>
      <TableBody>{renderLoadingRows()}</TableBody>
    </Table>
  );
}
