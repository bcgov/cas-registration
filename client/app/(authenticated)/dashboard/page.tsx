import { actionHandler } from "@/app/utils/actions";
import Tiles from "@/app/components/layout/Tiles";
/*
📚
In the app directory, nested folders are normally mapped to URL paths.
However, you can mark a folder as a Route Group to prevent the folder from being included in the route's URL path.
This allows you to organize your route segments and project files into logical groups without affecting the URL path structure, (useful in dynamic BreadCrumbs)
e.g. app\(authenticated)\dashboard maps to route: http://localhost:3000/dashboard
*/

async function getOperatorFromUser() {
  try {
    return await actionHandler("registration/operator-from-user", "GET", "");
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export default async function Page() {
  const operator = await getOperatorFromUser();
  return <Tiles operatorStatus={operator.status} />;
}
