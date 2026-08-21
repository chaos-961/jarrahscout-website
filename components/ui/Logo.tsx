import { asset } from '@/lib/asset';

/**
 * The association emblem. The source PNG had a solid white background, which is
 * unusable on the plum canvas, so it was keyed out to alpha and downsampled to
 * two web sizes. Dimensions are set explicitly to keep the header from jumping
 * while it loads.
 */
export function Logo({
  size = 'sm',
  className,
}: {
  size?: 'sm' | 'lg';
  className?: string;
}) {
  const src = size === 'lg' ? '/jarrah-logo.png' : '/jarrah-logo-sm.png';
  const [w, h] = size === 'lg' ? [462, 560] : [132, 160];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(src)}
      alt="Jarrah Scouts Association"
      width={w}
      height={h}
      className={className}
      draggable={false}
    />
  );
}
