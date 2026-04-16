import type { Metadata } from "next"

// ── SEO Metadata ──────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: "Hooma — Your grooming diary, but smarter",
  description:
    "The simple way for UK groomers to run bookings, clients, and pet notes. No paper diary. No WhatsApp chaos. Free to start.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Hooma — Your grooming diary, but smarter",
    description:
      "Bookings, client notes, and reminders — in one quiet place. Free for UK groomers.",
    type: "website",
    siteName: "Hooma",
  },
  alternates: { canonical: "/" },
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Hooma",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Bookings, client notes, and reminders for UK groomers — in one quiet place.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoped landing CSS — ported 1:1 from hooma-landing.html
// ─────────────────────────────────────────────────────────────────────────────
// Font family intentionally inherits the app's global Geist stack (per user
// preference) instead of Inter from the spec. Everything else mirrors the spec.

const LANDING_CSS = `
.hooma-v2 {
  --brand-500: #6B72C9;
  --brand-600: #5A61B8;
  --brand-700: #4950A3;
  --brand-50:  #EEF0FA;
  --mint-100:  #DAFCE0;
  --mint-50:   #ECFEF0;
  --ink-900: #0A0A1A;
  --ink-800: #1A1A2E;
  --ink-700: #374151;
  --ink-500: #6B7280;
  --ink-400: #9CA3AF;
  --ink-300: #D1D5DB;
  --ink-200: #E5E7EB;
  --ink-100: #F3F4F6;
  --ink-50:  #F9FAFB;
  --surface: #FFFFFF;
  --border: var(--ink-200);
  --r-sm: 6px; --r-md: 8px; --r-lg: 12px; --r-xl: 16px; --r-2xl: 20px;
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 20px; --s-6: 24px;
  --s-8: 32px; --s-10: 40px; --s-12: 48px; --s-16: 64px; --s-20: 80px; --s-24: 96px; --s-32: 128px;
  --shadow-xs: 0 1px 2px rgba(10,10,26,.04);
  --shadow-sm: 0 1px 3px rgba(10,10,26,.06), 0 1px 2px rgba(10,10,26,.04);
  --shadow-md: 0 4px 12px rgba(10,10,26,.06), 0 2px 4px rgba(10,10,26,.04);
  --shadow-lg: 0 12px 32px rgba(10,10,26,.08), 0 4px 8px rgba(10,10,26,.04);
  --fs-xs: 13px; --fs-sm: 14px; --fs-base: 16px; --fs-md: 17px; --fs-lg: 20px;
  --fs-xl: 24px; --fs-2xl: 32px; --fs-3xl: 40px; --fs-4xl: 56px; --fs-5xl: 72px;
  --lh-tight: 1.05; --lh-snug: 1.25; --lh-normal: 1.5; --lh-relaxed: 1.65;
  --container: 1160px;
  --header-h: 64px;
  color: var(--ink-800);
  font-size: var(--fs-md);
  line-height: var(--lh-relaxed);
  background: #FFFFFF;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.hooma-v2 *, .hooma-v2 *::before, .hooma-v2 *::after { box-sizing: border-box; }
.hooma-v2 img, .hooma-v2 svg { display: block; max-width: 100%; }
.hooma-v2 a { color: inherit; text-decoration: none; }
.hooma-v2 button { font-family: inherit; cursor: pointer; border: 0; background: none; }
.hooma-v2 h1, .hooma-v2 h2, .hooma-v2 h3, .hooma-v2 h4, .hooma-v2 p { margin: 0; }

.hooma-v2 .container {
  max-width: var(--container); margin: 0 auto; padding: 0 var(--s-5);
}
@media (min-width: 768px) { .hooma-v2 .container { padding: 0 var(--s-6); } }

.hooma-v2 .eyebrow {
  display: inline-flex; align-items: center; gap: var(--s-2);
  padding: 6px 12px; border: 1px solid var(--border); border-radius: 999px;
  font-size: var(--fs-xs); font-weight: 500; color: var(--ink-700); background: var(--surface);
}
.hooma-v2 .eyebrow .dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--brand-500);
}

.hooma-v2 .btn {
  display: inline-flex; align-items: center; justify-content: center; gap: var(--s-2);
  min-height: 44px; padding: 0 var(--s-5); border-radius: var(--r-md);
  font-size: var(--fs-base); font-weight: 500; letter-spacing: -0.005em;
  transition: background .15s ease, color .15s ease, border-color .15s ease, transform .06s ease;
  white-space: nowrap;
}
.hooma-v2 .btn:active { transform: translateY(1px); }
.hooma-v2 .btn-primary { background: var(--ink-900); color: #FFFFFF; }
.hooma-v2 .btn-primary:hover { background: #14142B; }
.hooma-v2 .btn-primary:focus-visible { outline: 2px solid var(--brand-500); outline-offset: 3px; }
.hooma-v2 .btn-brand { background: var(--brand-600); color: #FFFFFF; }
.hooma-v2 .btn-brand:hover { background: var(--brand-700); }
.hooma-v2 .btn-brand:focus-visible { outline: 2px solid var(--ink-900); outline-offset: 3px; }
.hooma-v2 .btn-ghost { background: transparent; color: var(--ink-800); border: 1px solid var(--border); }
.hooma-v2 .btn-ghost:hover { background: var(--ink-50); }
.hooma-v2 .btn-lg { min-height: 52px; padding: 0 var(--s-6); font-size: var(--fs-md); }

.hooma-v2 .header {
  position: sticky; top: 0; z-index: 50; height: var(--header-h);
  display: flex; align-items: center;
  background: rgba(255,255,255,0.8);
  backdrop-filter: saturate(180%) blur(12px);
  -webkit-backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--border);
}
.hooma-v2 .header-inner {
  display: flex; align-items: center; justify-content: space-between; width: 100%;
}
.hooma-v2 .brand-mark {
  display: inline-flex; align-items: center; gap: 10px;
  font-weight: 700; letter-spacing: -0.02em; font-size: 18px; color: var(--ink-900);
}
.hooma-v2 .brand-mark svg { width: 26px; height: 26px; }
.hooma-v2 .nav { display: none; gap: var(--s-6); align-items: center; }
.hooma-v2 .nav a { font-size: var(--fs-sm); color: var(--ink-700); }
.hooma-v2 .nav a:hover { color: var(--ink-900); }
.hooma-v2 .header-ctas { display: flex; gap: var(--s-2); align-items: center; }
.hooma-v2 .header-ctas .btn { min-height: 36px; padding: 0 14px; font-size: var(--fs-sm); }
.hooma-v2 .sign-in { display: none; }
@media (min-width: 768px) {
  .hooma-v2 .nav { display: flex; }
  .hooma-v2 .sign-in { display: inline-flex; }
}

.hooma-v2 .hero {
  position: relative; padding: var(--s-16) 0 var(--s-12); overflow: hidden;
}
.hooma-v2 .hero::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 600px 400px at 80% -10%, var(--mint-50), transparent 60%),
    radial-gradient(ellipse 500px 300px at 10% 0%, rgba(107,114,201,0.08), transparent 60%);
  pointer-events: none; z-index: 0;
}
.hooma-v2 .hero > .container { position: relative; z-index: 1; }
.hooma-v2 .hero-grid { display: grid; gap: var(--s-12); grid-template-columns: 1fr; }
@media (min-width: 960px) {
  .hooma-v2 .hero { padding: var(--s-24) 0 var(--s-16); }
  .hooma-v2 .hero-grid { grid-template-columns: 1.05fr 1fr; align-items: center; gap: var(--s-16); }
}
.hooma-v2 .hero h1 {
  font-size: var(--fs-3xl); line-height: var(--lh-tight); letter-spacing: -0.035em;
  font-weight: 700; color: var(--ink-900); margin-top: var(--s-5); max-width: 14ch;
}
.hooma-v2 .hero h1 em { font-style: normal; color: var(--brand-500); font-weight: 700; }
@media (min-width: 768px) { .hooma-v2 .hero h1 { font-size: var(--fs-4xl); } }
@media (min-width: 1100px) { .hooma-v2 .hero h1 { font-size: var(--fs-5xl); } }
.hooma-v2 .hero .lede {
  font-size: var(--fs-md); color: var(--ink-700); line-height: var(--lh-relaxed);
  max-width: 52ch; margin-top: var(--s-5);
}
@media (min-width: 768px) { .hooma-v2 .hero .lede { font-size: var(--fs-lg); } }
.hooma-v2 .hero-actions { display: flex; flex-wrap: wrap; gap: var(--s-3); margin-top: var(--s-8); }
.hooma-v2 .hero-meta {
  display: flex; flex-wrap: wrap; gap: var(--s-5); margin-top: var(--s-5);
  font-size: var(--fs-sm); color: var(--ink-500);
}
.hooma-v2 .hero-meta span { display: inline-flex; align-items: center; gap: 6px; }
.hooma-v2 .tick {
  width: 14px; height: 14px; display: inline-flex; align-items: center; justify-content: center;
  background: var(--brand-500); border-radius: 50%; color: white; font-size: 9px;
}

.hooma-v2 .product-shot {
  position: relative; border-radius: var(--r-xl);
  background: linear-gradient(180deg, #FFFFFF, var(--ink-50));
  border: 1px solid var(--border); box-shadow: var(--shadow-lg); padding: 14px;
}
.hooma-v2 .product-chrome { display: flex; align-items: center; gap: 6px; padding: 4px 6px 10px; }
.hooma-v2 .product-chrome i {
  width: 10px; height: 10px; border-radius: 50%; background: var(--ink-200); display: inline-block;
}
.hooma-v2 .product-chrome i:nth-child(1) { background: #FF605C; }
.hooma-v2 .product-chrome i:nth-child(2) { background: #FFBD44; }
.hooma-v2 .product-chrome i:nth-child(3) { background: #00CA4E; }
.hooma-v2 .product-chrome .url {
  margin-left: auto; background: var(--ink-100); color: var(--ink-500);
  font-size: 11px; font-family: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  padding: 4px 10px; border-radius: 999px;
}

.hooma-v2 .calendar {
  background: #FFFFFF; border: 1px solid var(--border);
  border-radius: var(--r-lg); overflow: hidden; font-size: 12px;
}
.hooma-v2 .cal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
.hooma-v2 .cal-title { font-weight: 600; font-size: 13px; color: var(--ink-900); }
.hooma-v2 .cal-tabs { display: flex; gap: 4px; background: var(--ink-100); padding: 3px; border-radius: 6px; font-size: 11px; }
.hooma-v2 .cal-tabs span { padding: 4px 10px; border-radius: 4px; color: var(--ink-500); }
.hooma-v2 .cal-tabs span.active { background: #FFFFFF; color: var(--ink-900); box-shadow: var(--shadow-xs); }

.hooma-v2 .cal-days { display: grid; grid-template-columns: 56px repeat(5, 1fr); border-bottom: 1px solid var(--border); }
.hooma-v2 .cal-days > div {
  padding: 10px 8px; font-size: 11px; color: var(--ink-500);
  font-weight: 500; border-right: 1px solid var(--border);
}
.hooma-v2 .cal-days > div:last-child { border-right: 0; }
.hooma-v2 .cal-days > div.today { color: var(--brand-500); font-weight: 600; }
.hooma-v2 .cal-days strong { display: block; color: var(--ink-900); font-size: 14px; margin-top: 2px; font-weight: 600; }
.hooma-v2 .cal-days .today strong { color: var(--brand-500); }

.hooma-v2 .cal-grid { display: grid; grid-template-columns: 56px repeat(5, 1fr); position: relative; }
.hooma-v2 .cal-hour {
  border-right: 1px solid var(--border); padding: 8px; font-size: 10px;
  color: var(--ink-400); text-align: right; height: 44px;
}
.hooma-v2 .cal-col { border-right: 1px solid var(--border); position: relative; height: 44px; }
.hooma-v2 .cal-col:last-child { border-right: 0; }

.hooma-v2 .booking {
  position: absolute; left: 4px; right: 4px;
  background: var(--brand-50); border-left: 3px solid var(--brand-500);
  border-radius: 4px; padding: 5px 7px; font-size: 10.5px; line-height: 1.35;
  color: var(--ink-900); box-shadow: var(--shadow-xs);
}
.hooma-v2 .booking strong { display: block; font-weight: 600; color: var(--ink-900); font-size: 11px; }
.hooma-v2 .booking span { color: var(--ink-500); font-size: 10px; }
.hooma-v2 .booking.mint { background: var(--mint-50); border-left-color: #3FB27F; }
.hooma-v2 .booking.neutral { background: var(--ink-50); border-left-color: var(--ink-400); }

.hooma-v2 .pet-card {
  position: absolute; right: -8px; bottom: -24px; width: 220px;
  background: #FFFFFF; border: 1px solid var(--border); border-radius: var(--r-lg);
  padding: 14px; box-shadow: var(--shadow-md); font-size: 12px;
}
.hooma-v2 .pet-card .row { display: flex; align-items: center; gap: 10px; }
.hooma-v2 .pet-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--mint-100); color: var(--brand-500);
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 14px;
}
.hooma-v2 .pet-card .name { font-weight: 600; color: var(--ink-900); font-size: 13px; }
.hooma-v2 .pet-card .sub { color: var(--ink-500); font-size: 11px; }
.hooma-v2 .pet-card .notes {
  margin-top: 10px; padding-top: 10px;
  border-top: 1px solid var(--border);
  color: var(--ink-700); font-size: 11px; line-height: 1.5;
}
.hooma-v2 .pet-card .chip {
  display: inline-block; background: #FFF4E5; color: #8A5A10;
  font-size: 10px; font-weight: 500; padding: 2px 8px;
  border-radius: 999px; margin-right: 4px; margin-top: 4px;
}
@media (max-width: 600px) { .hooma-v2 .pet-card { display: none; } }

.hooma-v2 .trust { padding: var(--s-12) 0 var(--s-4); text-align: center; }
.hooma-v2 .trust p {
  font-size: var(--fs-xs); text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--ink-400); margin-bottom: var(--s-5);
}
.hooma-v2 .trust .logos {
  display: flex; gap: var(--s-8); justify-content: center; flex-wrap: wrap; opacity: .75;
}
.hooma-v2 .trust .logos span {
  font-family: var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px; color: var(--ink-500);
  padding: 6px 14px; border: 1px dashed var(--border); border-radius: 999px;
}

.hooma-v2 .section { padding: var(--s-16) 0; }
@media (min-width: 768px) { .hooma-v2 .section { padding: var(--s-24) 0; } }
.hooma-v2 .section-head { max-width: 640px; margin: 0 auto var(--s-12); text-align: center; }
.hooma-v2 .section-head h2 {
  font-size: var(--fs-2xl); line-height: var(--lh-snug); letter-spacing: -0.025em;
  color: var(--ink-900); font-weight: 700;
}
@media (min-width: 768px) { .hooma-v2 .section-head h2 { font-size: var(--fs-3xl); } }
.hooma-v2 .section-head p { margin-top: var(--s-4); color: var(--ink-500); font-size: var(--fs-md); }

.hooma-v2 .pain-grid { display: grid; gap: var(--s-4); grid-template-columns: 1fr; }
@media (min-width: 640px) { .hooma-v2 .pain-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .hooma-v2 .pain-grid { grid-template-columns: repeat(3, 1fr); } }
.hooma-v2 .pain-card {
  background: #FFFFFF; border: 1px solid var(--border);
  border-radius: var(--r-lg); padding: var(--s-6);
  transition: border-color .2s, transform .2s;
}
.hooma-v2 .pain-card:hover { border-color: var(--ink-300); transform: translateY(-2px); }
.hooma-v2 .pain-card .ico {
  width: 36px; height: 36px; border-radius: var(--r-md);
  background: var(--ink-100); display: inline-flex; align-items: center; justify-content: center;
  color: var(--ink-700); margin-bottom: var(--s-4);
}
.hooma-v2 .pain-card h3 {
  font-size: var(--fs-md); font-weight: 600; color: var(--ink-900);
  letter-spacing: -0.01em; margin-bottom: var(--s-2);
}
.hooma-v2 .pain-card p { font-size: var(--fs-sm); color: var(--ink-500); line-height: var(--lh-relaxed); }

.hooma-v2 .benefits {
  background: var(--ink-900); color: #FFFFFF;
  border-radius: var(--r-2xl); padding: var(--s-12) var(--s-6);
}
@media (min-width: 768px) { .hooma-v2 .benefits { padding: var(--s-16) var(--s-12); } }
.hooma-v2 .benefits .section-head h2 { color: #FFFFFF; }
.hooma-v2 .benefits .section-head p { color: var(--ink-300); }
.hooma-v2 .benefit-grid { display: grid; gap: var(--s-6); grid-template-columns: 1fr; }
@media (min-width: 640px) { .hooma-v2 .benefit-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .hooma-v2 .benefit-grid { grid-template-columns: repeat(5, 1fr); } }
.hooma-v2 .benefit {
  display: flex; flex-direction: column; gap: var(--s-3);
  padding-top: var(--s-5); border-top: 1px solid rgba(255,255,255,0.12);
}
.hooma-v2 .benefit .ico {
  width: 32px; height: 32px; border-radius: var(--r-sm);
  background: rgba(107,114,201,0.2); color: #A5AAE6;
  display: inline-flex; align-items: center; justify-content: center;
}
.hooma-v2 .benefit h3 { font-size: var(--fs-base); font-weight: 600; letter-spacing: -0.01em; }
.hooma-v2 .benefit p { font-size: var(--fs-sm); color: var(--ink-300); line-height: var(--lh-relaxed); }

.hooma-v2 .proof-grid { display: grid; gap: var(--s-5); grid-template-columns: 1fr; }
@media (min-width: 768px) { .hooma-v2 .proof-grid { grid-template-columns: repeat(3, 1fr); } }
.hooma-v2 .proof-card {
  background: #FFFFFF; border: 1px solid var(--border); border-radius: var(--r-lg);
  padding: var(--s-6); display: flex; flex-direction: column; gap: var(--s-4); min-height: 220px;
}
.hooma-v2 .proof-card .quote {
  font-size: var(--fs-md); color: var(--ink-800);
  line-height: var(--lh-relaxed); letter-spacing: -0.005em;
}
.hooma-v2 .proof-author { display: flex; align-items: center; gap: var(--s-3); margin-top: auto; }
.hooma-v2 .proof-author .av {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--mint-100); color: var(--brand-500);
  display: inline-flex; align-items: center; justify-content: center;
  font-weight: 600; font-size: 13px;
}
.hooma-v2 .proof-author .meta strong { font-size: var(--fs-sm); color: var(--ink-900); display: block; }
.hooma-v2 .proof-author .meta span { font-size: var(--fs-xs); color: var(--ink-500); }
.hooma-v2 .proof-card.placeholder {
  background: var(--ink-50); border-style: dashed; color: var(--ink-400);
  justify-content: center; align-items: center; font-size: var(--fs-sm); text-align: center;
}

.hooma-v2 .final-cta {
  text-align: center;
  background:
    radial-gradient(ellipse 700px 300px at 50% 0%, var(--mint-50), transparent 70%),
    #FFFFFF;
  border: 1px solid var(--border); border-radius: var(--r-2xl);
  padding: var(--s-16) var(--s-6); position: relative; overflow: hidden;
}
.hooma-v2 .final-cta .paw {
  position: absolute; top: 18px; left: 50%; transform: translateX(-50%);
  width: 44px; height: 44px; opacity: 0.9;
}
.hooma-v2 .final-cta h2 {
  font-size: var(--fs-2xl); letter-spacing: -0.03em;
  color: var(--ink-900); font-weight: 700; max-width: 18ch;
  margin: var(--s-10) auto 0; line-height: var(--lh-tight);
}
@media (min-width: 768px) { .hooma-v2 .final-cta h2 { font-size: var(--fs-3xl); } }
.hooma-v2 .final-cta p {
  color: var(--ink-500); margin: var(--s-4) auto 0;
  max-width: 48ch; font-size: var(--fs-md);
}
.hooma-v2 .signup {
  display: flex; gap: var(--s-2); max-width: 440px;
  margin: var(--s-8) auto 0; flex-direction: column;
}
@media (min-width: 480px) { .hooma-v2 .signup { flex-direction: row; } }
.hooma-v2 .signup input {
  flex: 1; min-height: 48px; padding: 0 var(--s-4);
  font-size: var(--fs-base); font-family: inherit; color: var(--ink-900);
  background: #FFFFFF; border: 1px solid var(--border);
  border-radius: var(--r-md); outline: none;
  transition: border-color .15s, box-shadow .15s;
}
.hooma-v2 .signup input:focus {
  border-color: var(--brand-500);
  box-shadow: 0 0 0 3px rgba(107,114,201,0.15);
}
.hooma-v2 .signup .btn { min-height: 48px; }
.hooma-v2 .cta-meta { margin-top: var(--s-4); color: var(--ink-500); font-size: var(--fs-xs); }

.hooma-v2 .footer {
  padding: var(--s-12) 0 var(--s-10);
  border-top: 1px solid var(--border); margin-top: var(--s-16);
}
.hooma-v2 .footer-inner { display: flex; flex-direction: column; gap: var(--s-5); }
@media (min-width: 640px) {
  .hooma-v2 .footer-inner { flex-direction: row; justify-content: space-between; align-items: center; }
}
.hooma-v2 .footer-links { display: flex; gap: var(--s-5); flex-wrap: wrap; }
.hooma-v2 .footer-links a { font-size: var(--fs-sm); color: var(--ink-500); }
.hooma-v2 .footer-links a:hover { color: var(--ink-900); }
.hooma-v2 .footer-bottom {
  margin-top: var(--s-6); padding-top: var(--s-5); border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: var(--s-4); font-size: var(--fs-xs); color: var(--ink-400);
}
.hooma-v2 .footer-bottom .social { display: flex; gap: var(--s-3); }
.hooma-v2 .footer-bottom .social a {
  width: 32px; height: 32px; border: 1px solid var(--border); border-radius: var(--r-sm);
  display: inline-flex; align-items: center; justify-content: center; color: var(--ink-500);
}
.hooma-v2 .footer-bottom .social a:hover { color: var(--ink-900); border-color: var(--ink-300); }

.hooma-v2 :focus-visible { outline: 2px solid var(--brand-500); outline-offset: 2px; border-radius: 4px; }
.hooma-v2 .sr-only {
  position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0,0,0,0); white-space: nowrap; border: 0;
}
`

// ── Inline icon primitives (identical stroke/viewBox to spec symbols) ────────

function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <ellipse cx="75" cy="68" rx="32" ry="42" fill="#6B72C9" transform="rotate(-12 75 68)" />
      <ellipse cx="140" cy="78" rx="16" ry="22" fill="#6B72C9" transform="rotate(8 140 78)" />
      <ellipse cx="170" cy="118" rx="9" ry="14" fill="#6B72C9" />
      <ellipse cx="68" cy="140" rx="26" ry="22" fill="#6B72C9" />
      <ellipse cx="120" cy="148" rx="22" ry="26" fill="#6B72C9" />
    </svg>
  )
}

function IconCheck({ size = 9 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPaper() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  )
}
function IconChat() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 4h14v12H8l-4 4V4z" />
    </svg>
  )
}
function IconBrain() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0 0 6v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-2a3 3 0 0 0 0-6V7a3 3 0 0 0-3-3H9z" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20V8M10 20V4M16 20v-8M22 20H2" />
    </svg>
  )
}
function IconCog({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h0a1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  )
}
function IconGift() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 12v9H4v-9" />
      <path d="M22 8H2v4h20z" />
      <path d="M12 8v13" />
      <path d="M12 8a4 4 0 0 0-4-4 2 2 0 1 0 0 4z" />
      <path d="M12 8a4 4 0 0 1 4-4 2 2 0 1 1 0 4z" />
    </svg>
  )
}
function IconBolt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M13 2L3 14h7l-1 8 10-12h-7z" />
    </svg>
  )
}
function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M11 18h2" />
    </svg>
  )
}
function IconFlag() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 21V3h12l-2 4 2 4H4" />
    </svg>
  )
}
function IconTwitter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M18.244 2H21l-6.52 7.45L22 22h-6.773l-4.713-6.16L5.13 22H2.37l6.98-7.974L2 2h6.914l4.263 5.638L18.244 2zm-1.186 18.29h1.607L7.05 3.62H5.33l11.728 16.67z" />
    </svg>
  )
}
function IconInstagram() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="hooma-v2">
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ============== HEADER ============== */}
      <header className="header" role="banner">
        <div className="container header-inner">
          <a href="/" className="brand-mark" aria-label="Hooma home">
            <Logo />
            <span>Hooma</span>
          </a>
          <nav className="nav" aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#proof">Groomers</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="header-ctas">
            <a className="btn btn-ghost sign-in" href="/auth/login">Sign in</a>
            <a className="btn btn-primary" href="/auth/register">Get started free</a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ============== HERO ============== */}
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <span className="eyebrow"><span className="dot" />Built for UK groomers · Free during early access</span>
              <h1>
                Your grooming diary, <em>but smarter.</em>
              </h1>
              <p className="lede">
                Bookings, client notes, and reminders — in one quiet place.
                No paper diary. No WhatsApp chaos. No software built for 50-seater
                corporate salons.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary btn-lg" href="/auth/register">Start free — 2 min setup</a>
                <a className="btn btn-ghost btn-lg" href="#features">See how it works</a>
              </div>
              <div className="hero-meta" aria-label="Key facts">
                <span><span className="tick"><IconCheck /></span>Free forever tier</span>
                <span><span className="tick"><IconCheck /></span>No card required</span>
                <span><span className="tick"><IconCheck /></span>Works on your phone</span>
              </div>
            </div>

            {/* Product screenshot mock */}
            <div className="product-shot" aria-label="Hooma calendar preview">
              <div className="product-chrome">
                <i /><i /><i />
                <span className="url">hellohooma.app/calendar</span>
              </div>
              <div className="calendar">
                <div className="cal-header">
                  <div className="cal-title">This week · 14–18 April</div>
                  <div className="cal-tabs">
                    <span>Day</span><span className="active">Week</span><span>Month</span>
                  </div>
                </div>
                <div className="cal-days">
                  <div />
                  <div>Mon<strong>14</strong></div>
                  <div>Tue<strong>15</strong></div>
                  <div className="today">Wed<strong>16</strong></div>
                  <div>Thu<strong>17</strong></div>
                  <div>Fri<strong>18</strong></div>
                </div>
                <div className="cal-grid">
                  {/* row 1 */}
                  <div className="cal-hour">9:00</div>
                  <div className="cal-col">
                    <div className="booking" style={{ top: 4, height: 54 }}>
                      <strong>Biscuit · Shih Tzu</strong>
                      <span>Full groom · £42</span>
                    </div>
                  </div>
                  <div className="cal-col" />
                  <div className="cal-col">
                    <div className="booking mint" style={{ top: 4, height: 82 }}>
                      <strong>Luna · Cockapoo</strong>
                      <span>Full groom · £55</span>
                    </div>
                  </div>
                  <div className="cal-col" />
                  <div className="cal-col">
                    <div className="booking neutral" style={{ top: 4, height: 36 }}>
                      <strong>Milo · Poodle</strong>
                      <span>Nail trim · £15</span>
                    </div>
                  </div>
                  {/* row 2 */}
                  <div className="cal-hour">10:00</div>
                  <div className="cal-col" />
                  <div className="cal-col">
                    <div className="booking" style={{ top: 4, height: 82 }}>
                      <strong>Alfie · Labrador</strong>
                      <span>Bath &amp; tidy · £32</span>
                    </div>
                  </div>
                  <div className="cal-col" />
                  <div className="cal-col">
                    <div className="booking mint" style={{ top: 4, height: 82 }}>
                      <strong>Mochi · Bichon</strong>
                      <span>Full groom · £48</span>
                    </div>
                  </div>
                  <div className="cal-col" />
                  {/* row 3 */}
                  <div className="cal-hour">11:00</div>
                  <div className="cal-col">
                    <div className="booking mint" style={{ top: 4, height: 82 }}>
                      <strong>Bailey · Goldendoodle</strong>
                      <span>Full groom · £58</span>
                    </div>
                  </div>
                  <div className="cal-col" />
                  <div className="cal-col" />
                  <div className="cal-col" />
                  <div className="cal-col">
                    <div className="booking" style={{ top: 4, height: 54 }}>
                      <strong>Teddy · Cavapoo</strong>
                      <span>Full groom · £50</span>
                    </div>
                  </div>
                  {/* row 4 */}
                  <div className="cal-hour">12:00</div>
                  <div className="cal-col" />
                  <div className="cal-col" />
                  <div className="cal-col" />
                  <div className="cal-col" />
                  <div className="cal-col" />
                </div>
              </div>

              {/* Floating pet card */}
              <aside className="pet-card" aria-label="Client card preview">
                <div className="row">
                  <div className="pet-avatar">BT</div>
                  <div>
                    <div className="name">Biscuit Turner</div>
                    <div className="sub">Shih Tzu · 3 y · regular</div>
                  </div>
                </div>
                <div className="notes">
                  Nervous with dryer. Always do nails first. Owner prefers short schnauzer-style face.
                </div>
                <div>
                  <span className="chip">⚠️ Sensitive skin</span>
                  <span className="chip">Owner: Emma</span>
                </div>
              </aside>
            </div>
          </div>

          {/* Trusted by strip */}
          <div className="container trust" id="trust">
            <p>Early access · Onboarding the first 200 UK groomers</p>
            <div className="logos">
              <span>Pawsome Cuts · London</span>
              <span>The Dog House · Bristol</span>
              <span>Snip &amp; Snap · Manchester</span>
              <span>Muddy Paws · Leeds</span>
            </div>
          </div>
        </section>

        {/* ============== PAIN POINTS ============== */}
        <section className="section" id="features">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" style={{ marginBottom: 16 }}>Sound familiar?</span>
              <h2>Running a grooming business shouldn&rsquo;t feel like this.</h2>
              <p>We spoke to dozens of UK groomers. Every one of them mentioned at least three of these.</p>
            </div>

            <div className="pain-grid">
              <article className="pain-card">
                <span className="ico"><IconPaper /></span>
                <h3>The paper diary&hellip; again</h3>
                <p>Tuesday&rsquo;s bookings are in a coffee-stained notebook. If you forget it at home, the day falls apart.</p>
              </article>

              <article className="pain-card">
                <span className="ico"><IconChat /></span>
                <h3>Bookings lost in WhatsApp</h3>
                <p>Twelve chats, three cancellations, one reminder that never went out. You&rsquo;re a groomer, not a scheduler.</p>
              </article>

              <article className="pain-card">
                <span className="ico"><IconBrain /></span>
                <h3>&ldquo;Wait, was Biscuit the Shih Tzu?&rdquo;</h3>
                <p>Pet notes, allergies, favourite cuts — all trapped in your head. One brain isn&rsquo;t enough.</p>
              </article>

              <article className="pain-card">
                <span className="ico"><IconChart /></span>
                <h3>No idea what you made this month</h3>
                <p>Some weeks feel great, some feel rough. End of month, you&rsquo;re guessing. No numbers, no peace of mind.</p>
              </article>

              <article className="pain-card">
                <span className="ico"><IconCog /></span>
                <h3>Software built for someone else</h3>
                <p>You tried one. It had 47 menus, three tutorials, and a dashboard for corporate chains. Not for you.</p>
              </article>
            </div>
          </div>
        </section>

        {/* ============== BENEFITS ============== */}
        <section className="section">
          <div className="container">
            <div className="benefits">
              <div className="section-head" style={{ textAlign: "left", maxWidth: 760, marginLeft: 0 }}>
                <span
                  className="eyebrow"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderColor: "rgba(255,255,255,0.15)",
                    color: "var(--ink-300)",
                  }}
                >
                  Why Hooma
                </span>
                <h2>A professional tool that still feels like yours.</h2>
                <p>No onboarding call, no 14-day trial countdown, no pressure to upgrade. Just your diary — quieter.</p>
              </div>

              <div className="benefit-grid">
                <div className="benefit">
                  <span className="ico"><IconGift /></span>
                  <h3>Free to start</h3>
                  <p>Every core feature — bookings, clients, pet notes, reminders — on the free tier. Forever.</p>
                </div>
                <div className="benefit">
                  <span className="ico"><IconBolt /></span>
                  <h3>Early adopter perks</h3>
                  <p>First 200 UK groomers keep their price locked. Join early, pay less — always.</p>
                </div>
                <div className="benefit">
                  <span className="ico"><IconCog size={18} /></span>
                  <h3>2-minute setup</h3>
                  <p>Name your salon, add your services, go. No training videos, no help desk tickets.</p>
                </div>
                <div className="benefit">
                  <span className="ico"><IconPhone /></span>
                  <h3>Any device</h3>
                  <p>Phone in the morning, laptop in the evening. Same diary, always in sync.</p>
                </div>
                <div className="benefit">
                  <span className="ico"><IconFlag /></span>
                  <h3>Made for the UK</h3>
                  <p>Prices in £. British English. Bank holidays, postcodes, and GDPR — sorted.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============== SOCIAL PROOF ============== */}
        <section className="section" id="proof">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" style={{ marginBottom: 16 }}>From groomers, to groomers</span>
              <h2>The kind of tool we&rsquo;ve always wanted.</h2>
              <p>Early access feedback from real UK salons. More coming soon.</p>
            </div>

            <div className="proof-grid">
              <article className="proof-card">
                <p className="quote">&ldquo;I binned the paper diary the day we started. No double-bookings in two months. That&rsquo;s a first.&rdquo;</p>
                <div className="proof-author">
                  <span className="av">SR</span>
                  <div className="meta"><strong>Sarah R.</strong><span>Solo groomer, Bristol</span></div>
                </div>
              </article>

              <article className="proof-card">
                <p className="quote">&ldquo;It finally shows me what I made each week. Not in a scary way — just so I know.&rdquo;</p>
                <div className="proof-author">
                  <span className="av">JM</span>
                  <div className="meta"><strong>James M.</strong><span>Salon owner, Manchester</span></div>
                </div>
              </article>

              <article className="proof-card placeholder" aria-label="Testimonial placeholder">
                <div>
                  Your testimonial could live here.<br />
                  <a href="#signup" style={{ color: "var(--brand-600)", fontWeight: 500, marginTop: 8, display: "inline-block" }}>
                    Join early access →
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ============== FINAL CTA ============== */}
        <section className="section" id="signup">
          <div className="container">
            <div className="final-cta">
              <Logo className="paw" />
              <h2>Start today. Keep your diary quiet.</h2>
              <p>Free forever for solo groomers. Your details, your clients, your pets — yours.</p>
              <div className="signup">
                <a className="btn btn-brand" href="/auth/register" style={{ minHeight: 48, padding: "0 24px", width: "100%", maxWidth: 320 }}>
                  Get early access
                </a>
              </div>
              <p className="cta-meta">No card required · 2-minute setup · British English &amp; £</p>
            </div>
          </div>
        </section>
      </main>

      {/* ============== FOOTER ============== */}
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-inner">
            <a className="brand-mark" href="/">
              <Logo />
              <span>Hooma</span>
            </a>
            <nav className="footer-links" aria-label="Footer">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#proof">Groomers</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Hooma. Made in the UK for UK groomers.</span>
            <div className="social">
              <a href="#" aria-label="Instagram"><IconInstagram /></a>
              <a href="#" aria-label="X / Twitter"><IconTwitter /></a>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <a href="/privacy" style={{ color: "var(--ink-400)" }}>Privacy</a>
              <a href="/terms" style={{ color: "var(--ink-400)" }}>Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
