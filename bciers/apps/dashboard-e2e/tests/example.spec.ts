import { UserRole } from "@/e2e/utils/enums";
import testNxProjectLandingPage from "@bciers/e2e/utils/test-nx-app-landing-page";

testNxProjectLandingPage("dashboard", UserRole.INDUSTRY_USER_ADMIN);
