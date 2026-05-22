const DbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export function Integrations() {
  return (
    <section className="section integrations">
      <div className="container-x">
        <div className="int-head">
          <span className="eyebrow">Integrations</span>
          <h2 className="section-title">
            Plug in your <span className="grad">existing stack</span>
          </h2>
          <p className="section-sub">
            OneAtlas reads your data sources and builds around them — no
            migration, no rewrites, no disruption to what&apos;s already working.
          </p>
        </div>

        <div className="int-grid">
          <div className="int-card">
            <span className="int-tag popular">MOST POPULAR</span>
            <div className="int-ico indigo"><DbIcon /></div>
            <h3>PostgreSQL</h3>
            <div className="cat">DATABASE</div>
            <p>Connect your existing Postgres instance. OneAtlas reads the schema and builds forms, tables, and filters automatically.</p>
          </div>

          <div className="int-card">
            <div className="int-ico indigo"><DbIcon /></div>
            <h3>MySQL</h3>
            <div className="cat">DATABASE</div>
            <p>Link your MySQL database — read or write access, with row-level security applied out of the box.</p>
          </div>

          <div className="int-card highlight">
            <span className="int-tag new">NEW</span>
            <div className="int-ico mint"><DbIcon /></div>
            <h3 style={{ color: "var(--indigo)" }}>Supabase</h3>
            <div className="cat">DATABASE + AUTH</div>
            <p>Plug in your Supabase project and bring your tables, auth, and storage — all pre-wired.</p>
            <a href="#" className="int-connect">Connect →</a>
          </div>

          <div className="int-card">
            <div className="int-ico violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </div>
            <h3>Airtable</h3>
            <div className="cat">SPREADSHEET DB</div>
            <p>Turn any Airtable base into a production UI. Views, formulas, and linked records all come through.</p>
          </div>

          <div className="int-card">
            <div className="int-ico mint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
              </svg>
            </div>
            <h3>Google Sheets</h3>
            <div className="cat">SPREADSHEET</div>
            <p>Use a live Sheets document as a data source. Your team keeps editing; the app stays in sync.</p>
          </div>

          <div className="int-card">
            <div className="int-ico indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3>REST API</h3>
            <div className="cat">ANY HTTP API</div>
            <p>Point OneAtlas at any REST endpoint. Define the shape and it generates a full UI around the response.</p>
          </div>

          <div className="int-card">
            <div className="int-ico peach">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h3>Webhooks</h3>
            <div className="cat">EVENT TRIGGERS</div>
            <p>Fire events when records change, forms are submitted, or approvals are completed. Connect anything downstream.</p>
          </div>

          <div className="int-card">
            <div className="int-ico coral">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="6" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="12" cy="18" r="3" />
                <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
                <line x1="12" y1="12" x2="12" y2="15" />
              </svg>
            </div>
            <h3>GraphQL</h3>
            <div className="cat">API</div>
            <p>Connect to any GraphQL endpoint. OneAtlas resolves queries and mutations and maps them to your UI automatically.</p>
          </div>
        </div>

        <div className="int-footer">
          <div className="also">
            Also connects to <b>Stripe, Slack, Firebase, Notion, Zapier</b> and many more
          </div>
          <a href="#" className="browse-link">View all integrations →</a>
        </div>
      </div>
    </section>
  );
}
