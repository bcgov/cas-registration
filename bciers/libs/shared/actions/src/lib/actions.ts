/**
📚 Server Actions:
 Server actions are JavaScript async functions that run on the server
and can be called from server components or from client components.

💡 You can define Server actins in RSC or define multiple Server Actions in a single file.
*/
"use server";

import { cookies } from "next/headers";
import { ContentItem } from "@bciers/types";
import { actionHandler } from "@bciers/utils/actions";

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

// 🛠️ Function to get dashboard tiles
export async function fetchDashboardData(url: string) {
  try {
    // fetch data from server
    const response = await actionHandler(url, "GET", "");
    // Pretty-print the data
    const data = JSON.stringify(response[0].data.tiles, null, 2);
    // Parse data to object
    const object = JSON.parse(data);
    // Assert the object as ContentType
    return object as ContentItem[];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`An error occurred while fetching dashboard data: ${error}`);
    return {};
  }
}
