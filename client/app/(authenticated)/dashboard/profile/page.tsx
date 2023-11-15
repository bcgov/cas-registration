import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page() {
  const session = await getServerSession(authOptions);
  //console.log(session);
  return (
    <>
      <h1>Profile</h1>
    </>
  );
}
