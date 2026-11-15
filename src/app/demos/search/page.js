'use client';

import { FlaskConical, AlertTriangle } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock';

const attacks = [
  {
    title: '1. UNION-based Data Extraction',
    input: "' UNION SELECT username, password FROM users --",
    vulnerable_sql: "SELECT * FROM products WHERE name LIKE '%' UNION SELECT username, password FROM users --%'",
    explanation: "The attacker closes the LIKE pattern and appends a UNION SELECT to extract data from the users table. The -- comments out the trailing %'.",
    result: '✓ Attacker extracts usernames and passwords alongside product results',
  },
  {
    title: '2. Boolean-based Probing',
    input: "' AND 1=1 --",
    vulnerable_sql: "SELECT * FROM products WHERE name LIKE '%' AND 1=1 --%'",
    explanation: 'If the page returns results, the attacker knows the injection point works. They can then replace 1=1 with conditions to extract data.',
    result: '✓ Confirms the search field is injectable',
  },
  {
    title: '3. Destructive Stacked Query',
    input: "'; DROP TABLE products; --",
    vulnerable_sql: "SELECT * FROM products WHERE name LIKE '%'; DROP TABLE products; --%'",
    explanation: 'The semicolon terminates the original query and starts a new one that drops the entire products table.',
    result: '✓ Entire products table deleted from the database',
  },
];

export default function SearchDemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-zinc-400" />
          Search Injection Demo
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Demonstrates how SQL injection can exploit search functionality to extract or destroy data.
        </p>
      </div>

      {/* Vulnerable form mockup */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Vulnerable Search Bar (Demo Only)</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            disabled
            placeholder="Search products..."
            className="flex-1 rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
          />
          <button disabled className="rounded bg-zinc-700 px-4 py-2 text-sm text-zinc-500 cursor-not-allowed">
            Search (Disabled)
          </button>
        </div>
        <p className="text-xs text-zinc-600">
          ↑ This search bar is for display only. See below for how injection attacks work.
        </p>
      </div>

      {/* Vulnerable query template */}
      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-2">Vulnerable Query Template</h3>
        <CodeBlock
          code={`SELECT * FROM products WHERE name LIKE '%{user_input}%'`}
          highlight={true}
        />
      </div>

      {/* Attack examples */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Attack Examples</h2>
        {attacks.map((a, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            <h3 className="font-medium text-zinc-100">{a.title}</h3>
            <div>
              <span className="text-xs text-zinc-500">Malicious Input</span>
              <p className="code-font text-amber-400 text-sm">{a.input}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-500 block mb-1">Resulting SQL</span>
              <CodeBlock code={a.vulnerable_sql} highlight={true} />
            </div>
            <p className="text-sm text-zinc-400">{a.explanation}</p>
            <div className="rounded border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-400">
              {a.result}
            </div>
          </div>
        ))}
      </div>

      {/* Secure version */}
      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
        <h3 className="font-medium text-emerald-400">✓ Secure Version — Parameterized Query</h3>
        <CodeBlock code={`SELECT * FROM products WHERE name LIKE ?\n-- Parameters: ['%user_input%']`} />
        <p className="text-sm text-zinc-400">
          The search term is passed as a parameter. Even if it contains SQL keywords,
          the database treats it as a literal string value, not as SQL code.
        </p>
      </div>
    </div>
  );
}
