/**
📚 Server Actions:
 Server actions are JavaScript async functions that run on the server
and can be called from server components or from client components.

💡 You can define Server actins in RSC or define multiple Server Actions in a single file.
*/
"use server";

import { promises as fs } from "fs";
import { cookies } from "next/headers";

// 🛠️ Function to get the encrypted JWT from NextAuth getToken route function
export async function getToken() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/token`, {
      method: "GET",
      headers: { Cookie: cookies().toString() },
    });

    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error(`Failed to fetch token. Status: ${res.status}`);
      return {};
    }
    return await res.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`An error occurred while fetching token: ${error}`);
    return {};
  }
}
// 🛠️ Function to dynamically import json data
export async function loadJson(path: string) {
  const file = await fs.readFile(process.cwd() + path, "utf8");
  return JSON.parse(file);
}
