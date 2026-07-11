import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <CardContent className="space-y-4">
          {Boolean(process.env.GOOGLE_CLIENT_ID && process.env.ADMIN_EMAILS) && (
            <>
              <Button asChild variant="outline" className="w-full font-semibold">
                <a href="/api/auth/google?next=/admin">Continue with Google (owner)</a>
              </Button>
              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or password</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
