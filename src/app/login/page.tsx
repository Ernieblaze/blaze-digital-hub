import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export const metadata: Metadata = {
  title: "Buyer Login",
  description: "Access your purchases, bonuses and updates.",
};

/**
 * AUTH PLACEHOLDER — buyer dashboard coming later.
 * When ready, wire this up with Auth.js (next-auth) or Clerk and gate
 * a /dashboard route where buyers re-download products and claim bonuses.
 */
export default function LoginPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 pt-28 pb-20">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <span className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <Flame className="size-6 text-white" />
            </span>
            <CardTitle className="text-2xl">Buyer Dashboard</CardTitle>
            <CardDescription>
              Coming soon — log in to re-download your products, get free updates and claim
              exclusive bonuses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button disabled className="w-full font-semibold">
              <Lock className="size-4" /> Login (coming soon)
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/#shop">Browse products instead</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
