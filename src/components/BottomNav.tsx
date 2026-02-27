"use client";

import { Film, Tv, BookOpen, Clapperboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", icon: Clapperboard, label: "Home" },
    { href: "/?category=movie", icon: Film, label: "Movies" },
    { href: "/?category=show", icon: Tv, label: "Shows" },
    { href: "/?category=anime", icon: BookOpen, label: "Anime" },
    { href: "/profile", icon: BookOpen, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-secondary/95 border-t border-border backdrop-blur-lg z-40 sm:hidden">
      <div className="flex justify-around py-2">
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/" && !link.href.includes("category")
              : pathname === link.href || (pathname === "/" && link.href.includes("category"));
          return (
            <Link
              key={link.label}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? "text-accent" : "text-text-muted"
              }`}
            >
              <link.icon size={20} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
