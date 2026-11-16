# SQLGuard: Dual-Engine SQL Injection Detection & Mitigation System
## Presentation Slides Content

---

### Slide 1: Introduction
- **Project Name:** SQLGuard
- **Domain:** Web Application Security & Threat Mitigation (CWE-89)
- **Concept:** A modern, dual-engine Web Application Firewall (WAF) combining deterministic pattern rules with edge-optimized Machine Learning.
- **Core Capability:** Real-time query inspection, lexical token decomposition, and automated HTTP 403 edge blocking.

---

### Slide 2: Motivation
- SQL Injection (SQLi) remains in the OWASP Top 10 vulnerabilities worldwide.
- Unsanitized inputs allow unauthorized database dumps, authentication bypasses, and data destruction.
- Traditional regex filters fail against obfuscated, comment-fragmented, or character-encoded evasion attacks.
- Need for a lightweight, sub-millisecond detection system combining heuristic signatures with predictive ML.

---

### Slide 3: Literature Survey
- **Standard Regex Filters:** Fast execution but easily bypassed via inline comments (`/**/`), hexadecimal encoding, and whitespace manipulation.
- **Database Parameterization (Prepared Statements):** Complete immunity at code level, but legacy codebases frequently omit parameterization.
- **Heavy Cloud WAFs (ModSecurity, Cloudflare WAF):** Effective but introduce infrastructure complexity, operational cost, and opaque rule tuning.
- **SQLGuard Hybrid Approach:** Combines transparent rule inspection with client-side/edge ML inference for zero-latency, high-accuracy filtering.

---

### Slide 4: Problem Statement and Objectives
- **Problem Statement:** Detect and mitigate advanced SQL injection attacks in real time without breaking legitimate database queries or imposing latency overhead.
- **Objectives:**
  1. Build a 12-signature deterministic rule engine with live on/off controls.
  2. Implement an ML model (Logistic Regression + TF-IDF) with >98% accuracy and sub-millisecond inference.
  3. Provide deep packet decomposition (Shannon entropy, SQL token chip stream).
  4. Demonstrate protection across 3 distinct target applications (Identity, E-Commerce, Healthcare).

---

### Slide 5: Proposed Methodology
- **Input Ingestion:** Intercepts query strings, form inputs, and URL parameters before database execution.
- **Dual-Engine Evaluation:**
  - **Engine 1 (Signatures):** 12 WAF rules matching tautologies, union selects, stacked queries, and time delays.
  - **Engine 2 (ML Classifier):** Extracts 11 domain features + n-gram TF-IDF vectors for probabilistic scoring.
- **Information Entropy:** Calculates Shannon entropy ($H$) to detect obfuscation and character distribution anomalies.
- **Enforcement Action:** Drops malicious requests with `HTTP 403 Forbidden` and logs telemetry; permits safe requests with `HTTP 200 OK`.

---

### Slide 6: System Design – Architecture / Block Diagram
```
[ User Input / Client Request ]
             │
             ▼
   [ SQLGuard WAF Layer ]
   ├── Lexical Parser (Shannon Entropy & Tokenizer)
   ├── Deterministic Rule Engine (12 Configurable Signatures)
   └── Edge ML Inference Engine (Trained Logistic Regression)
             │
      ┌──────┴──────┐
      ▼             ▼
 [Malicious]     [Safe]
  HTTP 403        HTTP 200
  Blocked         Allowed
      │             │
      └──────┬──────┘
             ▼
[ Real-Time Telemetry & Traffic Stream ]
```

---

### Slide 7: Tech Stack / Tools Used
- **Frontend & Framework:** Next.js 15, React 19, Tailwind CSS
- **Machine Learning:** Python 3.12, Scikit-Learn, NumPy (Model Training)
- **Inference Runtime:** Pure JavaScript / WebAssembly Edge Engine (0.2 ms latency)
- **Deployment Platform:** Cloudflare Workers (Native Static Assets)
- **Design & Icons:** Lucide React, Monospace Typography

---

### Slide 8: Implementation
- **2-Tab Interactive Console:**
  - **Query Test:** Live SQL tester with 1-click test payloads, risk meter, and ML attribution.
  - **Detectors List:** Toggle switches for all 12 WAF rules, regex signatures, and severity levels.
- **ML Feature Extraction:** Computes quote ratios, comment markers, SQL keyword counts, and tautology syntax.
- **Telemetry Bus:** Dispatches custom DOM events to stream live inspection logs across tabs in real time.
- **Isolated Target Apps:** ApexPortal SSO, ShopSphere Store, and MedVault EHR for live exploitation testing.

---

### Slide 9: Results / Expected Output
- **Detection Accuracy:** ML model achieved **99.31% Accuracy** and **100% Recall** on test dataset.
- **Inference Latency:** Sub-millisecond evaluation (~0.2 ms) directly in the client runtime.
- **Evasion Resilience:** Blocked inline comment fragmentation (`admin'/**/OR/**/1=1#`), scientific notation (`1e0=1e0`), and bitwise bypasses.
- **Zero False Positives:** Validated on standard email addresses, search queries, and natural language inputs.

---

### Slide 10: Conclusion and Future Scope
- **Conclusion:** SQLGuard successfully proves that a hybrid signature + edge ML architecture offers lightweight, zero-latency, and evasion-resilient SQLi protection.
- **Future Scope:**
  - Support for multi-lingual and non-ASCII character set normalization.
  - Integration with distributed database connection pools (PostgreSQL/MySQL middleware).
  - Online learning to adapt ML weights dynamically based on flagged threat streams.

---

### Slide 11: References
1. OWASP Top Ten: *A03:2021 – Injection*, Open Web Application Security Project.
2. CWE-89: *Improper Neutralization of Special Elements used in an SQL Command*, MITRE.
3. Halfond, W. G., & Orso, A. (2006): *AMNESIA: Analysis and Monitoring for NEutralizing SQL-injection Attacks*, IEEE.
4. Scikit-Learn Documentation: *Logistic Regression & TF-IDF Vectorization*, scikit-learn.org.
