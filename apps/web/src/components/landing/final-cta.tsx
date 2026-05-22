export function FinalCta() {
  return (
    <div className="final-cta">
      <div className="final-cta-inner">
        <h2>So, what are we building?</h2>
        <p>Your first internal tool is free. No credit card needed.</p>
        <a className="final-btn" href="#">
          Get started{" "}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </div>
  );
}
