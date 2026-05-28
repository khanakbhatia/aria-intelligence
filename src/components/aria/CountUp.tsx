import { useEffect, useRef, useState } from "react";

export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1500,
  delay = 0,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  delay?: number;
}) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            setTimeout(() => {
              const start = performance.now();
              const tick = (now: number) => {
                const p = Math.min(1, (now - start) / duration);
                // Cubic ease-out curve: f(p) = 1 - (1-p)^3
                const eased = 1 - Math.pow(1 - p, 3);
                setVal(Math.round(to * eased));
                if (p < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            }, delay);
          }
        });
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration, delay]);

  return (
    <span ref={ref}>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}