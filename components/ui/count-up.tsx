"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "motion/react";

interface CountUpProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}

export function CountUp({
  value,
  duration = 1.5,
  className,
  format,
}: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const ref = React.useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplayValue(value);
      return;
    }

    let frame = 0;
    const totalFrames = Math.max(1, Math.round(duration * 60));

    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const nextValue = Math.round(progress * value);
      setDisplayValue(nextValue);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);

    return () => {
      frame = totalFrames;
    };
  }, [value, duration, inView, reduceMotion]);

  const formatter = format ?? ((val: number) => val.toLocaleString());

  return (
    <span ref={ref} className={className}>
      {formatter(displayValue)}
    </span>
  );
}
