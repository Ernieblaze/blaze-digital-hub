import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";

export type LegalSection = { heading: string; body: string[] };

/** Shared shell for Terms / Privacy / Refund Policy pages. */
export function LegalPage({
  title,
  intro,
  sections,
  updated,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
  updated: string;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>
          <p className="mt-6 text-pretty text-muted-foreground">{intro}</p>

          <div className="mt-10 space-y-8">
            {sections.map(({ heading, body }) => (
              <section key={heading}>
                <h2 className="text-lg font-semibold">{heading}</h2>
                {body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
