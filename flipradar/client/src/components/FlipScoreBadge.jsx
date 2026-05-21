export default function FlipScoreBadge({ score, size = 'md' }) {
  const numScore = Number(score);

  let colorClass;
  let glowClass;
  if (numScore >= 8) {
    colorClass = 'text-green-500 border-green-500/40 bg-green-500/10';
    glowClass = 'shadow-[0_0_12px_rgba(0,255,136,0.25)]';
  } else if (numScore >= 5) {
    colorClass = 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10';
    glowClass = 'shadow-[0_0_12px_rgba(250,204,21,0.2)]';
  } else {
    colorClass = 'text-red-400 border-red-400/40 bg-red-400/10';
    glowClass = '';
  }

  const sizeClass = size === 'lg'
    ? 'text-2xl font-bold px-3 py-1.5 min-w-[56px]'
    : size === 'sm'
    ? 'text-xs font-bold px-2 py-0.5 min-w-[32px]'
    : 'text-sm font-bold px-2.5 py-1 min-w-[40px]';

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg border font-mono ${colorClass} ${glowClass} ${sizeClass}`}
      title={`Flip Score: ${numScore}/10`}
    >
      {numScore}
      <span className="text-[0.6em] ml-0.5 opacity-70">/10</span>
    </div>
  );
}
