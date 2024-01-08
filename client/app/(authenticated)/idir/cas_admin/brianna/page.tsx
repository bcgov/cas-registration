import { actionHandler } from "@/app/utils/actions";
import BriannaForm from "./formcomponent";

export async function getDocuments() {
  try {
    return await actionHandler("registration/handle-file", "GET", "");
  } catch (error) {
    // Handle the error here or rethrow it to handle it at a higher level
    throw error;
  }
}

export default async function Page({
  params,
}: {
  readonly params: { id: number };
}) {
  const documents = await getDocuments();
  return <BriannaForm params={params} documents={documents} />;
}
