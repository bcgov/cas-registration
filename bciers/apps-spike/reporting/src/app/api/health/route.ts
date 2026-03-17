import healthCheckRoute from "@bciers/utils/src/healthCheckRoute";

export async function GET() {
  return healthCheckRoute();
}
