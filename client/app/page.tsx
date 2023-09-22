import Login from "@/components/auth/Login";
import OperatorsList from "./components/operators/OperatorsList";

export default async function Page() {
  return (
    <>
      <Login />
      <OperatorsList />
    </>
  );
}
