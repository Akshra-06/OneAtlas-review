import { Logo } from "./logo";

const COLS = [
  { h: "Product", links: ["Features", "Integrations", "Pricing", "Changelog", "Roadmap"] },
  { h: "Solutions", links: ["Operations teams", "Sales teams", "HR & People", "Finance", "Engineering"] },
  { h: "Developers", links: ["Documentation", "API Reference", "GitHub", "Status", "Security"] },
  { h: "Company", links: ["About", "Blog", "Careers", "Press", "Legal"] },
  { h: "Resources", links: ["Templates", "Tutorials", "Community", "Stories", "Support"] },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="foot-grid">
        <div className="foot-brand">
          <Logo />
          <p>Build, deploy, and manage internal tools in minutes with AI. No code required.</p>
        </div>
        {COLS.map((col) => (
          <div className="foot-col" key={col.h}>
            <h4>{col.h}</h4>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="foot-bottom">
        <span>© 2026 OneAtlas, Inc. All rights reserved.</span>
        <div className="foot-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
}
