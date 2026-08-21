/** The scout mark, drawn once and reused for pins, the navbar and the favicon. */
export function FleurDeLis({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c1.7 2.5 2.5 4.8 2.5 7.1 0 2-.5 3.6-1.3 4.9h-2.4c-.8-1.3-1.3-2.9-1.3-4.9 0-2.3.8-4.6 2.5-7.1Z" />
      <path d="M10.3 14.2C7.6 13.9 5.4 12.6 4.2 10.7 3 8.8 2.9 6.8 3.8 5.4c1.6.5 3.1 1.9 4.3 3.7 1.1 1.7 1.7 3.5 1.8 5.1Z" />
      <path d="M13.7 14.2c2.7-.3 4.9-1.6 6.1-3.5 1.2-1.9 1.3-3.9.4-5.3-1.6.5-3.1 1.9-4.3 3.7-1.1 1.7-1.7 3.5-1.8 5.1Z" />
      <rect x="6.9" y="14.4" width="10.2" height="2.4" rx="1.2" />
      <path d="M10.4 17.2h3.2l.6 4.1a.7.7 0 0 1-.7.8h-3a.7.7 0 0 1-.7-.8l.6-4.1Z" />
    </svg>
  );
}

/** A single event: medallion pin with a pointer, gold when selected. */
export function EventPin({ selected }: { selected: boolean }) {
  const body = selected ? '#C9A227' : '#1B4332';
  const ring = selected ? '#F4E8C2' : '#C9A227';

  return (
    <svg viewBox="0 0 40 50" width="40" height="50" aria-hidden="true">
      <path d="M20 46 13.2 30h13.6L20 46Z" fill={body} />
      <circle cx="20" cy="19" r="15.4" fill={body} stroke={ring} strokeWidth="1.5" />
      <g transform="translate(20 19) scale(0.6) translate(-12 -12)" fill="#FAF6EE">
        <path d="M12 2.2c1.7 2.5 2.5 4.8 2.5 7.1 0 2-.5 3.6-1.3 4.9h-2.4c-.8-1.3-1.3-2.9-1.3-4.9 0-2.3.8-4.6 2.5-7.1Z" />
        <path d="M10.3 14.2C7.6 13.9 5.4 12.6 4.2 10.7 3 8.8 2.9 6.8 3.8 5.4c1.6.5 3.1 1.9 4.3 3.7 1.1 1.7 1.7 3.5 1.8 5.1Z" />
        <path d="M13.7 14.2c2.7-.3 4.9-1.6 6.1-3.5 1.2-1.9 1.3-3.9.4-5.3-1.6.5-3.1 1.9-4.3 3.7-1.1 1.7-1.7 3.5-1.8 5.1Z" />
        <rect x="6.9" y="14.4" width="10.2" height="2.4" rx="1.2" />
        <path d="M10.4 17.2h3.2l.6 4.1a.7.7 0 0 1-.7.8h-3a.7.7 0 0 1-.7-.8l.6-4.1Z" />
      </g>
    </svg>
  );
}

/** Several overlapping events, collapsed to a count. Grows with the group. */
export function ClusterPin({ count }: { count: number }) {
  const size = count < 5 ? 44 : count < 12 ? 52 : 60;
  const r = size / 2 - 3;

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={r + 2.5} fill="#1B4332" opacity="0.14" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="#1B4332"
        stroke="#C9A227"
        strokeWidth="1.5"
      />
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FAF6EE"
        fontSize={count > 99 ? 14 : 16}
        fontWeight={600}
        fontFamily="var(--font-body), system-ui, sans-serif"
      >
        {count}
      </text>
    </svg>
  );
}
