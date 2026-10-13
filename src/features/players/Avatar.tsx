import { cn } from '@/shared/lib/cn';
import { mediaUrl } from '@/shared/lib/media';

const SIZES = {
  sm: 'size-7 text-xs',
  md: 'size-9 text-sm',
  lg: 'size-16 text-xl',
  xl: 'size-24 text-3xl',
} as const;

/** Аватарка игрока, а без неё — первая буква имени. */
export function Avatar({
  name,
  url,
  size = 'md',
  className,
}: {
  name: string;
  url?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const shared = cn('shrink-0 rounded-full', SIZES[size], className);
  const src = mediaUrl(url);

  if (src) {
    return <img src={src} alt="" className={cn(shared, 'object-cover')} />;
  }

  return (
    <span
      aria-hidden
      className={cn(shared, 'bg-brand/10 text-brand flex items-center justify-center font-bold')}
    >
      {name.trim().charAt(0).toLocaleUpperCase('ru-RU') || '?'}
    </span>
  );
}
