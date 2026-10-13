import { useMemo } from 'react';

const COLORS = ['#22c55e', '#fbbf24', '#ef4444', '#3b82f6', '#a855f7', '#f97316'];
const PIECES = 90;

/**
 * Родитель перемонтирует компонент через `key`, когда появляется новый
 * чемпион — это дешевле и надёжнее, чем сбрасывать CSS-анимацию у живого узла.
 */
export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}vw`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        duration: `${1.5 + Math.random() * 2.5}s`,
        delay: `${Math.random() * 2}s`,
        size: `${6 + Math.random() * 8}px`,
      })),
    [],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className="animate-confetti absolute top-0 block rounded-sm"
          style={{
            left: piece.left,
            background: piece.color,
            animationDuration: piece.duration,
            animationDelay: piece.delay,
            width: piece.size,
            height: piece.size,
          }}
        />
      ))}
    </div>
  );
}
