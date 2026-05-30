"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./logo";
import { ProductMegaMenu } from "./product-mega-menu";
import { UseCasesMegaMenu } from "./use-cases-mega-menu";
import { TemplatesMegaMenu } from "./templates-mega-menu";
import { ResourcesMegaMenu } from "./resources-mega-menu";

/* ── mobile accordion items ── */
const MOBILE_DROPDOWNS = {
  product: [
    { label: "Features", href: "#" },
    { label: "Integrations", href: "#" },
    { label: "Changelog", href: "#" },
    { label: "Roadmap", href: "#" },
  ],
  usecases: [
    { label: "Startups", href: "#" },
    { label: "Enterprise", href: "#" },
    { label: "Agencies", href: "#" },
    { label: "Freelancers", href: "#" },
  ],
  templates: [
    { label: "CRM", href: "#" },
    { label: "Dashboard", href: "#" },
    { label: "E-commerce", href: "#" },
    { label: "SaaS Starter", href: "#" },
  ],
  resources: [
    { label: "Docs", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "Guides", href: "#" },
    { label: "Blog", href: "#" },
  ],
};

type MegaKey = "product" | "usecases" | "templates" | "resources";
type MobileKey = MegaKey | null;

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState<MegaKey | null>(null);
  const [openMobile, setOpenMobile] = useState<MobileKey>(null);

  const megaRef = useRef<HTMLDivElement>(null);
  const useCasesRef = useRef<HTMLDivElement>(null);
  const templatesRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        megaRef.current && !megaRef.current.contains(e.target as Node) &&
        useCasesRef.current && !useCasesRef.current.contains(e.target as Node) &&
        templatesRef.current && !templatesRef.current.contains(e.target as Node) &&
        resourcesRef.current && !resourcesRef.current.contains(e.target as Node)
      ) {
        setOpenMega(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* close mobile menu on resize to desktop */
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
        setOpenMobile(null);
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const chevron = (isOpen: boolean) => (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ width: 11, height: 11, transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.6 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  function toggleMobile(key: MegaKey) {
    setOpenMobile((prev) => (prev === key ? null : key));
  }

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Logo />
          </Link>

          {/* ── DESKTOP LINKS ── */}
          <div className="nav-links">

            {/* Product */}
            <div ref={megaRef} style={{ position: "relative" }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setOpenMega(openMega === "product" ? null : "product"); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                Product {chevron(openMega === "product")}
              </a>
              <AnimatePresence>
                {openMega === "product" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.18 }}
                    style={{ position: "fixed", top: 72, left: 300, zIndex: 100 }}>
                    <ProductMegaMenu />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Use Cases */}
            <div ref={useCasesRef} style={{ position: "relative" }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setOpenMega(openMega === "usecases" ? null : "usecases"); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                Use Cases {chevron(openMega === "usecases")}
              </a>
              <AnimatePresence>
                {openMega === "usecases" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.18 }}
                    style={{ position: "fixed", top: 72, left: 300, zIndex: 100 }}>
                    <UseCasesMegaMenu />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Templates */}
            <div ref={templatesRef} style={{ position: "relative" }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setOpenMega(openMega === "templates" ? null : "templates"); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                Templates {chevron(openMega === "templates")}
              </a>
              <AnimatePresence>
                {openMega === "templates" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.18 }}
                    style={{ position: "fixed", top: 72, left: 300, zIndex: 100 }}>
                    <TemplatesMegaMenu />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Resources */}
            <div ref={resourcesRef} style={{ position: "relative" }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setOpenMega(openMega === "resources" ? null : "resources"); }}
                style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
                Resources {chevron(openMega === "resources")}
              </a>
              <AnimatePresence>
                {openMega === "resources" && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.18 }}
                    style={{ position: "fixed", top: 72, left: 300, zIndex: 100 }}>
                    <ResourcesMegaMenu />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#">Enterprise</a>
            <Link href="/security">Security</Link>
            <Link href="/pricing">Pricing</Link>
          </div>

          {/* ── DESKTOP CTA ── */}
          <div className="nav-right nav-right-desktop">
            <Link className="cta-primary" href="/signup">Start Building</Link>
          </div>

          {/* ── HAMBURGER ── */}
          <button className="nav-hamburger" onClick={() => { setMenuOpen((o) => !o); setOpenMobile(null); }} aria-label="Toggle menu">
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* ── MOBILE MENU ── */}
        {menuOpen && (
          <div className="nav-mobile-menu">
            <div className="nav-mobile-links">

              {/* Product accordion */}
              <div>
                <button
                  onClick={() => toggleMobile("product")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", padding: "12px 0", fontSize: 15, fontWeight: 600, color: "#111", cursor: "pointer" }}
                >
                  Product {chevron(openMobile === "product")}
                </button>
                <AnimatePresence>
                  {openMobile === "product" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                      <div style={{ paddingLeft: 16, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        {MOBILE_DROPDOWNS.product.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                            style={{ fontSize: 14, color: "#6B7280", padding: "8px 0", textDecoration: "none", display: "block" }}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Use Cases accordion */}
              <div>
                <button
                  onClick={() => toggleMobile("usecases")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", padding: "12px 0", fontSize: 15, fontWeight: 600, color: "#111", cursor: "pointer" }}
                >
                  Use Cases {chevron(openMobile === "usecases")}
                </button>
                <AnimatePresence>
                  {openMobile === "usecases" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                      <div style={{ paddingLeft: 16, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        {MOBILE_DROPDOWNS.usecases.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                            style={{ fontSize: 14, color: "#6B7280", padding: "8px 0", textDecoration: "none", display: "block" }}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Templates accordion */}
              <div>
                <button
                  onClick={() => toggleMobile("templates")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", padding: "12px 0", fontSize: 15, fontWeight: 600, color: "#111", cursor: "pointer" }}
                >
                  Templates {chevron(openMobile === "templates")}
                </button>
                <AnimatePresence>
                  {openMobile === "templates" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                      <div style={{ paddingLeft: 16, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        {MOBILE_DROPDOWNS.templates.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                            style={{ fontSize: 14, color: "#6B7280", padding: "8px 0", textDecoration: "none", display: "block" }}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Resources accordion */}
              <div>
                <button
                  onClick={() => toggleMobile("resources")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", padding: "12px 0", fontSize: 15, fontWeight: 600, color: "#111", cursor: "pointer" }}
                >
                  Resources {chevron(openMobile === "resources")}
                </button>
                <AnimatePresence>
                  {openMobile === "resources" && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                      <div style={{ paddingLeft: 16, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        {MOBILE_DROPDOWNS.resources.map((item) => (
                          <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)}
                            style={{ fontSize: 14, color: "#6B7280", padding: "8px 0", textDecoration: "none", display: "block" }}>
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Direct links */}
              <a href="#" style={{ display: "block", padding: "12px 0", fontSize: 15, fontWeight: 600, color: "#111", textDecoration: "none" }}
                onClick={() => setMenuOpen(false)}>Enterprise</a>
              <Link href="/security" style={{ display: "block", padding: "12px 0", fontSize: 15, fontWeight: 600, color: "#111", textDecoration: "none" }}
                onClick={() => setMenuOpen(false)}>Security</Link>
              <Link href="/pricing" style={{ display: "block", padding: "12px 0", fontSize: 15, fontWeight: 600, color: "#111", textDecoration: "none" }}
                onClick={() => setMenuOpen(false)}>Pricing</Link>

            </div>

            <div className="nav-mobile-ctas">
              <Link href="/signup" className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>Start Building</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}