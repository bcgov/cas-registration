import { NextResponse } from "next/server";

export async function GET() {
  // mock user data
  const users = [
    {
      firstName: "Felix",
      lastName: "the Cat",
    },
    {
      firstName: "Garfield",
      lastName: "Spagetti",
    },
    {
      firstName: "Tom",
      lastName: "Cat",
    },
    {
      firstName: "Whiskers",
      lastName: "Temptations",
    },
    {
      firstName: "Puss",
      lastName: "in Boots",
    },
    {
      firstName: "Mittens",
      lastName: "Paws",
    },
  ];

  // simulate IO latency
  await new Promise((r) => setTimeout(r, 1000));

  return NextResponse.json(users);
}
