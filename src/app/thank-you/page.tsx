import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { whatsappLink } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Thank You",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 pt-28 pb-20">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle2 className="mx-auto mb-2 size-14 text-emerald-500" />
            <CardTitle className="text-2xl">Payment received! 🔥</CardTitle>
            <CardDescription>
              Your download is on its way to your email right now — check your inbox and the
              spam folder. You can also re-download anytime from My Downloads.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full font-semibold">
              <Link href="/login">
                <Download className="size-4" /> Open My Downloads
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={whatsappLink("Hi! I just paid — quick question.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" /> Need help? WhatsApp us
              </a>
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </>
  );
}
