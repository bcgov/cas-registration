/**
📚 Server Actions:
 Server actions are JavaScript async functions that run on the server
and can be called from server components or from client components.

💡 You can define Server actins in RSC or define multiple Server Actions in a single file.
*/
"use server";

import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { ContentItem } from "@bciers/types";

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

// 🛠️ Function to get the relative path of the monorepo
function getRelativePath() {
  const bciers = "bciers"; // Constant for directory name
  const currentPath = process.cwd();
  const relativePath = currentPath.slice(
    0,
    currentPath.indexOf(bciers) + bciers.length,
  );
  return relativePath;
}

// 🛠️ Function to return an array of JSON file paths within a source path
export async function getJSONFiles(folderName: string): Promise<string[]> {
  // Get the directory path for folderName
  const relativePath = getRelativePath();
  const directoryPath = path.join(relativePath, folderName);
  try {
    // Read the directory
    const filenames = await fs.readdir(directoryPath);

    // Filter JSON files and construct relative paths for JSON files
    const jsonFiles = filenames
      .filter((filename: string) => filename.endsWith(".json"))
      .map((filename: string) => path.join(folderName, filename)); // Constructing relative paths

    const reportProblemJsonPath = "libs/shared/data/src/report_a_problem.json";
    jsonFiles.push(reportProblemJsonPath);

    return jsonFiles;
  } catch (error) {
    console.error(`Error reading directory: ${error}`);
    return [];
  }
}

// 🛠️ Function to dynamically import json data objects
export async function loadJson(jsonFile: string) {
  const relativePath = getRelativePath();
  const directoryPath = path.join(relativePath, jsonFile);
  const file = await fs.readFile(directoryPath, "utf8");
  return JSON.parse(file);
}

// 🛠️ Function to build tile content for dashboard
export async function buildTileContent(
  tiles: string[],
): Promise<ContentItem[]> {
  const contents: ContentItem[] = [];

  for (const tile of tiles) {
    try {
      // Load JSON data asynchronously using loadJson
      const content = await loadJson(tile);

      // Assuming the loaded JSON data has the structure of ContentItem
      const contentItem: ContentItem = {
        title: content.title,
        icon: content.icon,
        content: content.content,
        links: content.links,
      };

      // Push content to the array
      contents.push(contentItem);
    } catch (error) {
      console.error(`Error loading JSON data for tile "${tile}":`, error);
      // Handle loading errors (e.g., display an error message in the div)
      contents.push({
        title: `Error: Failed to load content for "${tile}"`,
        icon: "",
        content: "",
        links: [],
      });
    }
  }

  return contents;
}
