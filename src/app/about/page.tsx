import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame, Target, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "About Ernie Blaze",
  description:
    "Meet Coach Ernest Favour (Ernie Blaze) — trader, educator and creator helping Nigerian students and hustlers turn skills into income.",
};

const values = [
  {
    icon: Target,
    title: "No fluff, only what works",
    text: "Every product is built from real experience — real trades, real exams passed, real businesses grown. If it doesn't work in the Nigerian reality, it doesn't get sold here.",
  },
  {
    icon: Users,
    title: "Built for the streets",
    text: "Guides assume a phone, patchy data and a tight budget — not a MacBook and a trust fund. If you have hunger and a smartphone, you have everything you need.",
  },
  {
    icon: TrendingUp,
    title: "Skin in the game",
    text: "Coach Ernest uses the same blueprints he sells — the same trading system, the same design templates, the same hustle playbooks. Updates ship because he keeps using them.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
              <Flame className="size-8 text-white" />
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-5xl">
              The story behind <span className="text-blaze">Blaze Digital Hub</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-pretty text-muted-foreground">
              Blaze Digital Hub is run by <strong className="text-foreground">Coach Ernest Favour</strong>,
              known online as <strong className="text-foreground">Ernie Blaze</strong> — a trader,
              educator and digital creator on a mission to help Nigerian students, traders and
              creators turn their hustle into real income.
            </p>
          </div>

          <div className="prose-invert mx-auto mt-12 max-w-2xl space-y-5 text-pretty text-muted-foreground">
            <p>
              It started the way most Nigerian success stories start: with school fees to pay,
              data to buy, and no rich uncle. Coach Ernest learned forex trading the hard way —
              blown accounts, fake mentors, all of it — until he built a system that actually
              worked. Then friends started asking. Then friends of friends.
            </p>
            <p>
              The lesson was simple: <strong className="text-foreground">packaged knowledge is the
              most powerful product in Nigeria today.</strong> A student with the right JAMB system
              scores 300+. A vendor with the right templates looks like a premium brand. A
              hustler with the right playbook makes their first ₦100k from a hostel room.
            </p>
            <p>
              So Blaze Digital Hub was born — one place for battle-tested digital products:
              trading blueprints, exam success packs, design bundles and hustle tools. Every
              single one delivered instantly to your email, secured by Paystack.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <span className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/15">
                    <Icon className="size-5 text-primary" />
                  </span>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-2 text-sm text-pretty text-muted-foreground">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-primary/20 bg-gradient-to-br from-orange-600/10 via-transparent to-transparent p-8 text-center sm:p-10">
            <h2 className="text-2xl font-bold">
              {products.length} products. One goal: your income.
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Pick your lane — trading, exams, design or hustle — and start today.
            </p>
            <Button asChild size="lg" className="mt-6 font-semibold shadow-lg shadow-orange-500/25">
              <Link href="/#shop">
                Browse the shop <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
