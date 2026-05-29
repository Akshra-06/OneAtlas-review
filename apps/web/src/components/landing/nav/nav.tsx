"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "./logo";
import { ProductMegaMenu } from "./product-mega-menu";
import { UseCasesMegaMenu } from "./use-cases-mega-menu";
import { TemplatesMegaMenu } from "./templates-mega-menu";
import { ResourcesMegaMenu } from "./resources-mega-menu";


export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMega, setOpenMega] = useState<"product" | "usecases" | "templates" | "resources" | null>(null);
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

  const chevron = (isOpen: boolean) => (
    <svg className="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ transition: "transform .2s", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Logo />
          </Link>

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
                    style={{ position:"fixed", top: 72, left: 300, zIndex: 100 }}>
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
            <a href="#">Security</a>
            <Link href="/pricing">Pricing</Link>

          </div>

          <div className="nav-right nav-right-desktop">
            <Link className="cta-primary" href="/signup">Start Building</Link>
          </div>

          <button className="nav-hamburger" onClick={() => setMenuOpen((o) => !o)} aria-label="Toggle menu">
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

        {menuOpen && (
          <div className="nav-mobile-menu">
            <div className="nav-mobile-links">
              <a href="#" onClick={() => setMenuOpen(false)}>Product</a>
              <a href="#" onClick={() => setMenuOpen(false)}>Use Cases</a>
              <a href="#" onClick={() => setMenuOpen(false)}>Templates</a>
              <a href="#" onClick={() => setMenuOpen(false)}>Enterprise</a>
              <a href="#" onClick={() => setMenuOpen(false)}>Security</a>
              <a href="#" onClick={() => setMenuOpen(false)}>Pricing</a>
              <a href="#" onClick={() => setMenuOpen(false)}>Resources</a>
            </div>
            <div className="nav-mobile-ctas">
              <Link href="/signup" className="nav-mobile-signin" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link href="/signup" className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>Start Building</Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}