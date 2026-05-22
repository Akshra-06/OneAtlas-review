const Check = () => (
  <span className="check">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  </span>
);

const X = () => (
  <span className="xmark">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  </span>
);

const ROWS = [
  ["Ease of Use", "No technical background needed", "Headache for non-coders"],
  ["What You Can Build", "Full production-grade apps", "Basic apps only"],
  ["All-in-one Platform", "Everything built-in", "Requires external services"],
  ["AI Models", "All latest models, auto-selected", "Limited or locked models"],
  ["Custom Domain", "Included on every plan", "Paid add-on or unavailable"],
  ["Human Support", "Live chat & priority support", "Little to no support"],
  ["Error Handling", "Smart & automatic correction", "Gets stuck often"],
  ["Hosting & Scale", "Scales with you, built-in", "Limited or self-managed"],
];

export function Compare() {
  return (
    <section className="section compare">
      <div className="container-x">
        <div className="compare-head">
          <span className="eyebrow">Why OneAtlas?</span>
          <h2 className="section-title">How we stack up</h2>
          <p className="section-sub">
            See how OneAtlas compares to other app builders across the features
            that matter most.
          </p>
        </div>

        <div className="cmp-table">
          <div className="cmp-row head">
            <div className="cmp-cell">FEATURE</div>
            <div className="cmp-cell us">
              <span className="us-logo">OA</span>OneAtlas
            </div>
            <div className="cmp-cell them">Others</div>
          </div>
          {ROWS.map(([feature, us, them]) => (
            <div className="cmp-row" key={feature}>
              <div className="cmp-cell feature-name">{feature}</div>
              <div className="cmp-cell">
                <Check />
                {us}
              </div>
              <div className="cmp-cell them">
                <X />
                {them}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
