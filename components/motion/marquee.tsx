/*
  Marquee-стрічка (за Transio testimonials): безкінечний горизонтальний трек.
  Контент дублюється двічі — коли перша копія повністю зникає ліворуч (-100%),
  друга займає її місце без стрибка. Пауза на hover; вимкнення в reduced-motion
  керується CSS у globals.css.
*/
export function Marquee({
  children,
  reverse = false,
  durationSec = 46,
  gap = "1.5rem",
  className = "",
}: {
  children: React.ReactNode;
  reverse?: boolean;
  durationSec?: number;
  gap?: string;
  className?: string;
}) {
  return (
    <div
      className={`marquee marquee-mask ${className}`}
      data-reverse={reverse}
      style={
        {
          "--marquee-duration": `${durationSec}s`,
          "--marquee-gap": gap,
        } as React.CSSProperties
      }
    >
      <div className="marquee-track" aria-hidden={false}>
        {children}
      </div>
      <div className="marquee-track" aria-hidden={true}>
        {children}
      </div>
    </div>
  );
}
