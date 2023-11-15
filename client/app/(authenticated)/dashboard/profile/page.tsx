import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name;
  const role = session?.user?.role;
  return (
    <>
      <h1>Hello</h1>
      {name && name}
      <br />
      {role && role}
    </>
  );
}
