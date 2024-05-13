import { Tiles } from "@bciers/components/server";

export default async function Page() {
  const tiles = [
    "/src/data/registration.json",
    "/src/data/report_a_problem.json",
  ];
  return (
    <>
      <Tiles tiles={tiles} />
    </>
  );
}
