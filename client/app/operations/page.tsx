"use client";

import { GridRowsProp, GridColDef } from "@mui/x-data-grid";
import DataGrid from "../components/DataGrid/DataGrid";
import Link from "next/link";
import { Button } from "@mui/material";
import { useGetOperationsQuery } from "@/redux/index";

export const columns: GridColDef[] = [
  { field: "operation_id", headerName: "Operation ID", width: 150 },
  { field: "operation", headerName: "Operation", width: 150 },
  { field: "registration_year", headerName: "Registration Year", width: 150 },
  { field: "submission_date", headerName: "Submission Date", width: 150 },
  { field: "registration_id", headerName: "Registration ID", width: 150 },
  { field: "status", headerName: "Status", width: 150 },
  {
    field: "action",
    headerName: "Action",
    sortable: false,
    width: 200,
    renderCell: (params) => {
      return (
        // <Button onClick={onClick}>
        //   {}
        // </Button>
        <Link href={`operations/${params.row.id}`}>
          <Button>
            {params.row.status === "Not Registered"
              ? "Start Registration"
              : "View Details"}
          </Button>
        </Link>
      );
    },
  },
];

const rows: GridRowsProp = [
  { id: 1, operation_id: 1 },
  {
    id: 2,
    operation_id: "DataGridPro",
    operation: "is Awesome",
    status: "not registered",
  },
  { id: 3, operation_id: "MUI", operation: "is Amazing" },
];
export default function Page() {
  // const dispatch = useDispatch();
  // const operations1 = useSelector(selectOperations);

  // const [operations, setOperations] = useState([]);
  // const operations = useSelector(selectAllOperations);

  // by default nextjs is server side, have to put "use client"
  // 🌐 Get the user data directly from the Redux store when server side
  // const operationsData = store.getState().operations;

  // since we're client side we should use selectors
  // selectOperations -- this is when you need to access something you already got, maybe it goes and gets it if you have't done the call somewhere else

  // 🧰 Destructure the query function and states using useGetUsersQuery
  // "You should normally use the query hooks to access cached data in components - you shouldn't write your own useSelector calls to access fetched data or useEffect calls to trigger fetching!""
  const { data, isLoading, error } = useGetOperationsQuery(null);

  // Check if data is currently loading
  if (isLoading) {
    // If data is loading, update content to display a loading message
    return <div>🚀 Loading data... </div>;
  }

  // Check if an error occurred
  if (error) {
    // If an error occurred, update content to display an error message
    return <div>Something went wrong, Please retry after some time</div>;
  }

  if (data) {
    // If data is available, update content to display the fetched user data
    const brianna = data.map(
      ({
        id,
        registration_year,
        submission_date,
        registration_id,
        status,
        name,
        verified_at,
      }) => {
        //       {
        //         id: 2,
        //         operationId: "DataGridPro",
        //         operation: "is Awesome",
        //         status: "not registered",
        //       },

        //       eligible_commercial_product_name
        // :
        // "string"
        // estimated_emissions
        // :
        // "0E-10"

        return {
          id,
          operation_id: id,
          operation: name,
          registration_year,
          submission_date,
          registration_id,
          status: verified_at ? "Registered" : "Pending",
        };
      }
    );
    console.log("brianna", brianna);

    return (
      <>
        <h1>Operations List</h1>
        <Button>Add Operation</Button>
        <DataGrid columns={columns} rows={brianna} />
      </>
    );
  }
}
