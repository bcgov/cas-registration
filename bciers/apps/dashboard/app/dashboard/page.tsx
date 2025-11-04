import Tiles from "@bciers/components/navigation/Tiles";
import ReportingYearHeader from "@bciers/components/reporting/ReportingYearHeader";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import evalDashboardRules from "@bciers/utils/src/evalDashboardRules";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import { getReportingYear } from "@reporting/src/app/utils/getReportingYear";

// Component for the pending access message
function PendingAccessMessage() {
  return (
    <section
      className="text-center my-20 text-2xl flex flex-col gap-3"
      data-testid="dashboard-pending-message"
    >
      <span>
        <AccessTimeFilledIcon sx={{ color: "#FFCC00", fontSize: 50 }} />
      </span>
      <div style={{ fontSize: "16px" }}>
        <p>By logging in, you have automatically requested access.</p>
        <p>
          Once approved, you will receive a confirmation email. You can then log
          back in using your IDIR.
        </p>
      </div>
    </section>
  );
}

export default async function Page() {
  const role = await getSessionRole();
  const isPendingUser = role === FrontEndRoles.CAS_PENDING;
  const isIndustryUser = role.includes("industry_");

  // Early return for pending users
  if (isPendingUser) {
    return (
      <div>
        <PendingAccessMessage />
      </div>
    );
  }

  // Fetch dashboard data for authenticated users
  // 🚀 API fetch dashboard tiles
  // 🚩 Source: bc_obps/common/fixtures/dashboard/bciers/[IdProviderType]
  let data = (await fetchDashboardData(
    "common/dashboard-data?dashboard=bciers",
  )) as ContentItem[];
  // Evaluate display rules in the dashboard data
  data = await evalDashboardRules(data);

  // Get reporting year information only for industry users
  let reportingYearData;

  if (isIndustryUser) {
    reportingYearData = await getReportingYear();
  }

  return (
    <div>
      {isIndustryUser && reportingYearData && (
        <ReportingYearHeader
          reportingYear={reportingYearData.reporting_year}
          reportDueYear={reportingYearData.report_due_year}
          variant="dashboard"
          showInfoBox={true}
        />
      )}

      <Tiles tiles={data} />
    </div>
  );
}
