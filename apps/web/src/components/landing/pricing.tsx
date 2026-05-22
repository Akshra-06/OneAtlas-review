"use client";
import { useState } from "react";

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export function Pricing() {
  const [billing, setBilling] = useState<"Individual" | "Enterprise">("Individual");

  return (
    <section className="section">
      <div className="container-x">
        <div className="pricing-cta">
          <div className="left">
            <h2>Pricing plans for every need</h2>
            <p>Scale as you go with plans designed to match your growth.</p>
          </div>
          <div>
            <div className="pcta-label">START FOR FREE</div>
            <ul className="pcta-list">
              <li><svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>All core features</li>
              <li><svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>Built-in integrations</li>
              <li><svg className="ck" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>Authentication system</li>
            </ul>
            <a className="start-btn" href="#">Start building</a>
          </div>
          <div className="pcta-right">
            <div className="pcta-label">PAID PLANS FROM</div>
            <div className="price">$23<small>/mo</small></div>
            <div className="desc">More credits, more features, more support.</div>
            <a className="see-all" href="#">See all plans</a>
          </div>
        </div>

        <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 15, marginBottom: 36 }}>
          Looking for enterprise solutions?{" "}
          <a href="#" style={{ color: "var(--indigo)", fontWeight: 600 }}>Contact sales →</a>
        </div>

        <div className="pricing-toggle">
          {(["Individual", "Enterprise"] as const).map((b) => (
            <button
              key={b}
              className={billing === b ? "active" : ""}
              onClick={() => setBilling(b)}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="plans">
          <div className="plan">
            <div className="plan-name"><h3>🎁 Free</h3></div>
            <p className="tagline">Get started with essential features at no cost.</p>
            <div className="price">$0<small>/month</small></div>
            <div style={{ marginTop: 6, height: 18 }} />
            <a className="plan-btn dark" href="#">Start for free</a>
            <ul className="plan-feats">
              <li><CheckSvg />3 apps included</li>
              <li><CheckSvg />Core platform features</li>
              <li><CheckSvg />All latest AI models</li>
              <li><CheckSvg />Community support</li>
            </ul>
          </div>

          <div className="plan">
            <div className="plan-name">
              <h3>⚡ Standard</h3>
              <span className="ribbon">1 month offer</span>
            </div>
            <p className="tagline">Perfect for first-time builders and small teams.</p>
            <div className="price">$23<small>/month</small></div>
            <div className="old">$29/mo <span>Annual</span></div>
            <a className="plan-btn dark" href="#">Start free trial</a>
            <ul className="plan-feats">
              <li><CheckSvg />Unlimited apps</li>
              <li><CheckSvg />Build web &amp; mobile apps</li>
              <li><CheckSvg />Private project hosting</li>
              <li><CheckSvg />GitHub integration</li>
              <li><CheckSvg />Priority support</li>
            </ul>
          </div>

          <div className="plan featured">
            <div className="plan-name">
              <h3>✦ Pro</h3>
              <span className="ribbon pop">Popular</span>
            </div>
            <p className="tagline">Built for serious creators and growing teams.</p>
            <div className="price">$63<small>/month</small></div>
            <div className="old">$79/mo <span>Annual</span></div>
            <a className="plan-btn grad" href="#">Start free trial</a>
            <ul className="plan-feats">
              <li><CheckSvg />Everything in Standard</li>
              <li><CheckSvg />1M context window</li>
              <li><CheckSvg />Ultra-fast AI thinking</li>
              <li><CheckSvg />System Prompt Editor</li>
              <li><CheckSvg />Custom AI agents</li>
              <li><CheckSvg />High-performance compute</li>
              <li><CheckSvg />Priority customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
