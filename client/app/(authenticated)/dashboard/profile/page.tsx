import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  /*When calling from the server-side i.e. in Route Handlers, React Server Components, API routes getServerSession requires passing the same object you would pass to NextAuth*/
  const session = await getServerSession(authOptions);
  const name = session?.user?.name;
  const role = session?.user?.role;
  return (
    <>
      <h1>Hello</h1>
      {name && <p>Name: {name}</p>}
      {role && <p>Role: {role}</p>}
    </>
  );
}
