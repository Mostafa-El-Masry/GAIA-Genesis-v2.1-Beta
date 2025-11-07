"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/apollo/ask", label: "Ask" },
  { href: "/apollo/archives", label: "Archives" },
  { href: "/apollo/tower", label: "Tower" },
  { href: "/apollo/academy", label: "Academy" },
];

export default function TabNav() {
  const pathname = usePathname();
  return (
    <div className="w-full border-b border-base-300">
      <nav className="mx-auto max-w-6xl flex gap-2 p-2">
        {tabs.map((t) => {
          const active = pathname?.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={clsx(
                "px-3 py-2 rounded-md text-sm font-medium transition",
                active
                  ? "bg-base-200 text-base-content"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200"
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
