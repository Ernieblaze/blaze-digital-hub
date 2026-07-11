import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { siteSettings, whatsappLink } from "@/lib/site-settings";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Questions about a product or your order? Reach Blaze Digital Hub.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h1 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">
            Talk to <span className="text-blaze">us</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-center text-muted-foreground">
            Questions about a product, your order, or bulk licenses? We reply fast.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="font-semibold shadow-lg shadow-orange-500/25">
              <a href={whatsappLink("Hi! I have a question.")} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" /> WhatsApp (fastest)
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="font-semibold">
              <a href={`mailto:${siteSettings.contactEmail}`}>
                <Mail className="size-4" /> {siteSettings.contactEmail}
              </a>
            </Button>
          </div>

          <Card className="mt-10">
            <CardHeader>
              <CardTitle className="text-lg">Or send a message right here</CardTitle>
              <CardDescription>It lands straight in our inbox.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
