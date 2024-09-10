import { UserRole } from "@/e2e/utils/enums";
import testNxProjectLandingPage from "@bciers/e2e/utils/test-nx-app-landing-page";

// External users can't access the dashboard yet
testNxProjectLandingPage("reporting", UserRole.CAS_ANALYST);
