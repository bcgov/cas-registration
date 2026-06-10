import { createStartReportSchemas } from "@reporting/src/data/jsonSchema/report/startReport";
import StartReportForm from "@reporting/src/app/components/report/StartReportForm";

export default async function StartReportPage() {
  const { schema, uiSchema } = await createStartReportSchemas();

  return (
    <div className="mt-5">
      <StartReportForm schema={schema} uiSchema={uiSchema} />
    </div>
  );
}
