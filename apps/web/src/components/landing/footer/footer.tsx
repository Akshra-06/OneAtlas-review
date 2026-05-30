import Link from "next/link";
import { Logo } from "../nav/logo";

const COLS = [
  {
    h: "Product",
    links: [
      { label: "Features",     href: "/#features" },
      { label: "Integrations", href: "/#integrations" },
      { label: "Pricing",      href: "/pricing" },
      { label: "Changelog",    href: "/changelog" },
      { label: "Roadmap",      href: "/roadmap" },
    ],
  },
  {
    h: "Solutions",
    links: [
      { label: "Operations teams", href: "/solutions/operations" },
      { label: "Sales teams",      href: "/solutions/sales" },
      { label: "HR & People",      href: "/solutions/hr" },
      { label: "Finance",          href: "/solutions/finance" },
      { label: "Engineering",      href: "/solutions/engineering" },
    ],
  },
  {
    h: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api-reference" },
      { label: "GitHub",        href: "https://github.com/oneatlas" },
      { label: "Status",        href: "/status" },
      { label: "Security",      href: "/security" },
    ],
  },
  {
    h: "Company",
    links: [
      { label: "About",    href: "/about" },
      { label: "Blog",     href: "/blog" },
      { label: "Careers",  href: "/careers" },
      { label: "Press",    href: "/press" },
      { label: "Legal",    href: "/legal" },
    ],
  },
  {
    h: "Resources",
    links: [
      { label: "Templates",  href: "/templates" },
      { label: "Tutorials",  href: "/tutorials" },
      { label: "Community",  href: "/community" },
      { label: "Stories",    href: "/stories" },
      { label: "Support",    href: "/support" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="foot-grid">
        <div className="foot-brand">
          <div style={{ color: "#ffffff" }}>
            <Logo />
          </div>
          <p>Build, deploy, and manage internal tools in minutes with AI. No code required.</p>
        </div>
        {COLS.map((col) => (
          <div className="foot-col" key={col.h}>
            <h4>{col.h}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("http") ? (
                    <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
                  ) : (
                    <Link href={l.href}>{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="foot-bottom">
        <span>© 2026 OneAtlas, Inc. All rights reserved.</span>
        <div className="foot-bottom-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <a href="#">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
}