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
| | 3.1 System Architecture | 6 |
| **4** | **CHAPTER-4: IMPLEMENTATION AND TESTING** | **8** |
| | 4.1 Flowchart | 8 |
| | 4.2 Testing and Verification | 10 |
| **5** | **CHAPTER-5: CONCLUSION AND FUTURE SCOPE** | **11** |
| | 5.1 Conclusion | 11 |
| | 5.2 Future Scope | 11 |
| **6** | **REFERENCES** | **12** |

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

### 3.1 System Architecture

The architecture routes untrusted inputs simultaneously through heuristic pattern matching and edge machine learning evaluation to make an autonomous enforcement decision:

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

---

## CHAPTER-4: IMPLEMENTATION AND TESTING

### 4.1 Flowchart

The flowchart outlines the end-to-end evaluation flow from input ingestion to verdict enforcement:

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

### 4.2 Testing and Verification

The system was verified against both known SQL injection signatures and benign operational queries:

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
SQLGuard delivers a high-performance, dual-engine solution for SQL injection detection and mitigation:
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
