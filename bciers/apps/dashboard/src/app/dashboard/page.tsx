import { Tiles } from "@bciers/components/server";
import { buildTileContent, getJSONFiles } from "@bciers/actions/server";
import { auth } from "@/dashboard/auth";

export default async function Page() {
  // Get the user's identity provider
  const session = await auth();
  const folderName = session?.identity_provider as string;
  // Get the JSON files for this user type
  const jsonFiles = await getJSONFiles(`apps/dashboard/src/data/${folderName}`);
  // Get the JSON objects from the files
  const contents = await buildTileContent(jsonFiles);
  // Build the navigation tiles
  return (
    <>
      <Tiles tiles={contents} />
    </>
  );
}
