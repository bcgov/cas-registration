import { GridRowsProp } from "@mui/x-data-grid";

import { fetchAPI } from "@/app/utils/api";
import DataGrid from "@/app/components/datagrid/DataGrid";

// 🛠️ Function to fetch user-operators
async function getUserOperators() {
  try {
    return await fetchAPI("registration/user-operators");
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}
// // 🛠️ Function to fetch user-operators
// async function getUsers() {
//   try {
//     return await fetchAPI("registration/users");
//   } catch (error) {
//     // Handle the error here or rethrow it to handle it at a higher level
//     throw error;
//   }
// }

// // 🛠️ Function to fetch user-operators
// async function getOperators() {
//   try {
//     return await fetchAPI("registration/operators");
//   } catch (error) {
//     // Handle the error here or rethrow it to handle it at a higher level
//     throw error;
//   }
// }

// 🧩 Main component
export default async function AccessRequests() {
  // Fetch operations data
  const userOperators: any = await getUserOperators();
  console.log("userOperators: ", userOperators);
  if (!userOperators) {
    return (
      <div>
        No user-operators data in database (did you forget to run `make
        loadfixtures`?)
      </div>
    );
  }
  // const users: {
  //   first_name: string;
  //   last_name: string;
  //   email: string;
  // }[] = await getUsers();
  // console.log("users: ", users);
  // if (!users) {
  //   return (
  //     <div>
  //       No users data in database (did you forget to run `make loadfixtures`?)
  //     </div>
  //   );
  // }
  // const operators: {
  //   id: number;
  //   name: string;
  // }[] = await getOperators();
  // console.log("operators: ", operators);

  // if (!operators) {
  //   return (
  //     <div>
  //       No operators data in database (did you forget to run `make
  //       loadfixtures`?)
  //     </div>
  //   );
  // }

  // Transform the fetched data into rows for the DataGrid component
  const rows1: GridRowsProp =
    userOperators.length > 0
      ? userOperators.map(({ id, status }) => {
          return {
            id,
            status,
          };
        })
      : [];
  console.log("rowsUserOperators: ", rows1);

  // // Transform the fetched data into rows for the DataGrid component
  // const rows2: GridRowsProp =
  //   users.length > 0
  //     ? users.map(({ first_name, last_name, email }) => {
  //         return {
  //           first_name,
  //           last_name,
  //           email,
  //         };
  //       })
  //     : [];
  // console.log("rowsUsers: ", rows2);

  // // Transform the fetched data into rows for the DataGrid component
  // const rows3: GridRowsProp =
  //   operators.length > 0
  //     ? operators.map(({ id, name }) => {
  //         return {
  //           id,
  //           name,
  //         };
  //       })
  //     : [];
  // console.log("rowsOperators: ", rows3);

  // const rows = [...rows1, ...rows2, ...rows3];
  console.log("rows: ", rows1);

  // Render the DataGrid component
  return (
    <>
      <DataGrid
        cntxt="user-operators"
        rows={rows1}
        columns={[
          { field: "id", headerName: "Request ID", width: 150 },
          { field: "first_name", headerName: "First Name", width: 150 },
          { field: "last_name", headerName: "Last Name", width: 150 },
          { field: "email", headerName: "Email", width: 150 },
          { field: "operator", headerName: "Operator", width: 150 },
          { field: "status", headerName: "Status", width: 150 },
          {
            field: "action",
            headerName: "Action",
            sortable: false,
            width: 200,
          },
        ]}
      />
    </>
  );
}
