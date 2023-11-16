import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  /* When calling from the server-side i.e., in Route Handlers, React Server Components, API routes,
   * getServerSession requires passing the same object you would pass to NextAuth
   */
  const session = await getServerSession(authOptions);

  return (
    <>
      <h1>Server Page Session Information</h1>
      {session && (
        <>
          <p>Name: {session?.user?.name}</p>
          <p>Role: {session?.user?.role}</p>
          <p>GUID: {session?.user?.user_guid}</p>
          <p>IP: {session?.identity_provider}</p>
        </>
      )}
    </>
  );
}
