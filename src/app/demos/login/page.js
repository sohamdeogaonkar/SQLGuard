'use client';

import { FlaskConical, AlertTriangle } from 'lucide-react';
import CodeBlock from '../../../components/CodeBlock';

const attacks = [
  {
    title: '1. Basic Tautology',
    username: "' OR 1=1 --",
    password: 'anything',
    vulnerable_sql: "SELECT * FROM users WHERE username = '' OR 1=1 --' AND password = 'anything'",
    explanation: 'The condition OR 1=1 is always true, so the query returns all users. The -- comments out the rest of the query, bypassing the password check entirely.',
    result: '✓ Login bypassed — attacker gains access as the first user in the table',
  },
  {
    title: '2. Admin Bypass',
    username: "admin'--",
    password: '',
    vulnerable_sql: "SELECT * FROM users WHERE username = 'admin'--' AND password = ''",
    explanation: "The single quote closes the username string. The -- comments out the password check. If an 'admin' user exists, the attacker logs in as admin.",
    result: '✓ Login bypassed — attacker gains admin access without knowing the password',
  },
  {
    title: '3. String Equality Bypass',
    username: "' OR ''='",
    password: "' OR ''='",
    vulnerable_sql: "SELECT * FROM users WHERE username = '' OR ''='' AND password = '' OR ''=''",
    explanation: "The condition ''='' is always true (empty string equals empty string). Both the username and password checks are bypassed.",
    result: '✓ Login bypassed — universal authentication bypass',
  },
];

export default function LoginDemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-zinc-400" />
          Login Injection Demo
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Demonstrates how SQL injection can bypass authentication in vulnerable login forms.
        </p>
      </div>

      {/* Vulnerable form mockup */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">Vulnerable Login Form (Demo Only)</span>
        </div>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Username</label>
            <input
              type="text"
              disabled
              placeholder="Enter username"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Password</label>
            <input
              type="password"
              disabled
              placeholder="Enter password"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-500 cursor-not-allowed"
            />
          </div>
          <button disabled className="rounded bg-zinc-700 px-4 py-2 text-sm text-zinc-500 cursor-not-allowed">
            Login (Disabled)
          </button>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          ↑ This form is for display only. See below for how injection attacks work.
        </p>
      </div>

      {/* Vulnerable query template */}
      <div>
        <h3 className="text-sm font-medium text-zinc-300 mb-2">Vulnerable Query Template</h3>
        <CodeBlock
          code={`SELECT * FROM users WHERE username = '{user_input}' AND password = '{pass_input}'`}
          highlight={true}
        />
        <p className="mt-2 text-xs text-zinc-500">
          User input is directly concatenated into the SQL string — no sanitization or parameterization.
        </p>
      </div>

      {/* Attack examples */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Attack Examples</h2>
        {attacks.map((a, i) => (
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            <h3 className="font-medium text-zinc-100">{a.title}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-zinc-500">Username</span>
                <p className="code-font text-amber-400">{a.username}</p>
              </div>
              <div>
                <span className="text-xs text-zinc-500">Password</span>
                <p className="code-font text-amber-400">{a.password || '(empty)'}</p>
              </div>
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
        <CodeBlock code={`SELECT * FROM users WHERE username = ? AND password = ?\n-- Parameters: [user_input, pass_input]`} />
        <p className="text-sm text-zinc-400">
          With parameterized queries, user input is treated as data, not SQL code.
          The database engine handles escaping automatically, making injection impossible.
        </p>
      </div>
    </div>
  );
}
