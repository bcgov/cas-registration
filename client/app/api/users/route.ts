import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  // mock user data for SRC demo
  const users = [
    {
      firstName: "Felix",
      lastName: "the Cat",
    },
    {
      firstName: "Garfield",
      lastName: "",
    },
    {
      firstName: "Tom",
      lastName: "Cat",
    },
    {
      firstName: "Simba",
      lastName: "",
    },
    {
      firstName: "Whiskers",
      lastName: "",
    },
    {
      firstName: "Nala",
      lastName: "",
    },
    {
      firstName: "Bagheera",
      lastName: "",
    },
    {
      firstName: "Cheshire",
      lastName: "Cat",
    },
    {
      firstName: "Puss",
      lastName: "in Boots",
    },
    {
      firstName: "Mittens",
      lastName: "",
    },
    {
      firstName: "Salem",
      lastName: "",
    },
  ];

  // simulate IO latency
  await new Promise((r) => setTimeout(r, 1000));

  return NextResponse.json(users);
}
