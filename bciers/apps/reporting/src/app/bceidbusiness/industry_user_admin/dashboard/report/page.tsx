import { auth } from "@/dashboard/auth";

export default async function Page() {
  // Get the user's identity provider
  const session = await auth();
  const name = session?.user?.full_name;
  // Build the navigation tiles
  return <>TBD {name}</>;
}
