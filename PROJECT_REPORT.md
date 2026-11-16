# PROJECT REPORT

## TABLE OF CONTENTS

| Sr. No. | Title of Chapter | Page No. |
| :---: | :--- | :---: |
| **1** | **CHAPTER-1: INTRODUCTION** | **1** |
| | 1.1 Overview of the Project | 1 |
| | 1.2 Problem Statement | 2 |
| | 1.3 Objective | 2 |
| | 1.4 Scope of the Project | 3 |
| **2** | **CHAPTER-2: LITERATURE SURVEY** | **4** |
| | 2.1 Existing System and Its Limitations | 4 |
| | 2.2 Proposed System Overview | 5 |
| **3** | **CHAPTER-3: SYSTEM DESIGN** | **6** |
| | 3.1 System Requirements | 6 |
| | 3.1.1 Hardware Requirements | 6 |
| | 3.1.2 Software Requirements | 6 |
| | 3.2 System Architecture | 7 |
| | 3.3 Module Description | 8 |
| **4** | **CHAPTER-4: IMPLEMENTATION AND TESTING** | **10** |
| | 4.1 Experimental Setup | 10 |
| | 4.2 Flowchart | 11 |
| | 4.3 Screenshots and Description | 12 |
| | 4.4 Testing | 14 |
| **5** | **CHAPTER-5: CONCLUSION AND FUTURE SCOPE** | **16** |
| | 5.1 Conclusion | 16 |
| | 5.2 Future Scope | 16 |
| **6** | **REFERENCES** | **17** |

---

## CHAPTER-1: INTRODUCTION

### 1.1 Overview of the Project
SQLGuard is an edge-deployed, dual-engine Web Application Firewall (WAF) engineered to detect, classify, and mitigate SQL Injection (SQLi) attacks. Web applications frequently handle untrusted user input within query parameters, authentication fields, and search boxes. When inputs are concatenated directly into database commands, attackers manipulate the SQL syntax to bypass authentication, dump sensitive database tables, or execute destructive commands.

SQLGuard combines deterministic heuristic pattern matching with an edge-optimized Machine Learning classifier (Logistic Regression with Character N-Gram TF-IDF). The system features a clean 2-tab operational interface: a live **Query Test** suite providing sub-millisecond inspection with dual verdicts, and an interactive **Detectors List** allowing granular on/off control over individual signatures.

### 1.2 Problem Statement
Traditional SQL injection defenses rely either on static regex filters or heavy cloud proxies. Static regex filters are fragile and easily bypassed through evasion techniques such as inline comment fragmentation (`admin'/**/OR/**/1=1#`), scientific notation tautologies (`' OR 1e0=1e0 --`), and character function obfuscation. Conversely, full enterprise WAFs introduce latency, operational costs, and complex configuration requirements. There is a need for a lightweight, transparent, and accurate dual-engine detection system that inspects queries in real time at the application edge.

### 1.3 Objective
1. **Dual-Engine Detection:** Implement both signature-based regex patterns and a trained Machine Learning model to evaluate inputs concurrently.
2. **Sub-Millisecond Edge Inference:** Port trained model weights into a zero-dependency JavaScript runtime capable of sub-millisecond execution.
3. **Information Theory Analysis:** Calculate Shannon character entropy ($H$) to detect obfuscation and abnormal token distributions.
4. **Interactive Rule Management:** Provide on/off toggle controls for all 12 WAF pattern signatures.
5. **Real-World Validation:** Test and demonstrate protection across three distinct target environments: single sign-on authentication, e-commerce catalog search, and healthcare record lookups.

### 1.4 Scope of the Project
The scope includes real-time interception, lexical token decomposition, heuristic signature filtering, machine learning probability scoring, and live event telemetry. The system is delivered as a modern Next.js web application configured for deployment on Cloudflare Workers edge infrastructure. Server database engine modifications are out of scope; the system operates strictly at the inspection and filtering layer (WAF).

---

## CHAPTER-2: LITERATURE SURVEY

### 2.1 Existing System and Its Limitations
Current web application defense systems employ one or more of the following mechanisms:

1. **Static Regex Pattern Matching:**
   - *Mechanism:* Scans incoming parameters against fixed blacklists of keywords like `UNION`, `SELECT`, `--`.
   - *Limitation:* Highly vulnerable to whitespace variations, comment splitting (`UN/**/ION`), case mutations, and alternative logical equivalences (`1^0=1`).
2. **Prepared Statements (Parameterized Queries):**
   - *Mechanism:* Pre-compiles SQL bytecode and treats parameters strictly as data literals.
   - *Limitation:* Highly effective at source-code level, but legacy codebases, dynamic query builders, and complex ORM queries frequently omit complete parameterization.
3. **Cloud Infrastructure WAFs (ModSecurity, Cloudflare, AWS WAF):**
   - *Mechanism:* Intercepts HTTP traffic at the network edge using massive shared rule sets.
   - *Limitation:* Black-box decision making, recurring billing overhead, false positives on complex user inputs, and inability to inspect client-side state dynamically.

### 2.2 Proposed System Overview
SQLGuard solves these limitations through a hybrid architecture:
- **Layer 1 (Deterministic Signatures):** 12 specific regex rules covering Tautology, UNION SELECT, Stacked Queries, Blind/Time Delays, Column Probing, and Char Encoding. Each rule can be dynamically enabled or disabled in the UI.
- **Layer 2 (Machine Learning Engine):** A Logistic Regression model trained on 700+ real-world malicious and benign queries. It evaluates 11 domain features (quote count, comment indicators, keyword frequency, punctuation ratio, tautology syntax) and character n-gram TF-IDF vectors, yielding an accuracy of 99.31% and 100% recall.
- **Layer 3 (Lexical Decomposer):** Decomposes inputs into discrete token chips and calculates Shannon entropy to detect structural query disruption.

---

## CHAPTER-3: SYSTEM DESIGN

### 3.1 System Requirements

#### 3.1.1 Hardware Requirements
- **Processor:** Dual-core 2.0 GHz x86-64 or ARM64 processor (Intel Core i3/i5, AMD Ryzen, Apple Silicon).
- **RAM:** Minimum 4 GB RAM (8 GB recommended for development).
- **Storage:** 500 MB free hard disk space.
- **Network:** Standard broadband internet connection for deployment.

#### 3.1.2 Software Requirements
- **Operating System:** Linux (Ubuntu 22.04+), macOS, or Windows 10/11 with WSL2.
- **Runtime Environment:** Node.js v20.x or v22.x, NPM v10.x.
- **Development Language:** JavaScript (ES6+), Python 3.12 (Model Training).
- **Core Frameworks:** Next.js 15, React 19, Tailwind CSS.
- **ML Libraries:** Scikit-Learn 1.9, NumPy 2.5 (Offline training only).
- **Edge Deployment:** Wrangler CLI 3.x / Cloudflare Workers.

### 3.2 System Architecture

```
                 +--------------------------------+
                 |    Client HTTP Request / SQL   |
                 +--------------------------------+
                                 |
                                 v
                 +--------------------------------+
                 |       SQLGuard WAF Layer       |
                 +--------------------------------+
                    |                          |
                    v                          v
     +--------------------------+  +--------------------------+
     |   Engine 1: WAF Rules    |  |     Engine 2: Edge ML    |
     | 12 Configurable Patterns |  |   Logistic Regression    |
     | Tautology, UNION, Stack  |  |  11 Features + TF-IDF    |
     +--------------------------+  +--------------------------+
                    |                          |
                    +------------+-------------+
                                 |
                                 v
                 +--------------------------------+
                 |       Decision Arbitrator      |
                 |   Rule Trigger OR ML Prob >50% |
                 +--------------------------------+
                     /                        \
                    /                          \
         [Threat Detected]                 [Clean Query]
                   v                              v
       +-----------------------+      +-----------------------+
       |   HTTP 403 Forbidden  |      |      HTTP 200 OK      |
       |  Dropped at WAF Edge  |      |   Forwarded to App    |
       +-----------------------+      +-----------------------+
                   \                              /
                    +-------------+--------------+
                                  |
                                  v
                 +--------------------------------+
                 |   Real-Time Telemetry Stream   |
                 +--------------------------------+
```

### 3.3 Module Description
1. **SQL Detector Module (`SQLDetectorView.jsx`):**
   - Clean 2-tab console.
   - **Tab 1 (Query Test):** Accepts any SQL payload, executes dual-engine evaluation, and renders the WAF verdict, ML probability, risk score, matched signatures, and parsed token stream.
   - **Tab 2 (Detectors List):** Displays all 12 detection patterns with toggle controls, regex signatures, severity ratings, and 1-click test triggers.
2. **Machine Learning Inference Module (`mlModel.js`):**
   - Executes mathematically equivalent Logistic Regression inference in pure JavaScript.
   - Computes dense domain features, scales using training set statistics, evaluates character TF-IDF n-grams, and calculates sigmoid probability $P(\text{SQLi})$.
3. **Lexical Decomposer Module (`lexer.js`):**
   - Breaks SQL input into typed tokens (`SQL_KEYWORD`, `SQL_COMMENT`, `STRING_LITERAL`, `OPERATOR_PUNCT`).
   - Computes Shannon entropy: $H(X) = -\sum P(x) \log_2 P(x)$.
4. **WAF Telemetry Bus (`store.js`):**
   - In-memory and local storage backed event bus logging client IP, timestamp, target app, HTTP status, and rule triggers.
5. **Demonstration Applications (`DemoAppsHub.jsx`):**
   - ApexPortal: Simulates corporate identity SSO authentication.
   - ShopSphere: Simulates an e-commerce catalog search filter.
   - MedVault: Simulates an electronic health record patient lookup.

---

## CHAPTER-4: IMPLEMENTATION AND TESTING

### 4.1 Experimental Setup
- **Training Environment:** Ubuntu Linux 6.8 kernel, Python 3.12.3 virtual environment, Scikit-Learn 1.9.1.
- **Dataset Size:** 724 labeled samples (456 malicious injection vectors, 268 benign queries and parameters).
- **Feature Vector:** 11 dense domain features + 45 character n-gram TF-IDF components.
- **Runtime Environment:** Next.js 15.5.2 client-side edge runtime, Chrome 130 DevTools.

### 4.2 Flowchart

```
                 [ Start: Query Received ]
                             │
                             ▼
                 [ Parse Characters & Length ]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
[ Extract 12 Heuristic Rules ]   [ Compute 11 Dense Features ]
            │                                 │
[ Match Regex Signatures ]       [ Compute N-Gram TF-IDF ]
            │                                 │
[ Calculate Max Severity ]       [ Evaluate Logit z & Sigmoid ]
            │                                 │
            └────────────────┬────────────────┘
                             │
                             ▼
              < Rule Triggered OR P(SQLi) >= 0.5? >
                             │
                    ┌────────┴────────┐
                 YES│                 │NO
                    ▼                 ▼
          [ Verdict: BLOCKED ]  [ Verdict: ALLOWED ]
          [ HTTP 403 Dropped ]  [ HTTP 200 Passed  ]
                    │                 │
                    └────────┬────────┘
                             │
                             ▼
                  [ Log Event to Telemetry ]
                             │
                             ▼
                          [ End ]
```

### 4.3 Screenshots and Description
- **Screenshot 1 — Query Test Console:**
  - Displays the query textarea with quick test payload chips (`' OR 1=1 --`, `admin'`, `UNION SELECT`).
  - Below the input, the Dual-Engine banner displays `WAF BLOCKED (403)` alongside `ML Model: SQLi 100.0% (0.2ms)`.
  - The metrics row highlights Risk Tier (Critical), Entropy (3.38 bits), and Token Count (6).
  - ML Predictive Feature Attribution chips display exact weight contributions (`single quotes (+7.15)`, `has tautology (+3.67)`).
- **Screenshot 2 — Detectors List:**
  - Displays interactive rows for all 12 pattern detectors (`Tautology Attack`, `UNION SELECT`, `Stacked Query`, `Time-based Blind SQLi`, etc.).
  - Includes toggle switches to disable individual rules, exact regex code blocks, and a `Test` button to load example payloads directly into the tester.
- **Screenshot 3 — Live Traffic Stream:**
  - Tabular telemetry grid tracking all captured requests, timestamps, client IPs, endpoints, target apps, risk scores, and verdicts.
- **Screenshot 4 — Protected Demo Apps:**
  - Three minimal cards for ApexPortal (`auth.apex-corp.internal`), ShopSphere (`store.shopsphere.io`), and MedVault (`ehr.stjude-health.internal`) with direct launch links.

### 4.4 Testing

| Test Case ID | Test Input Payload | Expected Verdict | WAF Rule Result | ML Probability | Status |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **TC-01** | `admin' OR '1'='1' --` | Blocked (403) | `RULE-SQLI-TAUTOLOGY` | 100.0% SQLi | **PASS** |
| **TC-02** | `' UNION SELECT 1,2,3 --` | Blocked (403) | `RULE-SQLI-UNION` | 97.5% SQLi | **PASS** |
| **TC-03** | `'; DROP TABLE users; --` | Blocked (403) | `RULE-SQLI-STACKED` | 99.4% SQLi | **PASS** |
| **TC-04** | `' OR SLEEP(5) --` | Blocked (403) | `RULE-SQLI-TIME-BASED` | 98.9% SQLi | **PASS** |
| **TC-05** | `admin'/**/OR/**/1=1#` | Blocked (403) | `RULE-SQLI-COMMENT` | 99.1% SQLi | **PASS** |
| **TC-06** | `sarah.jenkins@corp.com` | Allowed (200) | `DEFAULT-ALLOW` | 4.0% Benign | **PASS** |
| **TC-07** | `wireless mechanical keyboard` | Allowed (200) | `DEFAULT-ALLOW` | 1.3% Benign | **PASS** |
| **TC-08** | `48201` | Allowed (200) | `DEFAULT-ALLOW` | 0.8% Benign | **PASS** |
| **TC-09** | Rule Toggle Test (Disable Tautology, send `' OR 1=1 --`) | Bypassed Rule | `DEFAULT-ALLOW` | 98.7% SQLi (Flagged) | **PASS** |

---

## CHAPTER-5: CONCLUSION AND FUTURE SCOPE

### 5.1 Conclusion
SQLGuard delivers a high-performance, dual-engine solution for SQL injection detection and mitigation. By combining deterministic heuristic rules with a lightweight edge Machine Learning model, the system achieves:
1. **High Detection Rate:** 99.31% accuracy and 100% recall on injection attack vectors.
2. **Sub-Millisecond Speed:** Model evaluation completes in under 0.2 milliseconds directly within the browser/edge runtime.
3. **Evasion Resilience:** Successfully detects and mitigates comment-fragmented, scientific-notation, and character-encoded evasion payloads.
4. **Operational Clarity:** A clean, 2-tab console separating query testing from rule management without unnecessary text or UI clutter.

### 5.2 Future Scope
1. **Database Middleware Connector:** Develop native Node.js and Python database driver wrappers (e.g. `pg`, `mysql2`) to embed SQLGuard directly into backend connection pools.
2. **Adaptive Online Retraining:** Periodically re-train ML weights using anonymized telemetry feeds from newly detected zero-day attack patterns.
3. **Multi-Dialect Grammar AST:** Extend the lexical tokenizer to parse dialect-specific grammar trees across Oracle PL/SQL, PostgreSQL, Microsoft SQL Server, and SQLite.

---

## REFERENCES
1. **OWASP Foundation:** *OWASP Top Ten Web Application Security Risks – A03:2021 Injection*, 2021.
2. **MITRE Corporation:** *CWE-89: Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')*, Common Weakness Enumeration, 2023.
3. **Halfond, W. G. J., Viegas, J., & Orso, A.:** *A Classification of SQL-Injection Attacks and Countermeasures*, Proceedings of the IEEE International Symposium on Secure Software Engineering, 2006.
4. **Pedregosa, F. et al.:** *Scikit-learn: Machine Learning in Python*, Journal of Machine Learning Research (JMLR), 2011.
5. **Cloudflare Inc.:** *Cloudflare Workers and Edge Compute Architecture Documentation*, 2024.
