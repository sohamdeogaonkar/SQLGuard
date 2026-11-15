'use client';

import { useState, useCallback } from 'react';
import { Terminal, Zap, Trash2 } from 'lucide-react';
import { detectSQLInjection } from '../../../lib/detector';
import { addLog } from '../../../lib/store';
import DetectionResult from '../../../components/DetectionResult';

const EXAMPLES = [
  { label: 'Safe input', value: 'john_doe' },
  { label: 'Tautology', value: "' OR 1=1 --" },
  { label: 'UNION SELECT', value: "' UNION SELECT username, password FROM users --" },
  { label: 'Stacked query', value: "'; DROP TABLE users; --" },
  { label: 'Time-based', value: "' OR SLEEP(5) --" },
  { label: 'Comment bypass', value: "admin'--" },
  { label: 'CHAR obfuscation', value: "' OR CHAR(49)=CHAR(49) --" },
  { label: 'Subquery', value: "' OR (SELECT COUNT(*) FROM users) > 0 --" },
  { label: 'Data exfil', value: "' UNION SELECT LOAD_FILE('/etc/passwd') --" },
  { label: 'Boolean blind', value: "' AND SUBSTRING(username,1,1)='a' --" },
];

export default function PlaygroundPage() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const analyze = useCallback(() => {
    if (!input.trim()) return;
    const r = detectSQLInjection(input);
    setResult(r);
    addLog(r);
  }, [input]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Terminal className="h-6 w-6 text-amber-500" />
          Detection Playground
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Enter any input to analyze it for SQL injection patterns.
        </p>
      </div>

      {/* Example payloads */}
      <div className="space-y-2">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Example Payloads</span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => { setInput(ex.value); }}
              className="rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-300">Input to Analyze</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="Enter a potentially malicious SQL input..."
            className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm code-font text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20"
          />
          <button
            onClick={analyze}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-zinc-950 hover:bg-amber-400 transition-colors"
          >
            <Zap className="h-4 w-4" />
            Analyze
          </button>
          <button
            onClick={() => { setInput(''); setResult(null); }}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Result */}
      {result && <DetectionResult result={result} />}

      {/* How it works */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-300 mb-2">How It Works</h3>
        <ol className="space-y-1 text-sm text-zinc-500 list-decimal list-inside">
          <li>Your input is tested against 12+ regex-based SQL injection patterns</li>
          <li>Each matched pattern has a severity weight (1–10)</li>
          <li>Severity scores are combined and normalized to a 0–100 risk score</li>
          <li>The input is classified as Safe, Low, Medium, High, or Critical risk</li>
          <li>An explanation is generated describing detected threats</li>
        </ol>
      </div>
    </div>
  );
}
