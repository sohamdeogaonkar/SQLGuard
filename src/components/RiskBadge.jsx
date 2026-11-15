export default function RiskBadge({ level, score }) {
  const colors = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  const dotColors = {
    emerald: 'bg-emerald-400',
    yellow: 'bg-yellow-400',
    amber: 'bg-amber-400',
    orange: 'bg-orange-400',
    red: 'bg-red-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[level?.color] || colors.emerald}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[level?.color] || dotColors.emerald}`} />
      {level?.label || 'Safe'}{score !== undefined ? ` (${score})` : ''}
    </span>
  );
}
