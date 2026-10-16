import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const APP_DIR = path.resolve(import.meta.dirname, "../../app");
const PENALTY_CALCULATOR_PAGE = path.join(
  "compliance-administration",
  "compliance-summaries",
  "[compliance_report_version_id]",
  "(manage-obligation)",
  "penalty-calculator",
  "page.tsx",
);

const rolesFor = (identityProvider: string) =>
  readdirSync(path.join(APP_DIR, identityProvider), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

const hasPenaltyCalculatorPage = (identityProvider: string, role: string) =>
  existsSync(
    path.join(APP_DIR, identityProvider, role, PENALTY_CALCULATOR_PAGE),
  );

describe("Penalty calculator route access", () => {
  it.each(rolesFor("idir"))("is available to the %s internal role", (role) => {
    expect(hasPenaltyCalculatorPage("idir", role)).toBe(true);
  });

  it.each(rolesFor("bceidbusiness"))(
    "is not found for the %s industry role",
    (role) => {
      expect(hasPenaltyCalculatorPage("bceidbusiness", role)).toBe(false);
    },
  );
});
