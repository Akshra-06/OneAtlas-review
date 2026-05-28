"use client";
import { useEffect, useRef, useState } from "react";

/**
 * RolesBento
 * ---------------------------------------------------------------
 * 6-card bento for the "OneAtlas turns ideas into working software"
 * section. Each card pairs a role with a hand-tuned illustration:
 *
 *   Row 1 (2fr · 1fr · 1fr)
 *     • Startup teams                — workflow dashboard
 *     • Product & innovation teams   — MRR card
 *     • Marketing & growth teams     — conversions KPI
 *
 *   Row 2 (1fr · 1fr · 1fr)
 *     • Agencies & service businesses — project list
 *     • Operations & business teams   — code editor
 *     • Independent builders          — infra stack
 *
 * Self-contained: drop in anywhere, no external CSS required.
 * Tailwind not used — vanilla CSS scoped via the `.bb-section` class.
 * ---------------------------------------------------------------
 */

import React from "react";

/* ============================================================ */
/*  STYLES                                                       */
/* ============================================================ */

const css = `
.bb-section {
  padding: 40px 0 64px;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  position: relative;
}
.bb-section::before { display: none; }
.bb-section > .bb-container { position: relative; z-index: 1; width: min(1240px, 92vw); margin: 0 auto; }

.bb-head { text-align: center; margin: 0 auto 48px; }
.bb-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 7px 14px 7px 12px; border-radius: 999px;
  background: white;
  border: 1px solid #E5E7EB;
  font-family: "Inter", sans-serif;
  font-size: 13px; color: #FF6600; font-weight: 500;
  margin-bottom: 18px;
}
.bb-eyebrow .bb-pulse {
  width: 14px; height: 14px; border-radius: 50%;
  background: #FF6600;
  position: relative;
}
.bb-eyebrow .bb-pulse::before {
  content: ""; position: absolute; inset: 0; border-radius: 50%;
  background: inherit; animation: bbPulseRing 2.4s ease-out infinite;
}
@keyframes bbPulseRing {
  0%   { transform: scale(1);   opacity: .6; }
  100% { transform: scale(2.2); opacity: 0; }
}
.bb-head h2 {
  font-family: "Inter", sans-serif;
  font-weight: 800;
  font-size: clamp(32px, 4vw, 44px);
  line-height: 1.05;
  letter-spacing: -0.035em;
  margin: 0 0 16px;
  color: #111111;
  white-space: nowrap;
}
@media (max-width: 760px) {
  .bb-head h2 { white-space: normal; font-size: clamp(28px, 7vw, 40px); }
}
.bb-head h2 .bb-grad {
  color: #FF6600;
}
.bb-head .bb-sub {
  max-width: none;
  margin: 0 auto 22px;
  font-size: clamp(12px, 1.15vw, 15px);
  font-weight: 400;
  color: #6B7A90;
  line-height: 1.55;
  white-space: nowrap;
}
@media (max-width: 980px) {
  .bb-head .bb-sub { white-space: normal; max-width: 640px; font-size: 15px; }
}
.bb-divider {
  width: 96px; height: 3px; margin: 0 auto;
  border-radius: 999px;
  background: #FF6600;
  opacity: .9;
}

.bb-row { display: grid; gap: 22px; }
.bb-row-1 { grid-template-columns: 2fr 1fr 1fr; }
.bb-row-2 { grid-template-columns: 1fr 1fr 1fr; margin-top: 22px; }
@media (max-width: 980px) {
  .bb-row-1, .bb-row-2 { grid-template-columns: 1fr; }
}

.bb-card {
  position: relative;
  border-radius: 28px;
  padding: 36px;
  overflow: hidden;
  border: 1px solid rgba(10, 37, 64, .05);
  min-height: 340px;
  display: flex; flex-direction: column;
  font-family: "Inter", sans-serif;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, .9) inset,
    0 1px 2px rgba(10, 37, 64, .04),
    0 16px 36px -22px rgba(10, 37, 64, .12);
  transition: transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .45s cubic-bezier(.2,.7,.2,1);
  isolation: isolate;
}
.bb-card::before {
  content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.9), transparent);
  z-index: 3; pointer-events: none;
}
.bb-card::after {
  content: ""; position: absolute; inset: -20%; z-index: 0;
  background: radial-gradient(360px 240px at 78% 14%, var(--bb-glow, rgba(99,91,255,.10)), transparent 60%);
  pointer-events: none;
  opacity: .9;
  transition: opacity .4s ease;
}
.bb-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, .9) inset,
    0 1px 2px rgba(10, 37, 64, .04),
    0 28px 56px -22px rgba(10, 37, 64, .22);
}
.bb-card:hover::after { opacity: 1.15; }
.bb-card > * { position: relative; z-index: 1; }

.bb-icon {
  width: 52px; height: 52px; border-radius: 13px;
  display: grid; place-items: center;
  margin-bottom: 24px;
  flex-shrink: 0;
  position: relative;
}
.bb-icon::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  background: linear-gradient(180deg, rgba(255,255,255,.4), transparent 50%);
  pointer-events: none;
}
.bb-card h3 {
  font-family: "Inter", sans-serif;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: -0.022em;
  line-height: 1.15;
  color: #0A2540;
  margin: 0;
  position: relative;
}
.bb-card h3::after {
  content: ""; display: block;
  width: 32px; height: 2.5px; border-radius: 2px;
  margin-top: 14px;
  background: var(--bb-accent, #635BFF);
  opacity: .85;
}
.bb-card .bb-body {
  font-family: "Inter", sans-serif;
  color: #425466;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: -0.003em;
  margin: 14px 0 0;
  max-width: 28ch;
}
.bb-arrow {
  margin-top: auto;
  padding-top: 24px;
  color: #FF6600;
  display: inline-flex; align-items: center;
  width: 26px; height: 26px;
  transition: transform .35s cubic-bezier(.2,.7,.2,1);
}
.bb-card:hover .bb-arrow { transform: translateX(4px); }

.bb-explore {
  margin-top: 32px; align-self: flex-start;
  background: #FF6600;
  color: #fff;
  font-family: "Inter", sans-serif;
  font-weight: 600; font-size: 14.5px;
  letter-spacing: -0.005em;
  padding: 12px 28px;
  border: 0; border-radius: 11px;
  cursor: pointer;
  transition: background .2s ease, transform .2s ease;
}
.bb-explore:hover {
  background: #E65C00;
  transform: translateY(-1px);
}

/* card variants */
.bb-pm {
  background: linear-gradient(135deg, #EAE7FF 0%, #F1EEFF 45%, #FAFAFE 100%);
  --bb-accent: #635BFF; --bb-glow: rgba(99,91,255,.12);
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 16px; padding: 40px; min-height: 360px;
}
.bb-pm .bb-text { display: flex; flex-direction: column; min-width: 0; }
.bb-pm .bb-illus { position: relative; min-height: 280px; }

.bb-ent {
  background: linear-gradient(135deg, #FFE3EE 0%, #FFEDE3 60%, #FFF7F1 100%);
  --bb-accent: #FF5996; --bb-glow: rgba(255,89,150,.10);
}
.bb-mkt {
  background: linear-gradient(135deg, #DEFAF1 0%, #ECFCF6 60%, #F6FEFB 100%);
  --bb-accent: #00A37A; --bb-glow: rgba(0,212,177,.10);
  position: relative;
}
.bb-agency {
  background: linear-gradient(135deg, #FFEDD2 0%, #FFF4DF 60%, #FFFAF0 100%);
  --bb-accent: #C8941D; --bb-glow: rgba(248,188,66,.12);
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px; padding: 32px 28px;
}
.bb-agency .bb-text { display: flex; flex-direction: column; min-width: 0; }
.bb-agency .bb-illus { position: relative; min-height: 230px; }

.bb-students {
  background: linear-gradient(135deg, #D9E5F6 0%, #E7EEF9 60%, #F2F5FB 100%);
  --bb-accent: #4A57E0; --bb-glow: rgba(74,87,224,.10);
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px; padding: 32px 28px;
}
.bb-students .bb-text { display: flex; flex-direction: column; min-width: 0; }
.bb-students .bb-illus { position: relative; min-height: 230px; }

.bb-enterprise {
  background: linear-gradient(135deg, #E5E3FF 0%, #EEEBFF 60%, #F5F3FF 100%);
  --bb-accent: #7A73FF; --bb-glow: rgba(122,115,255,.12);
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 14px; padding: 32px 28px;
}
.bb-enterprise .bb-text { display: flex; flex-direction: column; min-width: 0; }
.bb-enterprise .bb-illus { position: relative; min-height: 230px; }

/* icon variants */
.ic-pm        { background: linear-gradient(135deg, #7B73FF 0%, #5C53F0 100%); color: #fff;    box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 10px 22px -8px rgba(99, 91, 255, .45); }
.ic-ent       { background: linear-gradient(180deg, #FFEEF4 0%, #FFE3EE 100%); color: #E84783; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(255, 89, 150, .14); }
.ic-mkt       { background: linear-gradient(180deg, #E9FCF5 0%, #D8F8EB 100%); color: #00926D; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(0, 163, 122, .18); }
.ic-agency    { background: linear-gradient(180deg, #FFEAC1 0%, #FFDA92 100%); color: #B07614; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(248, 188, 66, .22); }
.ic-students  { background: linear-gradient(180deg, #E5EEFA 0%, #D6E3F5 100%); color: #4A57E0; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(99, 91, 255, .18); }
.ic-enterprise{ background: linear-gradient(180deg, #ECEAFF 0%, #DDDAFF 100%); color: #6962E8; box-shadow: inset 0 1px 0 rgba(255,255,255,.6), inset 0 0 0 1px rgba(122, 115, 255, .22); }

@keyframes bbFloat    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
@keyframes bbFloatRev { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-3px) rotate(-3deg)} }
@keyframes bbPulse    { 0%,100%{box-shadow:0 0 0 0 rgba(99,91,255,.45)} 50%{box-shadow:0 0 0 6px rgba(99,91,255,0)} }

/* === PM illustration === */
.il-pm { position: absolute; inset: 0; }
.il-pm .pm-grid {
  position: absolute; right: 0; top: 0; width: 100%; height: 100%;
  background-image:
    linear-gradient(rgba(99,91,255,.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99,91,255,.06) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse 80% 70% at 60% 50%, #000 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 80% 70% at 60% 50%, #000 30%, transparent 80%);
}
.il-pm .pm-card-back {
  position: absolute; left: 0; top: 8%; width: 56%; height: 84%;
  background: linear-gradient(180deg, rgba(255,255,255,.85), rgba(250,250,255,.7));
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(99, 91, 255, .14);
  border-radius: 14px;
  box-shadow: 0 24px 40px -22px rgba(99, 91, 255, .35);
  transform: rotate(-3deg);
  padding: 18px 16px;
  display: flex; flex-direction: column; gap: 11px;
  animation: bbFloatRev 6s ease-in-out infinite;
}
.il-pm .pm-card-back .pm-head { display: flex; align-items: center; gap: 7px; font-size: 10px; font-weight: 600; color: #697386; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 2px; }
.il-pm .pm-card-back .pm-head .pm-dot-live { width: 6px; height: 6px; border-radius: 50%; background: #00A37A; box-shadow: 0 0 0 3px rgba(0,163,122,.18); }
.il-pm .pm-card-back .line { height: 5px; border-radius: 3px; background: linear-gradient(90deg, #C7C3F2, #E8E7FF 80%, transparent); }
.il-pm .pm-card-back .line.s { width: 56%; }
.il-pm .pm-card-back .line.m { width: 78%; }

.il-pm .pm-card-front {
  position: absolute; right: 0; top: 6%; width: 64%; height: 88%;
  background: #fff;
  border: 1px solid rgba(99, 91, 255, .14);
  border-radius: 14px;
  box-shadow: 0 1px 0 rgba(255,255,255,1) inset, 0 26px 44px -22px rgba(99, 91, 255, .45);
  padding: 18px 16px;
  display: flex; flex-direction: column;
  animation: bbFloat 7s ease-in-out infinite;
}
.il-pm .pm-card-front .pm-front-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.il-pm .pm-card-front .pm-front-head .pm-title { font-size: 11px; font-weight: 600; color: #0A2540; letter-spacing: -0.01em; }
.il-pm .pm-card-front .pm-front-head .pm-meta { font-size: 9px; font-weight: 500; color: #697386; letter-spacing: .04em; }
.il-pm .pm-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-top: 1px solid rgba(10,37,64,.06); }
.il-pm .pm-row:first-of-type { border-top: 0; }
.il-pm .pm-check {
  width: 16px; height: 16px; border-radius: 50%;
  background: linear-gradient(180deg, #7A73FF, #635BFF);
  display: grid; place-items: center; color: #fff; flex-shrink: 0;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 4px 8px -3px rgba(99, 91, 255, .5);
}
.il-pm .pm-bar { flex: 1; height: 6px; border-radius: 4px; background: linear-gradient(90deg, #B7B4F2 0%, #E8E7FF 70%); }
.il-pm .pm-bar.s { max-width: 60%; }
.il-pm .pm-bar.m { max-width: 78%; }

.il-pm .pm-pill {
  position: absolute; top: -2%; right: -4%;
  background: linear-gradient(180deg, #7A73FF, #5A50F0);
  color: #fff;
  font-family: "Inter", sans-serif; font-weight: 600; font-size: 11px;
  letter-spacing: -0.005em;
  padding: 7px 12px 7px 14px; border-radius: 9px;
  display: inline-flex; align-items: center; gap: 7px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 16px 28px -10px rgba(99, 91, 255, .55);
  white-space: nowrap;
  animation: bbFloat 5s ease-in-out infinite;
}
.il-pm .pm-pill .pm-pill-check { width: 14px; height: 14px; border-radius: 50%; background: rgba(255,255,255,.22); display: grid; place-items: center; }
.il-pm .pm-pill svg { width: 9px; height: 9px; }

.il-pm .pm-chart {
  position: absolute; bottom: -2%; right: 6%; width: 108px;
  background: #fff;
  border: 1px solid rgba(99, 91, 255, .12);
  border-radius: 11px;
  padding: 10px 12px 8px;
  box-shadow: 0 1px 0 rgba(255,255,255,1) inset, 0 18px 30px -14px rgba(99, 91, 255, .35);
  display: flex; flex-direction: column; gap: 4px;
  animation: bbFloat 6.5s ease-in-out infinite reverse;
}
.il-pm .pm-chart .pm-chart-label { font-size: 9px; color: #697386; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; }
.il-pm .pm-chart svg { width: 100%; height: 28px; overflow: visible; }

/* === Entrepreneurs (Product & innovation teams) === */
.il-ent { position: absolute; right: 24px; bottom: 22px; }
.il-ent .ent-card {
  background: rgba(255,255,255,.7);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 89, 150, .15);
  border-radius: 11px;
  padding: 9px 12px;
  box-shadow: 0 14px 26px -14px rgba(255, 89, 150, .3);
  display: flex; flex-direction: column; gap: 3px; min-width: 110px;
}
.il-ent .ent-label { font-size: 9px; font-weight: 600; color: #B53670; letter-spacing: .06em; text-transform: uppercase; }
.il-ent .ent-num   { font-size: 18px; font-weight: 700; color: #0A2540; letter-spacing: -0.02em; line-height: 1; }
.il-ent .ent-delta { font-size: 10px; font-weight: 600; color: #00926D; display: inline-flex; align-items: center; gap: 3px; }

/* === Marketers === */
.il-mkt {
  position: absolute; right: 22px; bottom: 22px; width: 140px;
  background: rgba(255,255,255,.65);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 163, 122, .15);
  border-radius: 12px;
  padding: 11px 13px 9px;
  box-shadow: 0 14px 26px -14px rgba(0, 163, 122, .35);
}
.il-mkt .mk-label { font-size: 9px; font-weight: 600; color: #00926D; letter-spacing: .06em; text-transform: uppercase; margin-bottom: 3px; }
.il-mkt .mk-num   { font-size: 19px; font-weight: 700; color: #0A2540; letter-spacing: -0.02em; line-height: 1; display: flex; align-items: baseline; gap: 6px; }
.il-mkt .mk-num .mk-delta { font-size: 10px; font-weight: 600; color: #00926D; }
.il-mkt svg.mk-spark { width: 100%; height: 36px; margin-top: 4px; overflow: visible; }

/* === Agencies === */
.il-ag { position: absolute; inset: 0; display: flex; align-items: center; }
.il-ag .ag-card {
  width: 100%;
  background: linear-gradient(180deg, #fff, #FFFCF6);
  border: 1px solid rgba(200, 148, 29, .18);
  border-radius: 14px;
  box-shadow: 0 1px 0 rgba(255,255,255,1) inset, 0 20px 36px -20px rgba(200, 148, 29, .3);
  padding: 14px 14px 12px;
  display: flex; flex-direction: column; gap: 6px;
}
.il-ag .ag-head  { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.il-ag .ag-title { font-family: "Inter", sans-serif; font-weight: 600; font-size: 13px; color: #0A2540; letter-spacing: -0.01em; }
.il-ag .ag-count { font-size: 10px; font-weight: 600; color: #697386; background: rgba(10,37,64,.04); padding: 2px 7px; border-radius: 999px; }
.il-ag .ag-row {
  display: flex; align-items: center; gap: 9px;
  padding: 7px 0 6px;
  font-size: 11.5px; color: #425466;
  border-top: 1px solid rgba(10, 37, 64, .05);
}
.il-ag .ag-row:first-of-type { border-top: 0; padding-top: 4px; }
.il-ag .ag-avatar { width: 18px; height: 18px; border-radius: 50%; color: #fff; font-size: 8.5px; font-weight: 700; display: grid; place-items: center; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,.25); }
.il-ag .ag-name   { flex: 1; font-weight: 500; color: #0A2540; }
.il-ag .ag-tag    { font-size: 9.5px; font-weight: 600; padding: 3px 8px; border-radius: 999px; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; flex-shrink: 0; }
.il-ag .ag-tag .ag-tdot { width: 5px; height: 5px; border-radius: 50%; }
.il-ag .tag-prog { background: #FFF4DE; color: #B07614; }
.il-ag .tag-prog .ag-tdot { background: #F8BC42; animation: bbPulse 2s ease-in-out infinite; }
.il-ag .tag-rev  { background: #FFE9DC; color: #C2521E; }
.il-ag .tag-rev  .ag-tdot { background: #FF9173; }
.il-ag .tag-done { background: #E0FBF4; color: #007858; }
.il-ag .tag-done .ag-tdot { background: #00A37A; }

/* === Students (Operations) === */
.il-st { position: absolute; inset: 0; }
.il-st .st-frame {
  position: absolute; left: 8%; top: 6%; width: 86%; height: 90%;
  background: linear-gradient(180deg, #fff, #F8F9FC);
  border: 1px solid rgba(74, 87, 224, .15);
  border-radius: 12px;
  box-shadow: 0 1px 0 rgba(255,255,255,1) inset, 0 22px 38px -20px rgba(74, 87, 224, .32);
  overflow: hidden;
  display: flex; flex-direction: column;
}
.il-st .st-chrome { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: rgba(245, 247, 251, .8); border-bottom: 1px solid rgba(10, 37, 64, .06); }
.il-st .st-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(10,37,64,.12); }
.il-st .st-dot:nth-child(1) { background: #FF9173; }
.il-st .st-dot:nth-child(2) { background: #F8BC42; }
.il-st .st-dot:nth-child(3) { background: #00A37A; }
.il-st .st-tab { margin-left: 8px; font-family: "Geist Mono", ui-monospace, monospace; font-size: 9.5px; font-weight: 500; color: #425466; background: #fff; padding: 3px 8px; border-radius: 5px; border: 1px solid rgba(10,37,64,.06); }
.il-st .st-body { flex: 1; padding: 11px 12px 12px; display: flex; flex-direction: column; gap: 6px; counter-reset: ln; }
.il-st .st-line { display: flex; align-items: center; gap: 8px; font-family: "Geist Mono", ui-monospace, monospace; font-size: 9.5px; }
.il-st .st-line::before { counter-increment: ln; content: counter(ln); width: 12px; flex-shrink: 0; text-align: right; color: #B7BAC8; font-weight: 500; }
.il-st .st-line .seg { height: 5px; border-radius: 3px; }
.il-st .st-line .seg.violet { background: linear-gradient(90deg, #7A73FF, #C7C3F2); }
.il-st .st-line .seg.coral  { background: linear-gradient(90deg, #FF5996, #FFB0CB); }
.il-st .st-line .seg.mint   { background: linear-gradient(90deg, #00D4B1, #B6F2E2); }
.il-st .st-line .seg.muted  { background: linear-gradient(90deg, #C8CCD9, #E5E8F0); }
.il-st .st-line .w08 { width: 8px; }  .il-st .st-line .w12 { width: 12px; }
.il-st .st-line .w16 { width: 16px; } .il-st .st-line .w20 { width: 20px; }
.il-st .st-line .w24 { width: 24px; } .il-st .st-line .w32 { width: 32px; }
.il-st .st-line .w40 { width: 40px; } .il-st .st-line .w52 { width: 52px; }
.il-st .st-line.indent  { padding-left: 12px; }
.il-st .st-line.indent2 { padding-left: 24px; }
.il-st .st-play {
  position: absolute; bottom: 8%; right: -4%;
  width: 40px; height: 40px;
  background: linear-gradient(180deg, #7A73FF, #5A50F0);
  border-radius: 50%;
  display: grid; place-items: center; color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 18px 30px -10px rgba(99, 91, 255, .55);
}
.il-st .st-play svg { margin-left: 2px; }

/* === Enterprise (Independent builders) === */
.il-ee { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 10px 6px; }
.il-ee .ee-stack { position: relative; width: 100%; max-width: 220px; display: flex; flex-direction: column; gap: 8px; }
.il-ee .ee-layer {
  position: relative; height: 54px; border-radius: 12px;
  background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(248,247,255,.86));
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(122, 115, 255, .2);
  box-shadow: 0 1px 0 rgba(255,255,255,1) inset, 0 16px 28px -18px rgba(122, 115, 255, .35);
  padding: 0 12px;
  display: flex; align-items: center; gap: 9px; overflow: hidden;
}
.il-ee .ee-layer.l1 { transform: rotate(-1.4deg); animation: bbFloat 6s ease-in-out infinite; }
.il-ee .ee-layer.l2 { transform: rotate(0.8deg);  animation: bbFloat 7s ease-in-out infinite reverse; z-index: 2; }
.il-ee .ee-layer.l3 { transform: rotate(-0.8deg); animation: bbFloat 6.5s ease-in-out infinite; }
.il-ee .ee-glyph { width: 26px; height: 26px; border-radius: 7px; display: grid; place-items: center; color: #fff; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,.3); }
.il-ee .ee-glyph.g1 { background: linear-gradient(180deg, #7A73FF, #5A50F0); }
.il-ee .ee-glyph.g2 { background: linear-gradient(180deg, #00D4FF, #00B8E6); }
.il-ee .ee-glyph.g3 { background: linear-gradient(180deg, #2DD4A1, #00A37A); }
.il-ee .ee-meta  { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.il-ee .ee-name  { font-family: "Inter", sans-serif; font-size: 10.5px; font-weight: 600; color: #0A2540; letter-spacing: -0.005em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.il-ee .ee-sub   { font-family: "Geist Mono", ui-monospace, monospace; font-size: 8.5px; color: #697386; letter-spacing: .02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.il-ee .ee-pulse { width: 7px; height: 7px; border-radius: 50%; background: #00A37A; box-shadow: 0 0 0 3px rgba(0,163,122,.18); animation: bbPulse 2s ease-in-out infinite; flex-shrink: 0; }
`;

/* ============================================================ */
/*  SHARED PRIMITIVES                                            */
/* ============================================================ */

const ArrowRight = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckSmall = ({ size = 9, stroke = 4 }: { size?: number; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ============================================================ */
/*  ICON GLYPHS — one per role                                   */
/* ============================================================ */

const IconStartup = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="8 7 3 12 8 17" />
    <polyline points="16 7 21 12 16 17" />
  </svg>
);
const IconProduct = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 17 9 11 13 15 21 7" />
    <polyline points="15 7 21 7 21 13" />
  </svg>
);
const IconMarketing = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconAgency = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconOps = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10L12 4 2 10l10 6 10-6z" />
    <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
  </svg>
);
const IconBuilder = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1.4" fill="currentColor" />
  </svg>
);

/* ============================================================ */
/*  ILLUSTRATIONS — one per card                                 */
/* ============================================================ */

const PmIllustration = () => (
  <div className="il-pm">
    <div className="pm-grid" />

    <div className="pm-card-back">
      <div className="pm-head">
        <span className="pm-dot-live" />
        Discovery
      </div>
      <div className="line m" />
      <div className="line s" />
      <div className="line m" />
      <div className="line s" />
    </div>

    <div className="pm-card-front">
      <div className="pm-front-head">
        <span className="pm-title">Workflow</span>
        <span className="pm-meta">3 / 5</span>
      </div>
      {(["", "m", "s"] as const).map((mod, i) => (
        <div className="pm-row" key={i}>
          <span className="pm-check"><CheckSmall /></span>
          <span className={`pm-bar ${mod}`} />
        </div>
      ))}
    </div>

    <div className="pm-pill">
      <span className="pm-pill-check"><CheckSmall /></span>
      Prototype v1
    </div>

    <div className="pm-chart">
      <span className="pm-chart-label">Signal</span>
      <svg viewBox="0 0 80 32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pm-spark-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A73FF" stopOpacity=".35" />
            <stop offset="100%" stopColor="#7A73FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0,24 L14,18 L28,22 L42,12 L56,16 L70,6 L80,8 L80,32 L0,32 Z" fill="url(#pm-spark-area)" />
        <polyline points="0,24 14,18 28,22 42,12 56,16 70,6 80,8"
                  fill="none" stroke="#635BFF" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx="80" cy="8" r="2.5" fill="#fff" stroke="#635BFF" strokeWidth="1.5" />
      </svg>
    </div>
  </div>
);

const EntIllustration = () => (
  <div className="il-ent">
    <div className="ent-card">
      <div className="ent-label">MRR</div>
      <div className="ent-num">$48.2k</div>
      <div className="ent-delta">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 14 12 8 18 14" /></svg>
        +24%
      </div>
    </div>
  </div>
);

const MktIllustration = () => (
  <div className="il-mkt" aria-hidden="true">
    <div className="mk-label">Conversions</div>
    <div className="mk-num">12,438 <span className="mk-delta">+38%</span></div>
    <svg className="mk-spark" viewBox="0 0 140 40" preserveAspectRatio="none">
      <defs>
        <linearGradient id="mk-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2DD4A1" stopOpacity=".35" />
          <stop offset="100%" stopColor="#2DD4A1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mk-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00A37A" />
          <stop offset="100%" stopColor="#2DD4A1" />
        </linearGradient>
      </defs>
      <path d="M0,30 L18,26 L36,28 L54,18 L72,20 L90,12 L108,14 L126,6 L140,8 L140,40 L0,40 Z" fill="url(#mk-area)" />
      <polyline points="0,30 18,26 36,28 54,18 72,20 90,12 108,14 126,6 140,8"
                fill="none" stroke="url(#mk-line)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx="140" cy="8" r="3" fill="#fff" stroke="#00A37A" strokeWidth="1.8" />
    </svg>
  </div>
);

type AgencyProject = { initials: string; name: string; avatar: string; tag: "prog" | "rev" | "done"; label: string };
const AGENCY_ROWS: AgencyProject[] = [
  { initials: "NW", name: "Brand site",  avatar: "linear-gradient(180deg,#00D4B1,#00A37A)", tag: "prog", label: "In progress" },
  { initials: "HL", name: "SaaS landing", avatar: "linear-gradient(180deg,#7A73FF,#635BFF)", tag: "rev",  label: "Review" },
  { initials: "IK", name: "Mobile app",   avatar: "linear-gradient(180deg,#FFCB6B,#F8BC42)", tag: "done", label: "Done" },
];

const AgencyIllustration = () => (
  <div className="il-ag">
    <div className="ag-card">
      <div className="ag-head">
        <span className="ag-title">Projects</span>
        <span className="ag-count">12 active</span>
      </div>
      {AGENCY_ROWS.map((r) => (
        <div className="ag-row" key={r.name}>
          <span className="ag-avatar" style={{ background: r.avatar }}>{r.initials}</span>
          <span className="ag-name">{r.name}</span>
          <span className={`ag-tag tag-${r.tag}`}><span className="ag-tdot" />{r.label}</span>
        </div>
      ))}
    </div>
  </div>
);

type StLine = { indent?: 0 | 1 | 2; segs: { color: "violet" | "coral" | "mint" | "muted"; w: 8|12|16|20|24|32|40|52 }[] };
const ST_LINES: StLine[] = [
  { segs: [{ color: "violet", w: 40 }, { color: "muted", w: 20 }] },
  { segs: [{ color: "violet", w: 24 }, { color: "coral", w: 32 }, { color: "muted", w: 12 }] },
  { indent: 1, segs: [{ color: "mint", w: 20 }, { color: "muted", w: 24 }] },
  { indent: 2, segs: [{ color: "coral", w: 16 }, { color: "muted", w: 40 }] },
  { indent: 2, segs: [{ color: "violet", w: 12 }, { color: "muted", w: 24 }] },
  { indent: 1, segs: [{ color: "mint", w: 16 }] },
  { segs: [{ color: "violet", w: 20 }] },
];

const StudentsIllustration = () => (
  <div className="il-st">
    <div className="st-frame">
      <div className="st-chrome">
        <span className="st-dot" /><span className="st-dot" /><span className="st-dot" />
        <span className="st-tab">app.tsx</span>
      </div>
      <div className="st-body">
        {ST_LINES.map((line, i) => (
          <div key={i} className={`st-line${line.indent === 1 ? " indent" : line.indent === 2 ? " indent2" : ""}`}>
            {line.segs.map((s, j) => (
              <span key={j} className={`seg ${s.color} w${String(s.w).padStart(2, "0")}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
    <div className="st-play">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="6 4 20 12 6 20 6 4" />
      </svg>
    </div>
  </div>
);

type EeLayer = { tone: "g1" | "g2" | "g3"; cls: "l1" | "l2" | "l3"; name: string; sub: string; glyph: React.ReactNode };
const EE_LAYERS: EeLayer[] = [
  {
    cls: "l1", tone: "g1", name: "Identity & access", sub: "SSO · SAML · SCIM",
    glyph: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
    ),
  },
  {
    cls: "l2", tone: "g2", name: "Global edge network", sub: "28 regions · 99.99%",
    glyph: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
    ),
  },
  {
    cls: "l3", tone: "g3", name: "Encrypted data", sub: "AES-256 · audit log",
    glyph: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v6c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
        <path d="M4 12v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
      </svg>
    ),
  },
];

const EnterpriseIllustration = () => (
  <div className="il-ee">
    <div className="ee-stack">
      {EE_LAYERS.map((l) => (
        <div className={`ee-layer ${l.cls}`} key={l.cls}>
          <div className={`ee-glyph ${l.tone}`}>{l.glyph}</div>
          <div className="ee-meta">
            <span className="ee-name">{l.name}</span>
            <span className="ee-sub">{l.sub}</span>
          </div>
          <span className="ee-pulse" />
        </div>
      ))}
    </div>
  </div>
);

/* ============================================================ */
/*  MAIN                                                         */
/* ============================================================ */

export type RolesBentoProps = {
  /** Eyebrow pill text above the heading. Default: "Built for people who move fast". */
  eyebrow?: React.ReactNode;
  /** Override heading text. Default: "OneAtlas turns ideas into <grad>working software</grad>" */
  title?: React.ReactNode;
  /** Override subline. */
  subtitle?: React.ReactNode;
  /** Optional click handler for any card's CTA. Receives the card id. */
  onExplore?: (id: RoleId) => void;
};

export type RoleId =
  | "startup"
  | "product"
  | "marketing"
  | "agency"
  | "ops"
  | "builder";

const DEFAULT_TITLE = (
  <>OneAtlas turns ideas into <span className="bb-grad">working software</span></>
);

const DEFAULT_SUB =
  "Create AI apps, internal tools, customer portals, automations, and full products — without managing codebases, infrastructure, or complex workflows.";

const RolesBento: React.FC<RolesBentoProps> = ({
  eyebrow = "Built for people who move fast",
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUB,
  onExplore,
}) => {
  return (
    <section className="bb-section">
      <style>{css}</style>

      <div className="bb-container">
        <div className="bb-head">
          {eyebrow && (
            <div className="bb-eyebrow">
              <span className="bb-pulse" />
              {eyebrow}
            </div>
          )}
          <h2>{title}</h2>
          <p className="bb-sub">{subtitle}</p>
          <div className="bb-divider" />
        </div>

        {/* Row 1 — Startup (wide) + Product + Marketing */}
        <div className="bb-row bb-row-1">

          {/* Startup teams */}
          <article className="bb-card bb-pm">
            <div className="bb-text">
              <div className="bb-icon ic-pm"><IconStartup /></div>
              <h3>Startup teams</h3>
              <p className="bb-body">Ship fast, stay ahead.</p>
              <button className="bb-explore" onClick={() => onExplore?.("startup")}>Explore</button>
            </div>
            <div className="bb-illus"><PmIllustration /></div>
          </article>

          {/* Product & innovation teams */}
          <article className="bb-card bb-ent">
            <div className="bb-icon ic-ent"><IconProduct /></div>
            <h3>Product teams</h3>
            <p className="bb-body">Test ideas in real environments.</p>
            <EntIllustration />
            <span className="bb-arrow"><ArrowRight /></span>
          </article>

          {/* Marketing & growth teams */}
          <article className="bb-card bb-mkt">
            <div className="bb-icon ic-mkt"><IconMarketing /></div>
            <h3>Marketing teams</h3>
            <p className="bb-body">Launch without dependencies.</p>
            <MktIllustration />
            <span className="bb-arrow"><ArrowRight /></span>
          </article>

        </div>

        {/* Row 2 — Agencies + Ops + Builders */}
        <div className="bb-row bb-row-2">

          {/* Agencies & service businesses */}
          <article className="bb-card bb-agency">
            <div className="bb-text">
              <div className="bb-icon ic-agency"><IconAgency /></div>
              <h3>Agencies</h3>
              <p className="bb-body">Deliver custom software at scale.</p>
              <span className="bb-arrow"><ArrowRight /></span>
            </div>
            <div className="bb-illus"><AgencyIllustration /></div>
          </article>

          {/* Operations & business teams */}
          <article className="bb-card bb-students">
            <div className="bb-text">
              <div className="bb-icon ic-students"><IconOps /></div>
              <h3>Operations</h3>
              <p className="bb-body">Automate the work behind the scenes.</p>
              <span className="bb-arrow"><ArrowRight /></span>
            </div>
            <div className="bb-illus"><StudentsIllustration /></div>
          </article>

          {/* Independent builders */}
          <article className="bb-card bb-enterprise">
            <div className="bb-text">
              <div className="bb-icon ic-enterprise"><IconBuilder /></div>
              <h3>Independent builders</h3>
              <p className="bb-body">Create products without technical overhead.</p>
              <span className="bb-arrow"><ArrowRight /></span>
            </div>
            <div className="bb-illus"><EnterpriseIllustration /></div>
          </article>

        </div>
      </div>
    </section>
  );
};

export default RolesBento;
