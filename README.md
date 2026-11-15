# SQLGuard – SQL Injection Detection and Prevention System

A web security project designed for Information Security coursework. SQLGuard detects and explains SQL injection (SQLi) patterns using rule-based analysis, risk scoring, and educational interactive demonstrations.

---

## 🛡️ Core Highlights

- **Rule-based Detection Engine**: Analyzes user inputs across 12+ SQL injection attack signatures (tautology bypasses, `UNION SELECT`, stacked queries, time-based blind SQLi, comment truncation, hex/char obfuscation, and data exfiltration functions).
- **Dynamic Risk Scoring (0–100)**: Evaluates threat severity, computes weighted risk, and classifies inputs into `Safe`, `Low`, `Medium`, `High`, and `Critical` risk tiers.
- **Visual Attack Walkthroughs (View-only Demos)**:
  - **Login Injection**: Demonstrates authentication bypass via `' OR 1=1 --` and `admin'--`.
  - **Search Injection**: Shows data extraction and table tampering via search inputs.
  - **UNION-based Injection**: 5-step breakdown of how attackers enumerate columns, schemas, and credentials.
- **Testing Playground**: Interactive sandbox to test custom payloads or preloaded attack vectors in real-time.
- **Security Dashboard**: Visual threat monitoring with attack logs, risk distribution bars, and top matched signatures stored client-side.
- **Vulnerable vs. Secure Comparison**: Side-by-side interactive code preview comparing raw string concatenation with parameterized prepared statements.
- **Cloudflare Ready**: Built with Edge runtime and `@cloudflare/next-on-pages` compatibility — zero heavy server dependencies or native binary locks.

---

## 📁 Project Structure

```
SQLGuard/
├── src/
│   ├── app/
│   │   ├── page.js                    # Landing page & overview
│   │   ├── layout.js                  # Global layout & navigation
│   │   ├── globals.css                # Minimal zinc dark theme styling
│   │   ├── dashboard/page.js          # Security monitoring dashboard & logs
│   │   ├── learn/page.js              # Vulnerable vs Parameterized queries
│   │   ├── demos/
│   │   │   ├── playground/page.js     # Real-time payload testing engine
│   │   │   ├── login/page.js          # View-only login bypass walkthrough
│   │   │   ├── search/page.js         # View-only search injection walkthrough
│   │   │   └── union/page.js          # View-only 5-step UNION attack demo
│   │   └── api/
│   │       └── detect/route.js        # Edge API endpoint for detection
│   ├── lib/
│   │   ├── detector.js                # Core detection & query builder engine
│   │   ├── patterns.js                # Regex signatures & severity weights
│   │   └── store.js                   # Client-side local attack log management
│   └── components/
│       ├── Navbar.jsx                 # Header navigation
│       ├── RiskBadge.jsx              # Severity pill indicators
│       ├── CodeBlock.jsx              # Syntax-highlighted query preview
│       ├── DetectionResult.jsx        # Breakdown of flagged patterns
│       └── StatsCard.jsx              # Summary metrics
├── wrangler.toml                      # Cloudflare configuration
├── package.json
└── tailwind.config.js
```

---

## 🚀 Running Locally

Ensure Node.js (v18+) is installed:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deploying to Cloudflare Workers / Pages

The application is configured for standard Cloudflare Pages deployment using `@cloudflare/next-on-pages`:

```bash
# 1. Build for Cloudflare Pages
npm run pages:build

# 2. Preview locally with Wrangler
npm run pages:dev

# 3. Deploy directly to Cloudflare
npm run deploy
```

Alternatively, push the repository to GitHub and connect it to **Cloudflare Pages** dashboard:
- **Framework preset**: `Next.js`
- **Build command**: `npx @cloudflare/next-on-pages`
- **Output directory**: `.vercel/output/static`
- **Compatibility flag**: `nodejs_compat`
- **Compatibility date**: `2024-07-01` or later
