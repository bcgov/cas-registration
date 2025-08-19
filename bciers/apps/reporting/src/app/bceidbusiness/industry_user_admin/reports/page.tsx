import { permanentRedirect } from "next/navigation";

export default function ReportsPage() {
  permanentRedirect("/reports/current-reports");
}
