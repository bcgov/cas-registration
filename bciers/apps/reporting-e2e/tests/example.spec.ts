import testNxProjectLandingPage from "@bciers/e2e/utils/test-nx-app-landing-page";
import { UserRole } from "@/e2e/utils/enums";

testNxProjectLandingPage(["reporting"], UserRole.CAS_ADMIN);
