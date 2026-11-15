'use client';

export default function CodeBlock({ code, language = 'sql', highlight = false }) {
  return (
    <div className="relative rounded-lg border border-zinc-800 bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{language}</span>
      </div>
      <pre className={`overflow-x-auto p-3 text-sm code-font leading-relaxed ${highlight ? 'text-red-400' : 'text-zinc-300'}`}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
