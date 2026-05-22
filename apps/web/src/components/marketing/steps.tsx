import { StepsCanvas } from "./steps-canvas";

export function Steps() {
  return (
    <section
      className="section"
      style={{ position: "relative", overflow: "hidden", background: "#FAFBFF" }}
    >
      <StepsCanvas />
      <div className="container-x" style={{ position: "relative", zIndex: 1 }}>
        <div className="steps-head">
          <span className="eyebrow">Meet OneAtlas</span>
          <h2
            className="section-title"
            style={{ whiteSpace: "nowrap", fontSize: "clamp(22px,3.2vw,52px)" }}
          >
            From idea to live app in <span className="grad">4 steps</span>
          </h2>
        </div>

        <div className="steps-grid">
          {/* Step 01 */}
          <div className="step-item s1">
            <div className="step-eyebrow">
              <span className="step-counter s1-counter">01 / 04</span>
              <span className="step-ico s1-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
                </svg>
              </span>
            </div>
            <h3 className="step-title">From idea to working software</h3>
            <p className="step-desc">
              Tell OneAtlas what you want to build, and watch it generate a real product foundation — interfaces, workflows, data models, and app logic included from the very first prompt.
            </p>
            <div className="step-preview sp1">
              <div className="sp-input">
                Create a customer feedback tool with AI-powered analysis and tagging.
              </div>
              <div className="sp-footer">
                <div className="sp-chips">
                  <span className="sp-chip">Attach</span>
                  <span className="sp-chip">Public</span>
                </div>
                <span className="sp-send">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Step 02 */}
          <div className="step-item s2">
            <div className="step-eyebrow">
              <span className="step-counter s2-counter">02 / 04</span>
              <span className="step-ico s2-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </span>
            </div>
            <h3 className="step-title">Your backend, already in motion</h3>
            <p className="step-desc">
              Authentication, databases, APIs, permissions, storage, and operational logic are automatically structured behind the scenes, so your app behaves like production software from day one.
            </p>
            <div className="step-preview sp2">
              <div className="sp2-bars">
                <div className="sp2-bar-row">
                  <span className="sp2-label">Schema</span>
                  <div className="sp2-track">
                    <div className="sp2-fill" style={{ width: "100%", background: "#635BFF" }} />
                  </div>
                  <span className="sp2-tick">✓</span>
                </div>
                <div className="sp2-bar-row">
                  <span className="sp2-label">Backend</span>
                  <div className="sp2-track">
                    <div className="sp2-fill" style={{ width: "85%", background: "#9B6CFB" }} />
                  </div>
                  <span className="sp2-tick">✓</span>
                </div>
                <div className="sp2-bar-row">
                  <span className="sp2-label">UI</span>
                  <div className="sp2-track">
                    <div className="sp2-fill" style={{ width: "70%", background: "#FF5996" }} />
                  </div>
                  <span className="sp2-tick sp2-tick-spin">↻</span>
                </div>
              </div>
              <div className="sp2-status">
                Building your app
                <span className="sp2-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </div>
            </div>
          </div>

          {/* Step 03 */}
          <div className="step-item s3">
            <div className="step-eyebrow">
              <span className="step-counter s3-counter">03 / 04</span>
              <span className="step-ico s3-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                </svg>
              </span>
            </div>
            <h3 className="step-title">Built to go live fast</h3>
            <p className="step-desc">
              OneAtlas comes with hosting, deployment, analytics, custom domains, environments, and scaling built in — eliminating the setup work between building and launching.
            </p>
            <div className="step-preview sp3">
              <div className="sp3-pub">
                <span className="sp3-dot" />
                <div>
                  <div className="sp3-status">Published</div>
                  <div className="sp3-url">myapp.oneatlas.app</div>
                </div>
              </div>
              <div className="sp3-btn">🚀 Go live now</div>
            </div>
          </div>

          {/* Step 04 */}
          <div className="step-item s4">
            <div className="step-eyebrow">
              <span className="step-counter s4-counter">04 / 04</span>
              <span className="step-ico s4-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </span>
            </div>
            <h3 className="step-title">AI-native by default</h3>
            <p className="step-desc">
              Use the latest AI models, agents, and workflows inside your product without managing providers or integrations. OneAtlas intelligently routes tasks to the right models so your team can focus on building, not configuring.
            </p>
            <div className="step-preview">
              <div className="sp4-avatars">
                <div className="sp4-av" style={{ background: "#635BFF" }}>A</div>
                <div className="sp4-av" style={{ background: "#FF5996" }}>B</div>
                <div className="sp4-av" style={{ background: "#00D4B1" }}>C</div>
                <div className="sp4-av" style={{ background: "#F8BC42" }}>D</div>
                <div className="sp4-plus">+3</div>
              </div>
              <div className="sp4-label">7 teammates active right now</div>
              <div className="sp4-invite">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Enter email to invite…
                <span className="sp4-invite-btn">Invite</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
