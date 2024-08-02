import { actionHandler } from "@bciers/actions";
import Gsc from './gsc'
import { Suspense } from "react";

// 🛠️ Function to fetch operations
export const fetchSchemaData = async () => {
  // fetch data from server
  const schemaData = await actionHandler(`reporting/build-form-schema?activity=1&source_types[]=1&source_types[]=2&report_date=2024-04-01`, "GET", "");
  return JSON.parse(schemaData);
};

// 🧩 Main component
export default async function Activity() {
  // Fetch operations data
  const {schema} = await fetchSchemaData();
  if (!schema) {
    return <div>No schema found.</div>;
  }
  // Render the DataGrid component
  return (
    <Suspense fallback="Loading Schema">
      <Gsc schema={schema}/>
    </Suspense>
  );
}
