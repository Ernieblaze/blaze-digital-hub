"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Flame, Menu, Moon, ShoppingBag, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/#shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/#contact", label: "Contact" },
];

/** True after hydration — safe way to branch on client-only state like theme. */
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Render both icons until mounted to avoid a hydration mismatch */}
      {mounted && resolvedTheme === "light" ? (
        <Moon className="size-4.5" />
      ) : (
        <Sun className="size-4.5" />
      )}
    </Button>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2" aria-label="Blaze Digital Hub — home">
          <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25 transition-transform group-hover:scale-105">
            <Flame className="size-4.5 text-white" strokeWidth={2.25} />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Blaze <span className="text-primary">Digital Hub</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {/* Cart placeholder — wire to a cart state / Paystack later */}
          <Button variant="ghost" size="icon" aria-label="Cart" asChild>
            <Link href="/#shop">
              <ShoppingBag className="size-4.5" />
            </Link>
          </Button>
          <Button asChild size="sm" className="ml-1 hidden font-semibold sm:inline-flex">
            <Link href="/#shop">Shop Now</Link>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Flame className="size-5 text-primary" /> Blaze Digital Hub
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium transition-colors hover:bg-accent"
                  >
                    {link.label}
                  </Link>
                ))}
                <Button asChild className="mt-4 font-semibold" onClick={() => setOpen(false)}>
                  <Link href="/#shop">Shop Now</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
