import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <span className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <Flame className="size-6 text-white" />
          </span>
          <CardTitle className="text-2xl">Owner Dashboard</CardTitle>
          <CardDescription>
            {isAdminConfigured()
              ? "Enter your admin password to continue."
              : "Set ADMIN_PASSWORD in .env.local, restart the dev server, then log in here."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
