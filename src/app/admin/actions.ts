"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, adminSessionToken, isAdminConfigured } from "@/lib/admin-auth";

export type LoginState = { error: string } | null;

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!isAdminConfigured()) {
    return { error: "ADMIN_PASSWORD is not set. Add it to .env.local and restart the server." };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || password !== process.env.ADMIN_PASSWORD) {
    return { error: "Wrong password. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, adminSessionToken()!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}
