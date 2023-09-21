import { NextResponse } from "next/server";
import { parseEmail } from "@/utils/helpers";

export async function POST(req: Request, res: Response) {
  try {
    // Parsing payload
    const body = await req.json();
    const email = body.email;
    const password = body.password;

    // Simulate an error condition, e.g., invalid email or password
    if (!email || !password) {
      // Return an error response with a 400 status code and an error message
      return new NextResponse("Error: missing data", { status: 400 });
    }

    const parsedEmail = parseEmail(email);

    // Create the mock user object
    const user = {
      firstName: parsedEmail.firstName || "FirstName",
      lastName: parsedEmail.lastName || "LastName",
    };

    // Create the mock token
    const token = "/_/ ( o.o ) > ^ <";

    // Create LoginResponse
    const response = {
      user: user,
      token: token,
    };

    // Simulate latency
    await new Promise((r) => setTimeout(r, 1000));

    // Return LoginResponse
    return NextResponse.json(response);
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error:", error);

    // Return an error response with a 500 status code and an error message

    return new NextResponse("Error: server side", { status: 500 });
  }
}
