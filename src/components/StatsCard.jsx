import { Shield, ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react';

const ICONS = {
  total: Shield,
  blocked: ShieldX,
  safe: ShieldCheck,
  alert: ShieldAlert,
};

export default function StatsCard({ label, value, type = 'total' }) {
  const Icon = ICONS[type] || Shield;
  const colors = {
    total: 'text-zinc-100 border-zinc-700',
    blocked: 'text-red-400 border-red-500/20',
    safe: 'text-emerald-400 border-emerald-500/20',
    alert: 'text-amber-400 border-amber-500/20',
  };

  return (
    <div className={`rounded-lg border bg-zinc-900 p-4 ${colors[type]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</span>
        <Icon className={`h-4 w-4 ${colors[type].split(' ')[0]}`} />
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
