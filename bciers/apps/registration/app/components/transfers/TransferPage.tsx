import TransferForm from "@/registration/app/components/transfers/TransferForm";
import fetchOperatorsPageData from "@/administration/app/components/operators/fetchOperatorsPageData";
import { OperatorRow } from "@/administration/app/components/operators/types";

// 🧩 Main component
export default async function TransferPage() {
  const operators: {
    rows: OperatorRow[];
    row_count: number;
  } = await fetchOperatorsPageData({ paginate_result: "False" });

  if (!operators || "error" in operators || !operators.rows)
    throw new Error("Failed to fetch operators data");

  return <TransferForm formData={{}} operators={operators.rows} />;
}
