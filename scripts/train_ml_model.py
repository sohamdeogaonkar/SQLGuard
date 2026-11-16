#!/usr/bin/env python3
"""
SQLGuard Machine Learning Model Trainer
Trains a Logistic Regression + Feature Vector / N-Gram model for SQL Injection Detection.
Exports weights, biases, and feature parameters to src/lib/mlWeights.json for sub-millisecond
edge inference in pure JavaScript.
"""

import os
import json
import math
import re
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# -------------------------------------------------------------------------
# 1. DATASET CURATION (Real-world SQLi vs Benign)
# -------------------------------------------------------------------------

SQLI_SAMPLES = [
    # Classic Tautologies
    "' OR 1=1 --",
    "admin' OR '1'='1' --",
    "' or 1=1#",
    "' or 1=1/*",
    "') or ('1'='1",
    "' OR 'x'='x",
    "admin' or 1=1 or ''='",
    "admin' or 'a'='a",
    "' OR 1e0=1e0 --",
    "' OR (1^0)=1 --",
    "' or '1'='1' or ''='",
    "1' or '1' = '1",
    "admin' OR 1=1#",
    "1 or 1=1",
    "' or 1=1 limit 1 --",
    "admin' or ''='",
    "1' or 1=1 limit 1#",
    "' OR true --",
    "' OR '1'='1' AND '1'='1",
    "admin' OR 1=1--",
    "admin' OR 2>1--",

    # UNION SELECT Data Exfiltration
    "' UNION SELECT 1, 2, 3 --",
    "' UNION SELECT username, password FROM users --",
    "1' UNION ALL SELECT null, null, null--",
    "0 UNION SELECT 1, sqlite_version(), 3, 4, 5 --",
    "-1 UNION SELECT 1, table_name FROM information_schema.tables --",
    "' UNION SELECT null, column_name FROM information_schema.columns WHERE table_name='users' --",
    "1' UNION SELECT 1, @@version, 3--",
    "1 UNION SELECT 1, user(), database() --",
    "' UNION ALL SELECT 1,2,3,4,5,6,7,8,9,10--",
    "1' UNION SELECT LOAD_FILE('/etc/passwd'), 2--",
    "1' UNION SELECT 1, group_concat(username, 0x3a, password) FROM users--",
    "' UNION SELECT null, null, pass FROM admin --",
    "-1' UNION SELECT 1,2,3,4,database()--",

    # Stacked & Destructive Queries
    "'; DROP TABLE users; --",
    "1; DROP TABLE products; --",
    "admin'; UPDATE users SET role='admin' WHERE id=1; --",
    "1; DELETE FROM audit_logs WHERE 1=1; --",
    "'; EXEC xp_cmdshell('whoami'); --",
    "1'; TRUNCATE TABLE sessions; --",
    "1; INSERT INTO users(username, password) VALUES('hacked','1234'); --",
    "'; ALTER TABLE accounts ADD COLUMN backdoor VARCHAR(255); --",

    # Blind / Time-Based Injection
    "' OR SLEEP(5) --",
    "1' AND SLEEP(5)--",
    "' OR BENCHMARK(10000000,MD5(1)) --",
    "1' WAITFOR DELAY '0:0:5'--",
    "1' AND (SELECT * FROM (SELECT(SLEEP(5)))a)--",
    "1' AND IF(1=1, SLEEP(5), 0)--",
    "' OR pg_sleep(5) --",
    "1' AND (SELECT 1 FROM (SELECT COUNT(*), CONCAT((SELECT version()), FLOOR(RAND(0)*2)) x FROM information_schema.tables GROUP BY x)a)--",

    # Obfuscation & Evasion (Inline Comments, Char encoding, Hex)
    "admin'/**/OR/**/1=1#",
    "admin'/**/OR/**/'1'='1",
    "'/**/OR/**/CHAR(49)=CHAR(49)/**/--",
    "' OR CHAR(49)=CHAR(49) --",
    "' OR CHR(65)=CHR(65) --",
    "0x27204f5220313d31",
    "admin'\nOR\n'1'='1",
    "admin'\r\nOR\r\n1=1--",
    "1' /*!50000UNION*/ /*!50000SELECT*/ 1,2,3--",
    "1'/**/GROUP/**/BY/**/1,2,3--",
    "0 UNION/*random*/SELECT 1, 2, 3 --",
    "' OR CONCAT(CHAR(97),CHAR(100),CHAR(109),CHAR(105),CHAR(110))='admin' --",
    "admin' AND ASCII(SUBSTRING(password,1,1))>64--",

    # Boolean & Subquery Probe
    "' AND SUBSTRING(username,1,1)='a' --",
    "' OR (SELECT COUNT(*) FROM users) > 0 --",
    "1' AND (SELECT length(database()))=4--",
    "1' ORDER BY 1 --",
    "1' ORDER BY 10 --",
    "1' ORDER BY 50 --",
    "1' AND 1=(SELECT COUNT(*) FROM tabname); --",
    "admin') AND ('1'='1",
    "admin')) OR ((1=1",
    "' HAVING 1=1 --",
    "' GROUP BY id HAVING 1=1 --",
    "' AND EXTRACTVALUE(1, CONCAT(0x7e, (SELECT version()))) --",
    "' AND UPDATEXML(1,CONCAT(0x7e,(SELECT user())),1) --",
]

# Generate mutations of SQLi samples
EXPANDED_SQLI = []
for p in SQLI_SAMPLES:
    EXPANDED_SQLI.append(p)
    EXPANDED_SQLI.append(p.lower())
    EXPANDED_SQLI.append(p.upper())
    EXPANDED_SQLI.append(f"  {p}  ")
    EXPANDED_SQLI.append(f"SELECT * FROM tbl WHERE q={p}")
    EXPANDED_SQLI.append(p.replace(" ", "/**/"))

BENIGN_SAMPLES = [
    # Usernames & Emails
    "john_doe",
    "sarah.jenkins@apexcorp.internal",
    "alexander.hamilton",
    "maria_gonzalez99",
    "robert_drop_tables",
    "david.miller@corp.com",
    "emily.clark",
    "chen_wei",
    "support@sqlguard.internal",
    "admin_user_2024",
    "guest_visitor_01",
    "johndoe123",
    "alice",
    "bob",
    "charlie_brown",
    "developer@internal-tools.net",

    # Search queries & Catalog filters
    "mechanical keyboard",
    "wireless mouse rgb",
    "ergonomic desk chair with lumbar support",
    "nike air zoom running shoes size 11",
    "usb-c fast charger 65w anker",
    "noise cancelling bluetooth headphones",
    "apple macbook pro m3 max 32gb",
    "python machine learning algorithms",
    "nextjs tailwind css dark mode dashboard",
    "how to clean a mechanical keyboard safely",
    "best coffee beans for french press dark roast",
    "sql server installation guide windows 11",
    "cotton casual summer t-shirt navy blue",
    "4k 144hz gaming monitor ips displayport",

    # Numeric IDs & Form parameters
    "48201",
    "109923",
    "1",
    "42",
    "999",
    "page=2&limit=50",
    "sort=price_asc",
    "category_id=14",
    "status=shipped&carrier=fedex",
    "order_id=ORD-99823-CA",
    "zipcode=94103",
    "phone=1-555-839-2041",
    "sku=KB-MECH-001",
    "tracking_number=TRK928172645",

    # Natural language, sentences, chat inquiries
    "What is the return policy for damaged items?",
    "Can I change my shipping address after placing the order?",
    "Please send the receipt to my personal email address.",
    "Thank you for your assistance with my hospital records.",
    "Order delivered on time, five stars review!",
    "Is this product compatible with Windows 10 and Linux?",
    "The patient was admitted yesterday at 14:00 hours.",
    "Prescribed 500mg Amoxicillin twice daily with meals.",

    # Benign technical tokens, slugs, hashes
    "https://auth.apex-corp.internal/v2/sso/callback",
    "/api/v1/catalog/search?q=laptops",
    "sess_9f82ab7c10d481e3",
    "token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
    "d41d8cd98f00b204e9800998ecf8427e",
    "5f4dcc3b5aa765d61d8327deb882cf99",
    "2026-11-16T10:00:00Z",
    "application/json; charset=utf-8",
    "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6",

    # Normal math / punctuation in safe text
    "Price is $100 or best offer",
    "Select item 1 or 2 from menu",
    "Formula: a + b = c",
    "It's a great day for sports!",
    "Notice: 50% discount on all books",
    "Terms & conditions apply to all purchases",
]

EXPANDED_BENIGN = []
for b in BENIGN_SAMPLES:
    EXPANDED_BENIGN.append(b)
    EXPANDED_BENIGN.append(b.lower())
    EXPANDED_BENIGN.append(f"  {b}  ")
    EXPANDED_BENIGN.append(b.replace(" ", "+"))

print(f"[*] Dataset samples: {len(EXPANDED_SQLI)} SQLi payloads, {len(EXPANDED_BENIGN)} Benign inputs.")

# -------------------------------------------------------------------------
# 2. FEATURE EXTRACTION
# -------------------------------------------------------------------------
# Engineered Domain Features for SQL Injection:
# 1. Shannon Entropy (H)
# 2. Single quote count (')
# 3. Double quote count (")
# 4. Semicolon count (;)
# 5. Comment indicator count (--, #, /*)
# 6. Equality count (=)
# 7. Parenthesis count (()
# 8. SQL Keyword count (SELECT, UNION, OR, AND, DROP, WHERE, FROM, etc.)
# 9. Punctuation / Special Char Ratio
# 10. Tautology regex indicator (e.g. 1=1, 'a'='a')
# 11. String length (log-scaled)

SQL_KEYWORDS = [
    "SELECT", "UNION", "FROM", "WHERE", "DROP", "INSERT", "UPDATE", "DELETE",
    "SLEEP", "BENCHMARK", "WAITFOR", "CHAR", "CONCAT", "ORDER BY", "GROUP BY",
    "HAVING", "OR", "AND", "EXEC", "TRUNCATE", "LOAD_FILE", "EXTRACTVALUE",
]

def calculate_entropy(s):
    if not s:
        return 0.0
    freq = {}
    for c in s:
        freq[c] = freq.get(c, 0) + 1
    ent = 0.0
    length = len(s)
    for count in freq.values():
        p = count / length
        ent -= p * math.log2(p)
    return round(ent, 4)

def extract_dense_features(text):
    t_upper = text.upper()
    length = max(len(text), 1)

    # 1. Entropy
    ent = calculate_entropy(text)

    # 2. Quotes & Semicolons
    single_quotes = text.count("'")
    double_quotes = text.count('"')
    semicolons = text.count(';')

    # 3. Comment markers
    comments = len(re.findall(r"(--|/\*|\*/|#)", text))

    # 4. Equality & parenthesis
    equals = text.count('=')
    parens = text.count('(') + text.count(')')

    # 5. SQL Keywords count
    kw_count = 0
    for kw in SQL_KEYWORDS:
        kw_count += len(re.findall(r"\b" + re.escape(kw) + r"\b", t_upper))

    # 6. Punctuation ratio
    punct_count = len(re.findall(r"[^a-zA-Z0-9\s]", text))
    punct_ratio = punct_count / length

    # 7. Tautology marker
    has_tautology = 1.0 if re.search(r"(\b(OR|AND)\b\s+['\"0-9a-zA-Z]+\s*=\s*['\"0-9a-zA-Z]+|\b\d+\s*=\s*\d+\b)", t_upper) else 0.0

    # 8. Normalized length
    log_len = math.log(length + 1)

    return [
        ent,
        float(single_quotes),
        float(double_quotes),
        float(semicolons),
        float(comments),
        float(equals),
        float(parens),
        float(kw_count),
        punct_ratio,
        has_tautology,
        log_len,
    ]

DENSE_FEATURE_NAMES = [
    "entropy",
    "single_quotes",
    "double_quotes",
    "semicolons",
    "comments",
    "equals",
    "parens",
    "sql_keywords",
    "punct_ratio",
    "has_tautology",
    "log_length",
]

# -------------------------------------------------------------------------
# 3. N-GRAM TF-IDF + DENSE FEATURE MATRIX
# -------------------------------------------------------------------------
all_texts = EXPANDED_SQLI + EXPANDED_BENIGN
all_labels = [1] * len(EXPANDED_SQLI) + [0] * len(EXPANDED_BENIGN)

# Character 3-gram to 4-gram TF-IDF vectorizer (vocab size limited for fast JS inference)
vectorizer = TfidfVectorizer(
    analyzer='char',
    ngram_range=(3, 4),
    min_df=3,
    max_features=45,
    lowercase=True
)

X_tfidf = vectorizer.fit_transform(all_texts).toarray()
vocab = vectorizer.get_feature_names_out()

X_dense = np.array([extract_dense_features(t) for t in all_texts])

# Compute standard scaling parameters for dense features
dense_mean = np.mean(X_dense, axis=0)
dense_std = np.std(X_dense, axis=0)
dense_std[dense_std == 0] = 1.0  # avoid div by zero

X_dense_scaled = (X_dense - dense_mean) / dense_std

# Combine Dense + N-gram TF-IDF features
X = np.hstack([X_dense_scaled, X_tfidf])
y = np.array(all_labels)

# Train/Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# -------------------------------------------------------------------------
# 4. TRAIN LOGISTIC REGRESSION CLASSIFIER
# -------------------------------------------------------------------------
clf = LogisticRegression(C=2.0, max_iter=1000, random_state=42)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
y_prob = clf.predict_proba(X_test)[:, 1]

acc = accuracy_score(y_test, y_pred)
prec = precision_score(y_test, y_pred)
rec = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc = roc_auc_score(y_test, y_prob)

print(f"[+] Model Training Complete!")
print(f"    - Accuracy:  {acc * 100:.2f}%")
print(f"    - Precision: {prec * 100:.2f}%")
print(f"    - Recall:    {rec * 100:.2f}%")
print(f"    - F1-Score:  {f1:.4f}")
print(f"    - ROC-AUC:   {roc:.4f}")

# -------------------------------------------------------------------------
# 5. EXPORT WEIGHTS & INFERENCE SPECS TO JSON
# -------------------------------------------------------------------------
all_feature_names = DENSE_FEATURE_NAMES + [f"ngram_{ng}" for ng in vocab]
coefficients = clf.coef_[0].tolist()
intercept = float(clf.intercept_[0])

# Top predictive features for explainability
feature_weights = list(zip(all_feature_names, coefficients))
feature_weights_sorted = sorted(feature_weights, key=lambda x: abs(x[1]), reverse=True)

print("\n[*] Top 10 Most Influential Features:")
for name, weight in feature_weights_sorted[:10]:
    direction = "MALICIOUS (+)" if weight > 0 else "BENIGN (-)"
    print(f"    - {name:20s}: {weight:+.4f} ({direction})")

model_export = {
    "version": "1.0.0",
    "algorithm": "LogisticRegression",
    "metrics": {
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(roc, 4),
    },
    "denseFeatures": {
        "names": DENSE_FEATURE_NAMES,
        "means": dense_mean.tolist(),
        "stds": dense_std.tolist(),
        "weights": coefficients[:len(DENSE_FEATURE_NAMES)],
    },
    "ngrams": {
        "vocab": vocab.tolist(),
        "idf": vectorizer.idf_.tolist(),
        "weights": coefficients[len(DENSE_FEATURE_NAMES):],
    },
    "intercept": intercept,
    "sqlKeywords": SQL_KEYWORDS,
}

output_path = os.path.join(os.path.dirname(__file__), "..", "src", "lib", "mlWeights.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(model_export, f, indent=2)

print(f"\n[+] Exported model weights successfully to: {output_path}")
