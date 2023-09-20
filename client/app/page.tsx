import Login from "@/components/auth/Login";
/* Components */
import Link from "next/link";

export default async function Page() {
  return (
    <>
      <Login />
      <h1>Links to app pages</h1>
      <ul>
        <Link href="/operations">Operations</Link>
      </ul>
    </>
  );
}
