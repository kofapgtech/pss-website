"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession, destroySession } from "@/lib/auth";
import { formString } from "@/lib/actions/guard";

export async function loginAction(
  _prevState: { error: string } | undefined,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const password = formString(formData, "password");

  if (!password || !checkPassword(password)) {
    return { error: "Incorrect password. Please try again." };
  }

  await createSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
