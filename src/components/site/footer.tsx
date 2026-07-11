import Link from "next/link";
import { Flame, Mail, MessageCircle } from "lucide-react";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { siteSettings, whatsappLink } from "@/lib/site-settings";

/* Brand icons were removed from lucide-react, so these are inline SVGs. */
type IconProps = React.SVGProps<SVGSVGElement>;

const InstagramIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const XIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

const shopLinks = [
  { href: "/#shop", label: "All Products" },
  { href: "/products/blaze-forex-mastery-blueprint", label: "Forex Blueprint" },
  { href: "/products/jamb-350-success-pack", label: "JAMB Success Pack" },
  { href: "/products/campus-hustle-playbook", label: "Hustle Playbook" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "My Downloads" },
];

const legalLinks = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
];

/* Managed from /admin/settings — icons with an empty link are hidden. */
const socials = [
  { href: siteSettings.instagram, icon: InstagramIcon, label: "Instagram" },
  { href: siteSettings.facebook, icon: FacebookIcon, label: "Facebook" },
  { href: siteSettings.twitter, icon: XIcon, label: "X (Twitter)" },
  { href: siteSettings.youtube, icon: YoutubeIcon, label: "YouTube" },
  { href: whatsappLink(), icon: MessageCircle, label: "WhatsApp" },
].filter((s) => s.href);

export function Footer() {
  return (
    <footer id="contact" className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600">
                <Flame className="size-4.5 text-white" strokeWidth={2.25} />
              </span>
              <span className="text-lg font-bold">
                Blaze <span className="text-primary">Digital Hub</span>
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-pretty text-muted-foreground">
              Premium digital products by Ernie Blaze (Coach Ernest Favour) — helping Nigerian
              students, traders and creators turn skills into income.
            </p>
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold tracking-wide uppercase">
                Get free hustle tips + product drops
              </h3>
              <NewsletterForm />
            </div>
            <div className="mt-5 flex gap-2">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <nav aria-label="Shop">
            <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase">Shop</h3>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company">
            <h3 className="mb-4 text-sm font-semibold tracking-wide uppercase">Company</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  <Mail className="size-3.5" /> {siteSettings.contactEmail}
                </a>
              </li>
            </ul>
            <h3 className="mt-6 mb-4 text-sm font-semibold tracking-wide uppercase">Legal</h3>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Blaze Digital Hub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Payments secured by <span className="font-semibold text-foreground">Paystack</span> 🇳🇬
          </p>
        </div>
      </div>
    </footer>
  );
}
