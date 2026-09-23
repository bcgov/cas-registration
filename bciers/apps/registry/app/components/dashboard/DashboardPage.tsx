import { getSessionRole } from "@bciers/utils/src/sessionUtils";
import { BC_GOV_TEXT } from "@bciers/styles/colors";

export default async function RegistryDashboardPage({
    searchParams,
}: {
    searchParams: SerialNumberParams;
}) {
    const role = await getSessionRole();
    const isInternalUser = role.includes("cas_");

    // fetch dashboard data

    return (
        <>
        // tab navigator
        // grid
        </>
    )
}