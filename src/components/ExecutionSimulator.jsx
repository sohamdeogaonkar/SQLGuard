'use client';

import { useState } from 'react';
import {
  Binary,
  Layers,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  GitCommit,
  Split,
} from 'lucide-react';
import CodeBlock from './CodeBlock';

const SIMULATOR_PRESETS = [
  {
    id: 'auth_tautology',
    name: "Authentication Bypass (admin' OR '1'='1' --)",
    type: 'TAUTOLOGY',
    input: "admin' OR '1'='1' --",
    context: 'LOGIN_AUTH',
    queryTemplate: "SELECT * FROM users WHERE username = '{INPUT}' AND password = '{PASS}'",
    description: 'Classic authentication bypass hijacking boolean WHERE clause logic',
  },
  {
    id: 'comment_truncation',
    name: "Password Cutoff (admin'--)",
    type: 'COMMENT_TRUNCATION',
    input: "admin'--",
    context: 'LOGIN_AUTH',
    queryTemplate: "SELECT * FROM users WHERE username = '{INPUT}' AND password = '{PASS}'",
    description: 'Truncates password verification logic using SQL line comment sequence',
  },
  {
    id: 'union_exfiltration',
    name: "Data Exfiltration (' UNION SELECT cc, cvv FROM billing --)",
    type: 'UNION_INJECTION',
    input: "0' UNION SELECT card_num, cvv FROM credit_cards --",
    context: 'DATA_SEARCH',
    queryTemplate: "SELECT id, name, price FROM products WHERE name LIKE '%{INPUT}%'",
    description: 'Appends secondary SELECT statement to siphon unauthorized table rows',
  },
  {
    id: 'clean_input',
    name: 'Benign Request (sarah.jenkins)',
    type: 'CLEAN',
    input: 'sarah.jenkins@apexcorp.internal',
    context: 'LOGIN_AUTH',
    queryTemplate: "SELECT * FROM users WHERE username = '{INPUT}' AND password = '{PASS}'",
    description: 'Standard legitimate parameter without injection tokens',
  },
];

export default function ExecutionSimulator() {
  const [selectedPreset, setSelectedPreset] = useState(SIMULATOR_PRESETS[0]);
  const [customInput, setCustomInput] = useState(SIMULATOR_PRESETS[0].input);
  const [activeStep, setActiveStep] = useState(1); // 1: String Ingestion, 2: AST Mutation, 3: DB Execution, 4: Prepared Statement

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    setCustomInput(preset.input);
    setActiveStep(1);
  };

  const isMalicious = selectedPreset.type !== 'CLEAN' && customInput.includes("'");

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Preset Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Compiler Research Lab
            </span>
          </div>
          <h2 className="text-lg font-bold text-zinc-100 tracking-tight mt-0.5">
            SQL Injection Anatomy &amp; Execution Pipeline
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Interactive 4-stage compiler walkthrough demonstrating how untrusted parameters mutate Abstract Syntax Trees (AST) and how Prepared Statements guarantee mathematical immunity.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500 whitespace-nowrap">Vector:</span>
          <select
            value={selectedPreset.id}
            onChange={(e) => {
              const p = SIMULATOR_PRESETS.find((x) => x.id === e.target.value);
              if (p) handlePresetChange(p);
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:border-amber-500 focus:outline-none font-mono"
          >
            {SIMULATOR_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pipeline 4-Stage Stepper Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        {[
          { num: 1, title: 'String Ingestion', sub: 'Boundary Breakout' },
          { num: 2, title: 'AST Mutation', sub: 'Syntax Tree Hijack' },
          { num: 3, title: 'Database Execution', sub: 'Query Plan Scan' },
          { num: 4, title: 'Compiler Defense', sub: 'Prepared Statement' },
        ].map((step) => {
          const isActive = activeStep === step.num;
          const isPassed = activeStep > step.num;
          return (
            <button
              key={step.num}
              onClick={() => setActiveStep(step.num)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                isActive
                  ? 'border-amber-500/50 bg-amber-500/10 shadow-sm'
                  : isPassed
                  ? 'border-zinc-800 bg-zinc-900/60 text-zinc-300'
                  : 'border-zinc-900 bg-zinc-950/40 text-zinc-500 hover:border-zinc-800'
              }`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md font-mono text-xs font-bold ${
                  isActive
                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                    : isPassed
                    ? 'bg-zinc-800 text-emerald-400'
                    : 'bg-zinc-900 text-zinc-500'
                }`}
              >
                {step.num}
              </div>
              <div className="truncate">
                <span className={`block text-xs font-semibold ${isActive ? 'text-zinc-100' : 'text-zinc-300'}`}>
                  {step.title}
                </span>
                <span className="block text-[10px] text-zinc-500 font-mono truncate">{step.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Stage Body */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-6 shadow-xl">
        {/* STAGE 1: String Ingestion & Delimiter Breakout */}
        {activeStep === 1 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs">
                  01
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Stage 1: Lexical String Ingestion &amp; Delimiter Breakout</h3>
                  <p className="text-[11px] text-zinc-400">Untrusted user parameter concatenated into query string before lexing</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-zinc-300">
                LEXER_STREAM_ANALYSIS
              </span>
            </div>

            {/* Input Param Box */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-400 flex items-center justify-between">
                <span>Captured Parameter Value (`username`):</span>
                <span className="text-[10px] text-zinc-500">Edit payload live to test variations</span>
              </label>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-2 font-mono text-xs text-amber-300 focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Visual Token Breakout Ribbon */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400 block">Query Buffer Interpolation:</span>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
                <span className="text-blue-400">SELECT</span> * <span className="text-blue-400">FROM</span> users <span className="text-blue-400">WHERE</span> username = '
                {customInput.includes("'") ? (
                  <>
                    <span className="text-emerald-400 font-bold">{customInput.split("'")[0]}</span>
                    <span className="bg-rose-500 text-white font-black px-1 mx-0.5 rounded animate-pulse" title="Breakout quote terminates string literal">'</span>
                    <span className="text-amber-300 font-bold bg-amber-500/10 border-b border-amber-400 pb-0.5">{customInput.slice(customInput.indexOf("'") + 1)}</span>
                  </>
                ) : (
                  <span className="text-emerald-400 font-bold">{customInput}</span>
                )}
                ' <span className="text-zinc-500 line-through">AND password = 'HASH_VAL'</span>;
              </div>
            </div>

            {/* Scientific Breakdown Callout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-1.5">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Lexical Ambiguity Vulnerability
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  SQL interpreters cannot inherently distinguish between code tokens and data bytes in raw string concatenation. The unescaped single quote <code className="text-rose-400 bg-zinc-900 px-1 rounded">'</code> terminates the string literal boundary prematurely.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-3.5 space-y-1.5">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  SQLGuard WAF Interception
                </span>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  SQLGuard's deterministic edge filter evaluates the captured input against 12 AST signature rules. When string boundary manipulation is detected, the connection terminates with HTTP 403 before reaching database storage.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep(2)}
                className="flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 text-xs font-semibold transition-colors"
              >
                <span>Proceed to Stage 2: AST Mutation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: AST Tree Mutation */}
        {activeStep === 2 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs">
                  02
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Stage 2: Abstract Syntax Tree (AST) Grammatical Mutation</h3>
                  <p className="text-[11px] text-zinc-400">Comparing compiler parser AST: Developer Intended Tree vs Attacker Hijacked Tree</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 font-semibold">
                AST_GRAMMAR_HIJACKED
              </span>
            </div>

            {/* Tree Side-by-Side Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Intended AST */}
              <div className="rounded-lg border border-emerald-500/30 bg-zinc-900/40 p-4 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> INTENDED AST STRUCTURE
                  </span>
                  <span className="text-[10px] text-zinc-500">Grammar Valid</span>
                </div>
                <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 text-[11px] text-zinc-300 leading-relaxed font-mono whitespace-pre">
{`SelectStatement
  ├── Table: 'users'
  └── WhereClause (Logical AND)
        ├── BinaryExpr: [username = (Literal: String)]
        └── BinaryExpr: [password = (Literal: String)]

Expected Logic:
Condition 1 MUST BE TRUE AND Condition 2 MUST BE TRUE.`}
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  Both username and password nodes are constrained as literal string leaves under a strict <code className="text-emerald-400">AND</code> parent operator.
                </p>
              </div>

              {/* Mutated Hijacked AST */}
              <div className="rounded-lg border border-rose-500/30 bg-zinc-900/40 p-4 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5" /> HIJACKED AST MUTATION
                  </span>
                  <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded font-bold">MUTATED</span>
                </div>
                <div className="bg-zinc-950 p-3.5 rounded border border-rose-500/20 text-[11px] text-zinc-300 leading-relaxed font-mono whitespace-pre">
{`SelectStatement
  ├── Table: 'users'
  └── WhereClause (Logical OR) <── [PROMOTED TO ROOT]
        ├── BinaryExpr: [username = 'admin']
        ├── BinaryExpr: [1 = 1] (TAUTOLOGY: ALWAYS TRUE)
        └── DiscardedComment: '-- AND password = ...'

Mutated Logic:
Condition 1 OR TRUE (Evaluates to unconditional TRUE).`}
                </div>
                <p className="text-[11px] text-zinc-400 font-sans">
                  The injected <code className="text-rose-400">OR</code> keyword was promoted from data into an operator node, altering the grammar tree root.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setActiveStep(1)}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
              >
                ← Back to String Ingestion
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 text-xs font-semibold transition-colors"
              >
                <span>Proceed to Stage 3: Database Execution</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: Database Query Optimizer & Plan Execution */}
        {activeStep === 3 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 font-bold text-xs">
                  03
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Stage 3: Database Engine Optimizer &amp; Plan Execution</h3>
                  <p className="text-[11px] text-zinc-400">Trace of how the SQL query planner processes mutated boolean logic</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold">
                STORAGE_SCAN_BYPASS
              </span>
            </div>

            {/* Execution Trace Table */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-300 font-bold">Query Execution Trace (Planner Step Analysis):</span>
                <span className="text-[10px] text-zinc-500">Engine: SQLite / Postgres / MySQL</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2.5 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-bold">STEP 1</span>
                  <div className="space-y-1">
                    <span className="text-zinc-200 font-semibold">Evaluate Condition 1: `username = 'admin'`</span>
                    <p className="text-[11px] text-zinc-400">Database planner checks index. Evaluates to TRUE (or FALSE if user does not exist).</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded bg-rose-500/5 border border-rose-500/20">
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 font-bold">STEP 2</span>
                  <div className="space-y-1">
                    <span className="text-rose-200 font-semibold">Evaluate Condition 2: `OR '1' = '1'` (Tautology)</span>
                    <p className="text-[11px] text-rose-300/80">
                      Comparison between identical constants evaluates unconditionally to <strong className="text-rose-400">TRUE</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded bg-zinc-950 border border-zinc-800/80">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400 font-bold">STEP 3</span>
                  <div className="space-y-1">
                    <span className="text-zinc-200 font-semibold">Boolean Simplification: `WHERE [FALSE] OR [TRUE]`</span>
                    <p className="text-[11px] text-zinc-400">
                      According to standard boolean algebra: <code className="text-amber-300">X OR TRUE ≡ TRUE</code>. The entire WHERE clause reduces to a constant TRUE.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/30">
                  <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] text-rose-300 font-bold">RESULT</span>
                  <div className="space-y-1">
                    <span className="text-rose-100 font-bold">Table Scan Output: Authentication Bypassed</span>
                    <p className="text-[11px] text-zinc-400">
                      Password verification is completely ignored because it was truncated behind the <code className="text-zinc-300">--</code> comment boundary. Database returns the first row:
                    </p>
                    <div className="bg-black/80 p-2 rounded text-[11px] text-emerald-400 border border-zinc-800">
                      {`{ "id": 1, "username": "admin", "role": "superadmin", "mfa_bypassed": true }`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setActiveStep(2)}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
              >
                ← Back to AST Mutation
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 text-xs font-semibold transition-colors"
              >
                <span>Proceed to Stage 4: Compiler Defense</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: Compiler Defense & Prepared Statements */}
        {activeStep === 4 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 font-bold text-xs">
                  04
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Stage 4: Prepared Statement Compiler Immunization</h3>
                  <p className="text-[11px] text-zinc-400">Mathematical &amp; compiler explanation of why parameterized queries eliminate SQL injection</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold">
                MATHEMATICALLY_IMMUNE
              </span>
            </div>

            {/* 2-Phase Compilation Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phase 1 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">
                    A
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-200">Phase 1: Compile Query Template</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded font-mono text-xs text-zinc-300 border border-zinc-800">
                  <span className="text-blue-400">PREPARE</span> stmt <span className="text-blue-400">FROM</span><br />
                  'SELECT * FROM users WHERE user = <span className="text-amber-400 font-bold">?</span> AND pass = <span className="text-amber-400 font-bold">?</span>';
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  The SQL parser compiles the query structure into bytecode <strong>before</strong> receiving any parameter values. The grammar syntax tree is compiled, frozen, and cached.
                </p>
              </div>

              {/* Phase 2 */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                    B
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-200">Phase 2: Bind Data Bytes</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded font-mono text-xs text-zinc-300 border border-zinc-800">
                  <span className="text-blue-400">EXECUTE</span> stmt <span className="text-blue-400">USING</span><br />
                  [<span className="text-emerald-400">"admin' OR '1'='1' --"</span>, <span className="text-emerald-400">"secret"</span>];
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                  The untrusted payload is transmitted over the wire protocol strictly as raw data bytes directly into the parameter memory slot. It is <strong>never</strong> re-parsed by the SQL compiler.
                </p>
              </div>
            </div>

            {/* Execution Proof Banner */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 font-mono text-xs space-y-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" /> THE COMPILER PROOF:
              </span>
              <p className="text-zinc-300 leading-relaxed">
                When the database runs the query plan, it searches for a user whose literal username is exactly the 21-character string: <br />
                <code className="text-emerald-300 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 mt-1 inline-block">
                  &quot;admin' OR '1'='1' --&quot;
                </code>
              </p>
              <p className="text-zinc-400 text-[11px]">
                The characters <code className="text-zinc-300">'</code>, <code className="text-zinc-300">OR</code>, and <code className="text-zinc-300">--</code> are treated purely as inert ASCII characters. Result: 0 rows returned. Injection is mathematically impossible.
              </p>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setActiveStep(3)}
                className="text-xs font-mono text-zinc-400 hover:text-zinc-200"
              >
                ← Back to Database Execution
              </button>
              <button
                onClick={() => setActiveStep(1)}
                className="flex items-center gap-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Restart Walkthrough</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
