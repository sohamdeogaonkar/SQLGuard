'use client';

import { useState } from 'react';
import { BookOpen, ShieldAlert, ShieldCheck } from 'lucide-react';
import CodeBlock from '../../components/CodeBlock';
import { buildVulnerableQuery, buildSecureQuery } from '../../lib/detector';

const scenarios = [
  { type: 'login', label: 'Login', defaultInput: { username: "admin' OR 1=1 --", password: 'anything' } },
  { type: 'search', label: 'Search', defaultInput: { query: "' UNION SELECT username, password FROM users --" } },
  { type: 'union', label: 'Product Lookup', defaultInput: { id: "0 UNION SELECT 1, username, password FROM users --" } },
];

export default function LearnPage() {
  const [active, setActive] = useState(0);
  const [input, setInput] = useState(scenarios[0].defaultInput);

  const scenario = scenarios[active];
  const vulnerable = buildVulnerableQuery(scenario.type, input);
  const secure = buildSecureQuery(scenario.type, input);

  const handleSwitch = (i) => {
    setActive(i);
    setInput(scenarios[i].defaultInput);
  };

  const serverCode = {
    login: {
      vulnerable: `// ❌ VULNERABLE — string concatenation\nconst sql = \`SELECT * FROM users\n  WHERE username = '\${username}'\n  AND password = '\${password}'\`;\ndb.execute(sql);`,
      secure: `// ✅ SECURE — parameterized query\nconst sql = 'SELECT * FROM users WHERE username = ? AND password = ?';\ndb.execute(sql, [username, password]);`,
    },
    search: {
      vulnerable: `// ❌ VULNERABLE — string concatenation\nconst sql = \`SELECT * FROM products\n  WHERE name LIKE '%\${query}%'\`;\ndb.execute(sql);`,
      secure: `// ✅ SECURE — parameterized query\nconst sql = 'SELECT * FROM products WHERE name LIKE ?';\ndb.execute(sql, [\`%\${query}%\`]);`,
    },
    union: {
      vulnerable: `// ❌ VULNERABLE — string concatenation\nconst sql = \`SELECT id, name, price\n  FROM products WHERE id = \${id}\`;\ndb.execute(sql);`,
      secure: `// ✅ SECURE — parameterized query\nconst sql = 'SELECT id, name, price FROM products WHERE id = ?';\ndb.execute(sql, [parseInt(id)]);`,
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-blue-400" />
          Vulnerable vs Secure
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          See the difference between string concatenation and parameterized queries.
        </p>
      </div>

      {/* Scenario selector */}
      <div className="flex gap-1">
        {scenarios.map((s, i) => (
          <button
            key={s.type}
            onClick={() => handleSwitch(i)}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
              active === i ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Input fields */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">User Input</h3>
        {scenario.type === 'login' ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Username</label>
              <input
                type="text"
                value={input.username || ''}
                onChange={e => setInput({ ...input, username: e.target.value })}
                className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm code-font text-zinc-200 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Password</label>
              <input
                type="text"
                value={input.password || ''}
                onChange={e => setInput({ ...input, password: e.target.value })}
                className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm code-font text-zinc-200 focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>
        ) : scenario.type === 'search' ? (
          <input
            type="text"
            value={input.query || ''}
            onChange={e => setInput({ ...input, query: e.target.value })}
            placeholder="Search term..."
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm code-font text-zinc-200 focus:border-amber-500/50 focus:outline-none"
          />
        ) : (
          <input
            type="text"
            value={input.id || ''}
            onChange={e => setInput({ ...input, id: e.target.value })}
            placeholder="Product ID..."
            className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm code-font text-zinc-200 focus:border-amber-500/50 focus:outline-none"
          />
        )}
      </div>

      {/* Side by side comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Vulnerable */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <h3 className="text-sm font-medium text-red-400">Vulnerable (String Concatenation)</h3>
          </div>
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2">
            <p className="text-xs text-zinc-500">Generated SQL:</p>
            <CodeBlock code={vulnerable} highlight={true} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Server code:</p>
            <CodeBlock code={serverCode[scenario.type].vulnerable} language="javascript" highlight={true} />
          </div>
        </div>

        {/* Secure */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-emerald-400">Secure (Parameterized Query)</h3>
          </div>
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2">
            <p className="text-xs text-zinc-500">Generated SQL:</p>
            <CodeBlock code={`${secure.query}\n-- Params: ${JSON.stringify(secure.params)}`} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 mb-1">Server code:</p>
            <CodeBlock code={serverCode[scenario.type].secure} language="javascript" />
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
        <h3 className="text-sm font-medium text-zinc-300">Why Parameterized Queries Work</h3>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold shrink-0">1.</span>
            <span><strong className="text-zinc-200">Separation of code and data</strong> — The SQL structure is defined first, then user input is bound as data values.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold shrink-0">2.</span>
            <span><strong className="text-zinc-200">Automatic escaping</strong> — The database driver handles escaping special characters, so quotes and keywords in input are treated as literal text.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold shrink-0">3.</span>
            <span><strong className="text-zinc-200">Prepared statements</strong> — The database compiles the query plan before seeing the data, making it impossible for input to alter the query structure.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-amber-500 font-bold shrink-0">4.</span>
            <span><strong className="text-zinc-200">Type safety</strong> — Parameters can be type-checked (e.g., ensuring an ID is an integer) before the query runs.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
