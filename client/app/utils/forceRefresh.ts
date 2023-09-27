"use server";
import { revalidatePath } from "next/cache";

export async function forceRefresh(path: string) {
  revalidatePath(path);
}
