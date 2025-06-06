import Tiles from "@bciers/components/navigation/Tiles";
import Note from "@bciers/components/layout/Note";
import { fetchDashboardData } from "@bciers/actions";
import { ContentItem } from "@bciers/types/tiles";
import { FrontEndRoles } from "@bciers/utils/src/enums";
import evalDashboardRules from "@bciers/utils/src/evalDashboardRules";
import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";

export default async function Page() {
  const role = await getSessionRole();
  const isIndustryUser = role.includes("industry");

  let data: ContentItem[] = [];

  // Check role before fetching data
  if (role && role !== FrontEndRoles.CAS_PENDING) {
    // 🚀 API fetch dashboard tiles
    // 🚩 Source: bc_obps/common/fixtures/dashboard/bciers/[IdProviderType]
    data = (await fetchDashboardData(
      "common/dashboard-data?dashboard=bciers",
    )) as ContentItem[];
    // Evaluate display rules in the dashboard data
    data = await evalDashboardRules(data);
  }

  return (
    <div>
      {role === FrontEndRoles.CAS_PENDING ? (
        <section
          className="text-center my-20 text-2xl flex flex-col gap-3"
          data-testid="dashboard-pending-message"
        >
          <span>
            <AccessTimeFilledIcon sx={{ color: "#FFCC00", fontSize: 50 }} />
          </span>
          <div style={{ fontSize: "16px" }}>
            {/* Chesca test */}
            <p>Test By logging in, you have automatically requested access.</p>
            <p>
              Once approved, you will receive a confirmation email. You can then
              log back in using your IDIR.
            </p>
          </div>
        </section>
      ) : (
        <>
          {isIndustryUser && (
            <Note variant="important">
              <b>Important:</b> Please always ensure that the information in{" "}
              <b>Registration</b> is complete and accurate before submitting or
              amending reports in <b>Reporting.</b>
            </Note>
          )}
          <Tiles tiles={data} />
        </>
      )}
    </div>
  );
}
